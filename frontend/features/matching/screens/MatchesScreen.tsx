import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';

import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Plane,
  RefreshCcw,
  UserRound,
} from 'lucide-react-native';

import { api, mediaUrl } from '@/lib/api';
import { useApiResource } from '@/lib/data';
import { useAuth } from '@/lib/auth';

import {
  colors,
  Header,
  Screen,
} from '@/components/ui';

import {
  Match,
  SwapType,
  getMatchSwaps,
  getMatchedProfile,
  hasActiveRequest,
  labelize,
  profileName,
  swapMeta,
  swapTitle,
} from '@/lib/crewswap';

const filters: ('ALL' | SwapType)[] = [
  'ALL',
  'FLIGHT',
  'LEAVE',
  'ACCOMMODATION',
];

/* =========================================================
   TYPE ICON
========================================================= */

function getTypeIcon(type: SwapType) {
  switch (type) {
    case 'FLIGHT':
      return Plane;

    case 'LEAVE':
      return CalendarDays;

    case 'ACCOMMODATION':
      return Building2;

    default:
      return Plane;
  }
}

/* =========================================================
   TYPE COLORS
========================================================= */

function getTypeColors(type: SwapType) {
  switch (type) {
    case 'FLIGHT':
      return {
        background: '#EEF4FF',
        icon: '#4169E1',
      };

    case 'LEAVE':
      return {
        background: '#F3EEFF',
        icon: '#7957D5',
      };

    case 'ACCOMMODATION':
      return {
        background: '#FFF4E5',
        icon: '#D88900',
      };

    default:
      return {
        background: '#EEF1F6',
        icon: colors.ink,
      };
  }
}

/* =========================================================
   FILTER ICON
========================================================= */

function FilterIcon({
  type,
  color,
}: {
  type: 'ALL' | SwapType;
  color: string;
}) {
  if (type === 'ALL') {
    return (
      <CheckCircle2
        size={13}
        color={color}
        strokeWidth={2.4}
      />
    );
  }

  const Icon = getTypeIcon(type);

  return (
    <Icon
      size={13}
      color={color}
      strokeWidth={2.2}
    />
  );
}

/* =========================================================
   MAIN SCREEN
========================================================= */

