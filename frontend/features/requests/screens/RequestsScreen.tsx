import { useCallback, useEffect, useState } from 'react';
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
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Send,
  UserRound,
  X,
} from 'lucide-react-native';

import { api, mediaUrl } from '@/lib/api';

import {
  colors,
  Header,
  Screen,
} from '@/components/ui';

import {
  RequestItem,
  labelize,
} from '@/lib/crewswap';

/* =========================================================
   TYPES
========================================================= */

type Tab = 'received' | 'sent';

/* =========================================================
   STATUS COLORS
========================================================= */

function getStatusColors(
  status: RequestItem['status'],
) {
  switch (status) {
    case 'PENDING':
      return {
        background: '#FFF4E5',
        text: '#D88900',
        icon: '#D88900',
      };

    case 'ACCEPTED':
      return {
        background: '#EAF7EF',
        text: '#21A45B',
        icon: '#21A45B',
      };

    case 'REJECTED':
    case 'CANCELLED':
      return {
        background: '#FFF0F0',
        text: '#D64545',
        icon: '#D64545',
      };

    default:
      return {
        background: '#EEF1F6',
        text: colors.muted,
        icon: colors.muted,
      };
  }
}

/* =========================================================
   SWAP TYPE COLORS
========================================================= */

function getTypeColors(type: string) {
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
   TYPE ICON
========================================================= */

function getTypeIcon(type: string) {
  switch (type) {
    case 'FLIGHT':
      return Send;

    case 'LEAVE':
      return Clock3;

    case 'ACCOMMODATION':
      return UserRound;

    default:
      return Send;
  }
}

/* =========================================================
   MAIN SCREEN
========================================================= */

export default function RequestsScreen() {
  const [tab, setTab] = useState<Tab>('received');

  const [data, setData] = useState<RequestItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  const [message, setMessage] = useState('');

  const [busyId, setBusyId] = useState<string | null>(null);

  /* =========================================================
     ENDPOINT
  ========================================================= */

  const endpoint =
    tab === 'received'
      ? '/requests/incoming'
      : '/requests/outgoing';

  /* =========================================================
     LOAD REQUESTS
  ========================================================= */

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const result = await api<RequestItem[]>(
        endpoint,
      );

      setData(result);
    } catch (e) {
      setData([]);

      setError(
        e instanceof Error
          ? e.message
          : 'Could not load requests.',
      );
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  /* =========================================================
     CHANGE TAB
  ========================================================= */

  const changeTab = (nextTab: Tab) => {
    if (nextTab === tab) {
      return;
    }

    setMessage('');
    setError('');

    setData([]);
    setLoading(true);

    setTab(nextTab);
  };

  /* =========================================================
     OPEN DETAILS
  ========================================================= */

  const openDetails = (matchId: string) => {
    router.push({
      pathname: '/swap-detail',
      params: {
        id: matchId,
      },
    });
  };

  /* =========================================================
     ACTIONS
  ========================================================= */

  const act = async (
    id: string,
    action:
      | 'accept'
      | 'reject'
      | 'cancel',
  ) => {
    setBusyId(id);
    setMessage('');
    setError('');

    try {
      const endpointMap = {
        accept: `/requests/${id}/accept`,
        reject: `/requests/${id}/reject`,
        cancel: `/requests/${id}/cancel`,
      } as const;

      await api(endpointMap[action], {
        method: 'POST',
      });

      if (action === 'accept') {
        setMessage(
          'Request accepted successfully.',
        );
      } else if (action === 'reject') {
        setMessage(
          'Request rejected successfully.',
        );
      } else {
        setMessage(
          'Request cancelled successfully.',
        );
      }

      await loadRequests();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Could not update the request.',
      );
    } finally {
      setBusyId(null);
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <Screen scroll>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <Header
        title="Requests"
        back={() => router.back()}
      />

      {/* =====================================================
          INTRO
      ===================================================== */}

      <View className="mx-5 mb-[18px] mt-[6px] flex-row items-center justify-between">

        <View className="flex-1">
          <Text className="text-[11px] text-[#8A8F9B]">
            Manage your crew swap requests
          </Text>
        </View>

        {!loading && !error && (
          <View className="h-[39px] min-w-[39px] items-center justify-center rounded-[13px] bg-[#EEF1F6] px-[10px]">
            <Text className="text-[13px] font-black text-[#182333]">
              {data.length}
            </Text>
          </View>
        )}

      </View>

      {/* =====================================================
          TABS
      ===================================================== */}

      <View className="mx-5 mb-5">

        <Text className="mb-2 text-[9px] font-black uppercase tracking-[0.8px] text-[#8A8F9B]">
          Request type
        </Text>

        <View className="flex-row rounded-[14px] border border-[#E7E8EC] bg-white p-1">

          {/* INCOMING */}

          <Pressable
            onPress={() =>
              changeTab('received')
            }
            className={`min-h-[40px] flex-1 flex-row items-center justify-center gap-[5px] rounded-[10px] ${
              tab === 'received'
                ? 'bg-[#FCAF01]'
                : ''
            }`}
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Send
              size={13}
              color={
                tab === 'received'
                  ? '#FFFFFF'
                  : colors.muted
              }
              strokeWidth={2.2}
            />

            <Text
              className={`text-[9px] ${
                tab === 'received'
                  ? 'font-black text-white'
                  : 'font-extrabold text-[#8A8F9B]'
              }`}
            >
              Incoming
            </Text>
          </Pressable>

          {/* OUTGOING */}

          <Pressable
            onPress={() =>
              changeTab('sent')
            }
            className={`min-h-[40px] flex-1 flex-row items-center justify-center gap-[5px] rounded-[10px] ${
              tab === 'sent'
                ? 'bg-[#FCAF01]'
                : ''
            }`}
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <ArrowRight
              size={13}
              color={
                tab === 'sent'
                  ? '#FFFFFF'
                  : colors.muted
              }
              strokeWidth={2.2}
            />

            <Text
              className={`text-[9px] ${
                tab === 'sent'
                  ? 'font-black text-white'
                  : 'font-extrabold text-[#8A8F9B]'
              }`}
            >
              Outgoing
            </Text>
          </Pressable>

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
            Loading requests...
          </Text>

        </View>
      )}

      {/* =====================================================
          ERROR
      ===================================================== */}

      {!loading && error && (
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

            <Pressable
              onPress={loadRequests}
              className="mt-[9px] min-h-[32px] self-start flex-row items-center justify-center rounded-[9px] bg-[#FFF0F0] px-3"
            >
              <RefreshIcon />

              <Text className="ml-[5px] text-[9px] font-black text-[#D64545]">
                Try again
              </Text>
            </Pressable>

          </View>

        </View>
      )}

      {/* =====================================================
          SUCCESS MESSAGE
      ===================================================== */}

      {!loading && message && (
        <View className="mx-5 mb-[14px] flex-row items-center gap-2 rounded-[11px] bg-[#EAF7EF] px-3 py-[10px]">

          <CheckCircle2
            size={16}
            color={colors.green}
          />

          <Text className="flex-1 text-[10px] font-bold text-[#21A45B]">
            {message}
          </Text>

          <Pressable
            onPress={() => setMessage('')}
            hitSlop={10}
          >
            <X
              size={15}
              color={colors.green}
            />
          </Pressable>

        </View>
      )}

      {/* =====================================================
          SECTION TITLE
      ===================================================== */}

      {!loading &&
        !error &&
        data.length > 0 && (
          <View className="mx-5 mb-[10px] flex-row items-center justify-between">

            <Text className="text-[10px] font-black uppercase tracking-[0.8px] text-[#8A8F9B]">
              {tab === 'received'
                ? 'Incoming requests'
                : 'Outgoing requests'}
            </Text>

            <View className="flex-row items-center gap-[5px]">

              <View className="h-[6px] w-[6px] rounded-full bg-[#21A45B]" />

              <Text className="text-[8px] font-bold text-[#8A8F9B]">
                {data.length} request
                {data.length > 1 ? 's' : ''}
              </Text>

            </View>

          </View>
        )}

      {/* =====================================================
          EMPTY STATE
      ===================================================== */}

      {!loading &&
        !error &&
        data.length === 0 && (
          <View className="mx-5 mt-2 items-center rounded-[18px] border border-[#E7E8EC] bg-white px-[25px] py-8">

            <View className="mb-[13px] h-[54px] w-[54px] items-center justify-center rounded-[17px] bg-[#EEF1F6]">

              {tab === 'received' ? (
                <Send
                  size={24}
                  color={colors.muted}
                  strokeWidth={2}
                />
              ) : (
                <ArrowRight
                  size={24}
                  color={colors.muted}
                  strokeWidth={2}
                />
              )}

            </View>

            <Text className="text-[16px] font-black text-[#182333]">
              {tab === 'received'
                ? 'No incoming requests'
                : 'No outgoing requests'}
            </Text>

            <Text className="mt-[7px] max-w-[280px] text-center text-[10px] leading-4 text-[#8A8F9B]">
              {tab === 'received'
                ? 'You do not have any incoming crew swap requests yet.'
                : 'You have not sent any crew swap requests yet.'}
            </Text>

          </View>
        )}

      {/* =====================================================
          REQUEST LIST
      ===================================================== */}

      {!loading &&
        !error &&
        data.length > 0 && (
          <View className="mx-5 gap-[14px] pb-[25px]">

            {data.map((item) => {

              /* =============================================
                 PROFILE
              ============================================= */

              const profile =
                tab === 'received'
                  ? item.sender?.profile
                  : item.receiver?.profile;

              const name = profile
                ? `${profile.firstName ?? ''} ${
                    profile.lastName ?? ''
                  }`.trim()
                : 'Crew member';

              const photoUrl = mediaUrl(
                profile?.photoUrl,
              );

              const rank = profile?.rank
                ? labelize(profile.rank)
                : 'Crew member';

              /* =============================================
                 TYPE
              ============================================= */

              const type = item.match.type;

              const typeColors =
                getTypeColors(type);

              const TypeIcon =
                getTypeIcon(type);

              /* =============================================
                 STATUS
              ============================================= */

              const statusColors =
                getStatusColors(item.status);

              const isBusy =
                busyId === item.id;

              /* =============================================
                 RENDER
              ============================================= */

              return (
                <Pressable
                  key={item.id}
                  onPress={() =>
                    openDetails(item.match.id)
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
                    opacity: pressed ? 0.96 : 1,
                  })}
                >

                  {/* =========================================
                      PROFILE HEADER
                  ========================================= */}

                  <View className="flex-row items-center justify-between gap-[10px]">

                    <View className="flex-1 flex-row items-center gap-[10px]">

                      {photoUrl ? (
                        <Image
                          source={{
                            uri: photoUrl,
                          }}
                          accessibilityLabel={`${name} profile photo`}
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
                            color={typeColors.icon}
                            strokeWidth={2}
                          />
                        </View>
                      )}

                      <View className="flex-1">

                        <Text
                          className="text-[13px] font-black text-[#182333]"
                          numberOfLines={1}
                        >
                          {name}
                        </Text>

                        <Text
                          className="mt-1 text-[9px] font-semibold text-[#8A8F9B]"
                          numberOfLines={1}
                        >
                          {rank}
                        </Text>

                      </View>

                    </View>

                    {/* STATUS */}

                    <View
                      className="rounded-[9px] px-[8px] py-[5px]"
                      style={{
                        backgroundColor:
                          statusColors.background,
                      }}
                    >
                      <Text
                        className="text-[7px] font-black uppercase"
                        style={{
                          color:
                            statusColors.text,
                        }}
                      >
                        {labelize(item.status)}
                      </Text>
                    </View>

                  </View>

                  {/* =========================================
                      SWAP TYPE
                  ========================================= */}

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
                        color={typeColors.icon}
                        strokeWidth={2.2}
                      />
                    </View>

                    <View className="ml-[9px] flex-1">

                      <Text className="text-[11px] font-black text-[#182333]">
                        {labelize(type)} Swap
                      </Text>

                      <Text className="mt-[2px] text-[8px] text-[#8A8F9B]">
                        Crew swap request
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
                        {labelize(type)}
                      </Text>
                    </View>

                  </View>

                  {/* =========================================
                      REQUEST SUMMARY
                  ========================================= */}

                  <View className="mt-[13px] rounded-[13px] border border-[#F0F0F2] bg-[#FAFAFB] p-3">

                    <Text className="mb-[9px] text-[7px] font-black tracking-[0.7px] text-[#8A8F9B]">
                      REQUEST SUMMARY
                    </Text>

                    <View className="flex-row items-center">

                      {/* REQUESTER */}

                      <View className="flex-1 pr-1">

                        <View className="mb-[5px] flex-row items-center">

                          <View className="h-[5px] w-[5px] rounded-full bg-[#FCAF01]" />

                          <Text className="ml-[5px] text-[7px] font-black uppercase text-[#8A8F9B]">
                            {tab === 'received'
                              ? 'Received from'
                              : 'Sent to'}
                          </Text>

                        </View>

                        <Text
                          className="text-[9px] font-extrabold leading-[14px] text-[#182333]"
                          numberOfLines={2}
                        >
                          {name}
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

                      {/* MATCH */}

                      <View className="flex-1 pl-1">

                        <View className="mb-[5px] flex-row items-center">

                          <View className="h-[5px] w-[5px] rounded-full bg-[#21A45B]" />

                          <Text className="ml-[5px] text-[7px] font-black uppercase text-[#8A8F9B]">
                            Match score
                          </Text>

                        </View>

                        <Text className="text-[9px] font-extrabold leading-[14px] text-[#182333]">
                          {item.match.score !=
                          null
                            ? `${Math.round(
                                Number(
                                  item.match.score,
                                ),
                              )}% compatible`
                            : 'Compatibility available'}
                        </Text>

                      </View>

                    </View>

                  </View>

                  {/* =========================================
                      DATE + SCORE
                  ========================================= */}

                  <View className="mt-[10px] flex-row items-center justify-between">

                    <View className="flex-row items-center gap-[6px]">

                      <Clock3
                        size={13}
                        color="#8A8F9B"
                        strokeWidth={2}
                      />

                      <Text className="text-[9px] text-[#8A8F9B]">
                        {new Date(
                          item.createdAt,
                        ).toLocaleDateString()}
                      </Text>

                    </View>

                    <View className="flex-row items-center gap-[5px]">

                      <View className="h-[5px] w-[5px] rounded-full bg-[#21A45B]" />

                      <Text className="text-[8px] font-bold text-[#8A8F9B]">
                        {item.match.score !=
                        null
                          ? `${Math.round(
                              Number(
                                item.match.score,
                              ),
                            )}% match`
                          : 'Match'}
                      </Text>

                    </View>

                  </View>

                  {/* =========================================
                      ACCEPTED / REJECTED / CANCELLED
                  ========================================= */}

                  {(item.status === 'ACCEPTED' ||
                    item.status === 'REJECTED' ||
                    item.status === 'CANCELLED') && (
                    <View className="mt-[13px] flex-row items-center gap-2">

                      {/* VIEW DETAILS */}

                      <Pressable
                        onPress={(event) => {
                          event.stopPropagation();

                          openDetails(
                            item.match.id,
                          );
                        }}
                        className="min-h-[39px] flex-1 flex-row items-center justify-center gap-[4px] rounded-[10px] bg-[#FEF7EF]"
                      >
                        <Text className="text-[9px] font-black text-[#182333]">
                          View Details
                        </Text>

                        <ChevronRight
                          size={13}
                          color={colors.ink}
                          strokeWidth={2.2}
                        />
                      </Pressable>

                      {/* STATUS MESSAGE */}

                      <View
                        className={`min-h-[39px] flex-1 items-center justify-center rounded-[10px] ${
                          item.status ===
                          'ACCEPTED'
                            ? 'bg-[#EAF7EF]'
                            : 'bg-[#FFF0F0]'
                        }`}
                      >
                        <Text
                          className={`text-center text-[9px] font-black ${
                            item.status ===
                            'ACCEPTED'
                              ? 'text-[#21A45B]'
                              : 'text-[#D64545]'
                          }`}
                        >
                          {item.status ===
                          'ACCEPTED'
                            ? 'Request accepted'
                            : item.status ===
                                'REJECTED'
                              ? 'Request Rejected'
                              : 'Request cancelled'}
                        </Text>
                      </View>

                    </View>
                  )}

                  {/* =========================================
                      PENDING - INCOMING
                  ========================================= */}

                  {item.status ===
                    'PENDING' &&
                    tab === 'received' && (
                      <View className="mt-[13px] flex-row gap-2">

                        {/* REJECT */}

                        <Pressable
                          disabled={isBusy}
                          onPress={(event) => {
                            event.stopPropagation();

                            act(
                              item.id,
                              'reject',
                            );
                          }}
                          className="min-h-[39px] flex-1 flex-row items-center justify-center gap-[5px] rounded-[10px] border border-[#FFD6D6] bg-[#FFF0F0]"
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
                              color="#D64545"
                            />
                          ) : (
                            <>
                              <X
                                size={14}
                                color="#D64545"
                                strokeWidth={2.2}
                              />

                              <Text className="text-[9px] font-black text-[#D64545]">
                                Reject
                              </Text>
                            </>
                          )}
                        </Pressable>

                        {/* ACCEPT */}

                        <Pressable
                          disabled={isBusy}
                          onPress={(event) => {
                            event.stopPropagation();

                            act(
                              item.id,
                              'accept',
                            );
                          }}
                          className="min-h-[39px] flex-[1.25] flex-row items-center justify-center gap-[5px] rounded-[10px] bg-[#FCAF01]"
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
                          ) : (
                            <>
                              <Check
                                size={14}
                                color="#FFFFFF"
                                strokeWidth={2.5}
                              />

                              <Text className="text-[9px] font-black text-white">
                                Accept
                              </Text>
                            </>
                          )}
                        </Pressable>

                      </View>
                    )}

                  {/* =========================================
                      PENDING - OUTGOING
                  ========================================= */}

                  {item.status ===
                    'PENDING' &&
                    tab === 'sent' && (
                      <Pressable
                        disabled={isBusy}
                        onPress={(event) => {
                          event.stopPropagation();

                          act(
                            item.id,
                            'cancel',
                          );
                        }}
                        className="mt-[13px] min-h-[39px] flex-row items-center justify-center gap-[5px] rounded-[10px] border border-[#FFD6D6] bg-[#FFF0F0]"
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
                            color="#D64545"
                          />
                        ) : (
                          <>
                            <X
                              size={14}
                              color="#D64545"
                              strokeWidth={2.2}
                            />

                            <Text className="text-[9px] font-black text-[#D64545]">
                              Cancel request
                            </Text>
                          </>
                        )}
                      </Pressable>
                    )}

                </Pressable>
              );
            })}

          </View>
        )}

      {/* =====================================================
          FOOTER INFO
      ===================================================== */}

      {!loading &&
        !error &&
        data.length > 0 && (
          <View className="mx-5 mb-[25px] items-center">

            <Text className="text-center text-[9px] leading-[14px] text-[#8A8F9B]">
              Requests are linked to compatible
              crew swap matches and their current
              status.
            </Text>

          </View>
        )}

    </Screen>
  );
}

/* =========================================================
   SMALL REFRESH ICON
========================================================= */

function RefreshIcon() {
  return (
    <View className="h-[14px] w-[14px] items-center justify-center">
      <Text className="text-[11px] font-black text-[#D64545]">
        ↻
      </Text>
    </View>
  );
}