export default function Matches() {
  const { user } = useAuth();

  const [filter, setFilter] =
    useState<'ALL' | SwapType>('ALL');

  const [message, setMessage] = useState('');
  const [busyId, setBusyId] =
    useState<string | null>(null);

  const [refreshing, setRefreshing] =
    useState(false);

  const {
    data,
    loading,
    error,
    reload,
  } = useApiResource(
    () => api<Match[]>('/matches'),
    [],
  );

  const visible = (data ?? []).filter(
    (item) =>
      filter === 'ALL' ||
      item.type === filter,
  );

  /* =========================================================
     REFRESH MATCHES
  ========================================================= */

  const recompute = async () => {
    setMessage('');
    setRefreshing(true);

    try {
      await api('/matches/recompute', {
        method: 'POST',
        body:
          filter === 'ALL'
            ? undefined
            : JSON.stringify({
                type: filter,
              }),
      });

      setMessage(
        'Matches refreshed successfully.',
      );

      await reload();
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : 'Could not refresh matches.',
      );
    } finally {
      setRefreshing(false);
    }
  };

  /* =========================================================
     SEND REQUEST
  ========================================================= */

  const sendRequest = async (
    matchId: string,
  ) => {
    setBusyId(matchId);
    setMessage('');

    try {
      await api('/requests', {
        method: 'POST',
        body: JSON.stringify({
          matchId,
        }),
      });

      setMessage(
        'Request sent successfully.',
      );

      await reload();
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : 'Could not send request.',
      );
    } finally {
      setBusyId(null);
    }
  };

  const isErrorMessage =
    message.includes('Could not') ||
    message.includes('already');

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <Screen scroll>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <Header
        title="Matches"
        back={() => router.back()}
        right={
          <Pressable
            onPress={recompute}
            disabled={refreshing}
            className="h-[39px] w-[39px] items-center justify-center rounded-[13px] bg-[#EEF1F6]"
            style={({ pressed }) => ({
              opacity:
                pressed || refreshing
                  ? 0.55
                  : 1,
            })}
          >
            {refreshing ? (
              <ActivityIndicator
                size="small"
                color={colors.ink}
              />
            ) : (
              <RefreshCcw
                size={17}
                color={colors.ink}
                strokeWidth={2.2}
              />
            )}
          </Pressable>
        }
      />

      {/* =====================================================
          INTRO
      ===================================================== */}

      <View className="mx-5 mt-[6px] mb-[18px] flex-row items-center justify-between">

        <View className="flex-1">
          <Text className="text-[11px] text-[#8A8F9B]">
            Find compatible crew swap matches
          </Text>
        </View>

        <View className="h-[39px] min-w-[39px] items-center justify-center rounded-[13px] bg-[#EEF1F6] px-[10px]">
          <Text className="text-[13px] font-black text-[#182333]">
            {visible.length}
          </Text>
        </View>
      </View>

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <View className="mx-5 mb-5">

        <Text className="mb-2 text-[9px] font-black uppercase tracking-[0.8px] text-[#8A8F9B]">
          Filter matches
        </Text>

        <View className="flex-row rounded-[14px] border border-[#E7E8EC] bg-white p-1">

          {filters.map((item) => {
            const selected =
              filter === item;

            const iconColor = selected
              ? '#FFFFFF'
              : colors.muted;

            return (
              <Pressable
                key={item}
                onPress={() => {
                  setFilter(item);
                  setMessage('');
                }}
                className={`min-h-[40px] flex-1 flex-row items-center justify-center gap-[5px] rounded-[10px] px-1 ${
                  selected
                    ? 'bg-[#FCAF01]'
                    : ''
                }`}
                style={({ pressed }) => ({
                  opacity: pressed
                    ? 0.7
                    : 1,
                })}
              >
                <FilterIcon
                  type={item}
                  color={iconColor}
                />

                <Text
                  className={`text-[8px] ${
                    selected
                      ? 'font-black text-white'
                      : 'font-extrabold text-[#8A8F9B]'
                  }`}
                  numberOfLines={1}
                >
                  {item === 'ALL'
                    ? 'All'
                    : labelize(item)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading && (
        <View className="flex-row items-center justify-center gap-[9px] py-[25px]">
          <ActivityIndicator
            size="small"
            color={colors.amber}
          />

          <Text className="text-[11px] text-[#8A8F9B]">
            Finding compatible matches...
          </Text>
        </View>
      )}

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && !loading && (
        <View className="mx-5 mb-[14px] flex-row gap-[10px] rounded-[14px] border border-[#FFD6D6] bg-[#FFF1F1] p-[13px]">

          <View className="h-[30px] w-[30px] items-center justify-center rounded-[9px] bg-[#FFE0E0]">
            <Text className="text-[14px] font-black text-[#D64545]">
              !
            </Text>
          </View>

          <View className="flex-1">
            <Text className="text-[11px] font-black text-[#D64545]">
              Something went wrong
            </Text>

            <Text className="mt-[3px] text-[10px] leading-[15px] text-[#D64545]">
              {error}
            </Text>
          </View>
        </View>
      )}

      {/* =====================================================
          MESSAGE
      ===================================================== */}

      {message && !loading && (
        <View
          className={`mx-5 mb-[14px] flex-row items-center gap-2 rounded-[11px] px-3 py-[10px] ${
            isErrorMessage
              ? 'bg-[#FFF0F0]'
              : 'bg-[#EAF7EF]'
          }`}
        >
          {isErrorMessage ? (
            <RefreshCcw
              size={15}
              color={colors.red}
            />
          ) : (
            <CheckCircle2
              size={16}
              color={colors.green}
            />
          )}

          <Text
            className={`flex-1 text-[10px] font-bold ${
              isErrorMessage
                ? 'text-[#D64545]'
                : 'text-[#21A45B]'
            }`}
          >
            {message}
          </Text>
        </View>
      )}

      {/* =====================================================
          EMPTY STATE
      ===================================================== */}

      {!loading && !visible.length && (
        <View className="mx-5 mt-2 items-center rounded-[18px] border border-[#E7E8EC] bg-white px-[25px] py-8">

          <View className="mb-[13px] h-[54px] w-[54px] items-center justify-center rounded-[17px] bg-[#EEF1F6]">
            <RefreshCcw
              size={24}
              color={colors.muted}
              strokeWidth={2}
            />
          </View>

          <Text className="text-[16px] font-black text-[#182333]">
            No matches yet
          </Text>

          <Text className="mt-[7px] max-w-[280px] text-center text-[10px] leading-4 text-[#8A8F9B]">
            No compatible swaps were found for
            the selected filter.
          </Text>

          <Pressable
            onPress={recompute}
            disabled={refreshing}
            className="mt-4 min-h-[38px] flex-row items-center justify-center gap-[6px] rounded-[10px] bg-[#FEF7EF] px-4"
            style={({ pressed }) => ({
              opacity:
                pressed || refreshing
                  ? 0.6
                  : 1,
            })}
          >
            {refreshing ? (
              <ActivityIndicator
                size="small"
                color={colors.ink}
              />
            ) : (
              <RefreshCcw
                size={14}
                color={colors.ink}
              />
            )}

            <Text className="text-[9px] font-black text-[#182333]">
              Refresh matches
            </Text>
          </Pressable>
        </View>
      )}

      {/* =====================================================
          MATCH LIST
      ===================================================== */}

      {!loading && visible.length > 0 && (
        <View className="mx-5 gap-[14px] pb-[25px]">

          <View className="flex-row items-center justify-between">
            <Text className="text-[10px] font-black uppercase tracking-[0.8px] text-[#8A8F9B]">
              Available matches
            </Text>

            <View className="flex-row items-center gap-[5px]">
              <View className="h-[6px] w-[6px] rounded-full bg-[#21A45B]" />

              <Text className="text-[8px] font-bold text-[#8A8F9B]">
                {visible.length} available
              </Text>
            </View>
          </View>

          {visible.map((item) => {
            const [swapA, swapB] =
              getMatchSwaps(item);

            const typeColors =
              getTypeColors(item.type);

            const TypeIcon =
              getTypeIcon(item.type);

            const matchedProfile =
              getMatchedProfile(
                item,
                user?.id,
              );

            const fullName =
              profileName(
                matchedProfile,
                `${labelize(item.type)} Match`,
              );

            const photoUrl =
              mediaUrl(
                matchedProfile?.photoUrl,
              );

            const userRank =
              matchedProfile?.rank
                ? labelize(
                    matchedProfile.rank,
                  )
                : 'Crew member';

            const requestAlreadySent =
              hasActiveRequest(
                item,
                user?.id,
              );

            const isBusy =
              busyId === item.id;

            return (
              <Pressable
                key={item.id}
                onPress={() =>
                  router.push({
                    pathname:
                      '/swap-detail',
                    params: {
                      id: item.id,
                    },
                  })
                }
                className="rounded-[18px] border border-[#E7E8EC] bg-white p-[15px]"
                style={({ pressed }) => ({
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 3,
                  },
                  shadowOpacity: 0.045,
                  shadowRadius: 8,
                  elevation: 2,
                  opacity: pressed
                    ? 0.96
                    : 1,
                })}
              >

                {/* =================================================
                    PROFILE HEADER
                ================================================= */}

                <View className="flex-row items-center justify-between gap-[10px]">

                  <View className="flex-1 flex-row items-center gap-[10px]">

                    {photoUrl ? (
                      <Image
                        source={{
                          uri: photoUrl,
                        }}
                        accessibilityLabel={`${fullName} profile photo`}
                        className="h-[45px] w-[45px] rounded-[14px] bg-[#EEF1F6]"
                      />
                    ) : (
                      <View
                        className="h-[45px] w-[45px] items-center justify-center rounded-[14px]"
                        style={{
                          backgroundColor:
                            typeColors.background,
                        }}
                      >
                        <UserRound
                          size={22}
                          color={
                            typeColors.icon
                          }
                          strokeWidth={2}
                        />
                      </View>
                    )}

                    <View className="flex-1">
                      <Text
                        className="text-[13px] font-black text-[#182333]"
                        numberOfLines={1}
                      >
                        {fullName}
                      </Text>

                      <Text
                        className="mt-1 text-[9px] font-semibold text-[#8A8F9B]"
                        numberOfLines={1}
                      >
                        {userRank}
                      </Text>
                    </View>
                  </View>

                  {/* =================================================
                      MATCH SCORE
                  ================================================= */}

                  <View className="h-[38px] min-w-[50px] items-center justify-center rounded-[9px] bg-[#EAF7EF] px-[8px]">

                    <Text className="text-[12px] font-black text-[#21A45B]">
                      {item.score}%
                    </Text>

                    <Text className="text-[7px] font-black uppercase text-[#21A45B]">
                      match
                    </Text>
                  </View>
                </View>

                {/* =================================================
                    SWAP TYPE
                ================================================= */}

                <View className="mt-[13px] flex-row items-center">

                  <View
                    className="h-[32px] w-[32px] items-center justify-center rounded-[10px]"
                    style={{
                      backgroundColor:
                        typeColors.background,
                    }}
                  >
                    <TypeIcon
                      size={15}
                      color={
                        typeColors.icon
                      }
                      strokeWidth={2.2}
                    />
                  </View>

                  <View className="ml-[9px] flex-1">
                    <Text className="text-[11px] font-black text-[#182333]">
                      {labelize(item.type)} Swap
                    </Text>

                    <Text className="mt-[2px] text-[8px] text-[#8A8F9B]">
                      Compatible crew swap
                    </Text>
                  </View>

                  <View
                    className="rounded-[8px] px-[8px] py-[5px]"
                    style={{
                      backgroundColor:
                        typeColors.background,
                    }}
                  >
                    <Text
                      className="text-[7px] font-black uppercase"
                      style={{
                        color:
                          typeColors.icon,
                      }}
                    >
                      {labelize(
                        item.type,
                      )}
                    </Text>
                  </View>
                </View>

                {/* =================================================
                    SWAP SUMMARY
                ================================================= */}

                <View className="mt-[13px] rounded-[13px] border border-[#F0F0F2] bg-[#FAFAFB] p-3">

                  <Text className="mb-[9px] text-[7px] font-black tracking-[0.7px] text-[#8A8F9B]">
                    SWAP SUMMARY
                  </Text>

                  <View className="flex-row items-center">

                    {/* YOUR SWAP */}

                    <View className="flex-1 pr-1">

                      <View className="mb-[5px] flex-row items-center">
                        <View className="h-[5px] w-[5px] rounded-full bg-[#FCAF01]" />

                        <Text className="ml-[5px] text-[7px] font-black uppercase text-[#8A8F9B]">
                          Your swap
                        </Text>
                      </View>

                      <Text
                        className="text-[9px] font-extrabold leading-[14px] text-[#182333]"
                        numberOfLines={3}
                      >
                        {swapTitle(
                          swapA,
                          item.type,
                        )}
                      </Text>
                    </View>

                    {/* ARROW */}

                    <View className="mx-2 h-[28px] w-[28px] items-center justify-center rounded-full bg-white">
                      <ArrowRight
                        size={13}
                        color={colors.ink}
                        strokeWidth={2.2}
                      />
                    </View>

                    {/* COMPATIBLE */}

                    <View className="flex-1 pl-1">

                      <View className="mb-[5px] flex-row items-center">
                        <View className="h-[5px] w-[5px] rounded-full bg-[#21A45B]" />

                        <Text className="ml-[5px] text-[7px] font-black uppercase text-[#8A8F9B]">
                          Compatible
                        </Text>
                      </View>

                      <Text
                        className="text-[9px] font-extrabold leading-[14px] text-[#182333]"
                        numberOfLines={3}
                      >
                        {swapTitle(
                          swapB,
                          item.type,
                        )}
                      </Text>
                    </View>
                  </View>

                  {/* MORE DETAILS */}

                  </View>

                {/* =================================================
                    MATCH REASONS
                ================================================= */}

                <View className="mt-[10px] flex-row items-center gap-[7px]">

                  <TypeIcon
                    size={13}
                    color={
                      typeColors.icon
                    }
                    strokeWidth={2}
                  />

                  <Text
                    className="flex-1 text-[9px] leading-[14px] text-[#8A8F9B]"
                    numberOfLines={2}
                  >
                    {item.reasons.join(
                      ' • ',
                    ) ||
                      swapMeta(
                        swapB,
                        item.type,
                      )}
                  </Text>
                </View>

                {/* =================================================
                    ACTIONS
                ================================================= */}

                <View className="mt-[13px] flex-row gap-2">

                  {/* VIEW DETAILS */}

                  <Pressable
                    onPress={(event) => {
                      event.stopPropagation();

                      router.push({
                        pathname:
                          '/swap-detail',
                        params: {
                          id: item.id,
                        },
                      });
                    }}
                    className="min-h-[39px] flex-1 flex-row items-center justify-center gap-[2px] rounded-[10px] border border-[#E7E8EC] bg-white"
                    style={({ pressed }) => ({
                      opacity: pressed
                        ? 0.65
                        : 1,
                    })}
                  >
                    <Text className="text-[9px] font-black text-[#182333]">
                      View details
                    </Text>

                    <ChevronRight
                      size={14}
                      color={colors.ink}
                    />
                  </Pressable>

                  {/* SEND REQUEST */}

                  <Pressable
                    disabled={
                      isBusy ||
                      requestAlreadySent
                    }
                    onPress={(event) => {
                      event.stopPropagation();

                      sendRequest(
                        item.id,
                      );
                    }}
                    className={`min-h-[39px] flex-[1.25] flex-row items-center justify-center rounded-[10px] px-3 ${
                      requestAlreadySent
                        ? 'bg-[#EAF7EF]'
                        : 'bg-[#FCAF01]'
                    }`}
                    style={({ pressed }) => ({
                      opacity:
                        pressed || isBusy
                          ? 0.55
                          : 1,
                    })}
                  >
                    {isBusy ? (
                      <ActivityIndicator
                        size="small"
                        color="#FFFFFF"
                      />
                    ) : requestAlreadySent ? (
                      <>
                        <CheckCircle2
                          size={14}
                          color={
                            colors.green
                          }
                        />

                        <Text className="ml-[5px] text-[9px] font-black text-[#21A45B]">
                          Request Sent
                        </Text>
                      </>
                    ) : (
                      <Text className="text-[9px] font-black text-white">
                        Send request
                      </Text>
                    )}
                  </Pressable>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* =====================================================
          FOOTER INFO
      ===================================================== */}

      {!loading && visible.length > 0 && (
        <View className="mx-5 mb-[25px] items-center">
          <Text className="text-center text-[9px] leading-[14px] text-[#8A8F9B]">
            Matches are based on compatible swap
            type, crew profile and available dates.
          </Text>
        </View>
      )}
    </Screen>
  );
}
