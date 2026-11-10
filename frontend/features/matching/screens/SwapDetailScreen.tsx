import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  Plane,
  Send,
  X,
} from 'lucide-react-native';

import { api, formatDate, formatTime, mediaUrl } from '@/lib/api';
import { useApiResource } from '@/lib/data';
import { useAuth } from '@/lib/auth';

import {
  Button,
  colors,
  Header,
  Screen,
} from '@/components/ui';

import {
  AnySwap,
  Match,
  getMatchSwaps,
  getMatchedProfile,
  hasActiveRequest,
  labelize,
  profileName,
  routeText,
  swapMeta,
  swapTitle,
} from '@/lib/crewswap';

function getTypeIcon(type: Match['type']) {
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

function getTypeTheme(type: Match['type']) {
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
        background: colors.navySoft,
        icon: colors.ink,
      };
  }
}

function getScoreLabel(score: number) {
  if (score >= 90) return 'Excellent match';
  if (score >= 75) return 'Strong match';
  if (score >= 60) return 'Good match';
  return 'Possible match';
}

export default function SwapDetail() {
  const { user } = useAuth();

  const { id } =
    useLocalSearchParams<{ id?: string }>();

  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const {
    data: match,
    loading,
    error,
    reload,
  } = useApiResource(
    () =>
      id
        ? api<Match>(`/matches/${id}`)
        : Promise.reject(
            new Error('Match id is missing.'),
          ),
    [id],
  );

  const [swapA, swapB] = match
    ? getMatchSwaps(match)
    : [null, null];

  const matchedProfile = match
    ? getMatchedProfile(match, user?.id)
    : null;

  const matchedName = profileName(
    matchedProfile,
    match
      ? `${labelize(match.type)} Match`
      : 'Crew member',
  );

  const matchedPhotoUrl = mediaUrl(
    matchedProfile?.photoUrl,
  );

  const requestAlreadySent = match
    ? hasActiveRequest(match, user?.id)
    : false;

  const sendRequest = async () => {
    if (!match || sending || requestAlreadySent) {
      return;
    }

    setSending(true);
    setMessage('');

    try {
      await api('/requests', {
        method: 'POST',
        body: JSON.stringify({
          matchId: match.id,
        }),
      });

      setMessage('Request sent successfully.');

      await reload();
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : 'Could not send request.',
      );
    } finally {
      setSending(false);
    }
  };

  const isError =
    message.includes('Could not') ||
    message.includes('already');

  return (
    <Screen scroll>
      <Header
        title="Swap Details"
        back={() => router.back()}
      />

      {/* =========================
          LOADING
      ========================= */}
      {loading && (
        <View className="min-h-[220px] items-center justify-center px-5">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF8E8]">
            <ActivityIndicator
              size="small"
              color={colors.amber}
            />
          </View>

          <Text className="mt-4 text-[12px] font-medium text-[#7B8492]">
            Loading match details...
          </Text>
        </View>
      )}

      {/* =========================
          ERROR
      ========================= */}
      {error && !loading && (
        <View className="mx-5 mt-3 flex-row items-start gap-3 rounded-2xl border border-[#FFD7D7] bg-[#FFF5F5] p-4">
          <View className="h-9 w-9 items-center justify-center rounded-xl bg-[#FFE5E5]">
            <X
              size={18}
              color={colors.red}
              strokeWidth={2.5}
            />
          </View>

          <View className="flex-1">
            <Text className="text-[13px] font-extrabold text-[#D94141]">
              Unable to load match
            </Text>

            <Text className="mt-1 text-[11px] leading-4 text-[#C65B5B]">
              {error}
            </Text>
          </View>
        </View>
      )}

      {match && (
        <>
          {/* =========================
              MATCH HERO
          ========================= */}
          <View className="mx-5 mt-2 overflow-hidden rounded-[22px] border border-[#E9E7E3] bg-white">
            {/* Top accent */}
            <View className="h-1.5 bg-[#FCAF01]" />

            <View className="p-4">
              <View className="flex-row items-center">
                {/* Avatar / Type */}
                <View
                  className="h-[58px] w-[58px] items-center justify-center overflow-hidden rounded-[18px]"
                  style={{
                    backgroundColor:
                      getTypeTheme(match.type).background,
                  }}
                >
                  {(() => {
                    const Icon = getTypeIcon(match.type);

                    return matchedPhotoUrl ? (
                      <Image
                        source={{
                          uri: matchedPhotoUrl,
                        }}
                        className="h-[58px] w-[58px]"
                        resizeMode="cover"
                      />
                    ) : (
                      <Icon
                        size={27}
                        color={
                          getTypeTheme(match.type).icon
                        }
                        strokeWidth={2.2}
                      />
                    );
                  })()}
                </View>

                {/* Profile */}
                <View className="ml-3 flex-1">
                  <Text
                    className="text-[16px] font-black text-[#182333]"
                    numberOfLines={1}
                  >
                    {matchedName}
                  </Text>

                  <View className="mt-1.5 flex-row items-center">
                    <View className="h-1.5 w-1.5 rounded-full bg-[#21A45B]" />

                    <Text className="ml-1.5 text-[10px] font-bold text-[#7B8492]">
                      {labelize(match.status)}
                    </Text>
                  </View>
                </View>

                {/* Score */}
                <View className="min-w-[70px] items-center rounded-2xl bg-[#EAF8F0] px-3 py-2.5">
                  <Text className="text-[19px] font-black text-[#21A45B]">
                    {match.score}%
                  </Text>

                  <Text className="mt-0.5 text-[7px] font-black tracking-[1px] text-[#21A45B]">
                    MATCH
                  </Text>
                </View>
              </View>

              {/* Match quality */}
              <View className="mt-4 flex-row items-center border-t border-[#ECEAE7] pt-3">
                <View className="h-7 w-7 items-center justify-center rounded-lg bg-[#EAF8F0]">
                  <CheckCircle2
                    size={15}
                    color={colors.green}
                    strokeWidth={2.5}
                  />
                </View>

                <View className="ml-2.5 flex-1">
                  <Text className="text-[10px] font-extrabold text-[#21A45B]">
                    {getScoreLabel(match.score)}
                  </Text>

                  <Text className="mt-0.5 text-[9px] text-[#8A929D]">
                    Based on your swap compatibility
                  </Text>
                </View>
              </View>

              {/* Reasons */}
              {!!match.reasons.length && (
                <View className="mt-3 flex-row flex-wrap gap-2">
                  {match.reasons.map((reason) => (
                    <View
                      key={reason}
                      className="flex-row items-center rounded-xl bg-[#F0FAF4] px-2.5 py-1.5"
                    >
                      <Check
                        size={11}
                        color={colors.green}
                        strokeWidth={3}
                      />

                      <Text className="ml-1.5 text-[9px] font-extrabold text-[#21A45B]">
                        {reason}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* =========================
              MATCHED SWAPS HEADER
          ========================= */}
          <SectionHeader
            title="Matched Swaps"
            subtitle="Compare both sides of the swap"
          />

          {/* =========================
              YOUR SIDE
          ========================= */}
          <SwapCard
            title="Your side"
            subtitle="Your published swap"
            swap={swapA}
            type={match.type}
            accent="amber"
          />

          {/* Connector */}
          <View className="mx-9 h-11 flex-row items-center justify-center">
            <View className="h-px flex-1 bg-[#E7E5E1]" />

            <View className="mx-3 h-8 w-8 items-center justify-center rounded-full border border-[#E7E5E1] bg-[#FEF7EF]">
              <ArrowRight
                size={15}
                color={colors.muted}
                strokeWidth={2.2}
              />
            </View>

            <View className="h-px flex-1 bg-[#E7E5E1]" />
          </View>

          {/* =========================
              MATCHING SIDE
          ========================= */}
          <SwapCard
            title="Matching side"
            subtitle="Compatible crew swap"
            swap={swapB}
            type={match.type}
            accent="green"
          />

          {/* =========================
              REQUESTS HEADER
          ========================= */}
          <SectionHeader
            title="Requests"
            subtitle="Track your request status"
          />

          {/* =========================
              REQUESTS CARD
          ========================= */}
          <View className="mx-5 overflow-hidden rounded-[19px] border border-[#E8E6E2] bg-white">
            <View className="flex-row items-center p-4">
              <View className="h-11 w-11 items-center justify-center rounded-[14px] bg-[#F0F3F7]">
                <Send
                  size={18}
                  color={colors.ink}
                  strokeWidth={2.2}
                />
              </View>

              <View className="ml-3 flex-1">
                <Text className="text-[13px] font-black text-[#182333]">
                  Swap request
                </Text>

                <Text className="mt-1 text-[9px] font-medium text-[#858D99]">
                  {match.requests?.length
                    ? `${match.requests.length} request${
                        match.requests.length > 1
                          ? 's'
                          : ''
                      }`
                    : 'No requests yet'}
                </Text>
              </View>

              {match.requests?.length ? (
                <View className="rounded-full bg-[#EAF8F0] px-2.5 py-1.5">
                  <Text className="text-[9px] font-black text-[#21A45B]">
                    {match.requests.length}
                  </Text>
                </View>
              ) : null}
            </View>

            {match.requests?.length ? (
              <View className="border-t border-[#ECEAE7]">
                {match.requests.map(
                  (request, index) => (
                    <View
                      key={request.id}
                      className={`min-h-[52px] flex-row items-center px-4 ${
                        index !==
                        match.requests!.length - 1
                          ? 'border-b border-[#ECEAE7]'
                          : ''
                      }`}
                    >
                      <View className="h-8 w-8 items-center justify-center rounded-[10px] bg-[#EAF8F0]">
                        <CheckCircle2
                          size={16}
                          color={colors.green}
                          strokeWidth={2.5}
                        />
                      </View>

                      <Text className="ml-2.5 flex-1 text-[10px] font-extrabold text-[#182333]">
                        {labelize(request.status)}
                      </Text>

                      <ChevronRight
                        size={16}
                        color={colors.muted}
                        strokeWidth={2}
                      />
                    </View>
                  ),
                )}
              </View>
            ) : (
              <View className="border-t border-[#ECEAE7] px-4 py-4">
                <Text className="text-[10px] leading-4 text-[#858D99]">
                  No request has been sent for this
                  match yet.
                </Text>
              </View>
            )}
          </View>

          {/* =========================
              FEEDBACK
          ========================= */}
          {message && (
            <View
              className={`mx-5 mt-4 flex-row items-center rounded-[14px] px-3.5 py-3 ${
                isError
                  ? 'border border-[#FFD7D7] bg-[#FFF1F1]'
                  : 'bg-[#EAF8F0]'
              }`}
            >
              <CheckCircle2
                size={17}
                color={
                  isError
                    ? colors.red
                    : colors.green
                }
                strokeWidth={2.3}
              />

              <Text
                className={`ml-2 flex-1 text-[10px] font-bold ${
                  isError
                    ? 'text-[#D94141]'
                    : 'text-[#21A45B]'
                }`}
              >
                {message}
              </Text>
            </View>
          )}

          {/* =========================
              ACTIONS
          ========================= */}
          <View className="mx-5 mt-5 mb-8 gap-2.5">
            <Button
              title={
                requestAlreadySent
                  ? 'Request Sent'
                  : sending
                  ? 'Sending...'
                  : 'Send Request'
              }
              icon={Send}
              disabled={
                requestAlreadySent || sending
              }
              onPress={sendRequest}
            />

            <Pressable
              className="min-h-[46px] flex-row items-center justify-center rounded-xl border border-[#F1BBBB] bg-white active:opacity-70"
              onPress={() => router.back()}
            >
              <X
                size={16}
                color={colors.red}
                strokeWidth={2.4}
              />

              <Text className="ml-1.5 text-[11px] font-extrabold text-[#D94141]">
                Close
              </Text>
            </Pressable>
          </View>
        </>
      )}
    </Screen>
  );
}

/* =====================================================
   SECTION HEADER
===================================================== */

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <View className="mx-5 mt-6 mb-3">
      <Text className="text-[17px] font-black text-[#182333]">
        {title}
      </Text>

      <Text className="mt-1 text-[10px] font-medium text-[#858D99]">
        {subtitle}
      </Text>
    </View>
  );
}

/* =====================================================
   SWAP CARD
===================================================== */

function SwapCard({
  title,
  subtitle,
  swap,
  type,
  accent,
}: {
  title: string;
  subtitle: string;
  swap: AnySwap | null;
  type: Match['type'];
  accent: 'amber' | 'green';
}) {
  const isAmber = accent === 'amber';

  return (
    <View className="mx-5 overflow-hidden rounded-[19px] border border-[#E8E6E2] bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-4 pb-3.5">
        <View
          className={`h-9 w-1 rounded-full ${
            isAmber
              ? 'bg-[#FCAF01]'
              : 'bg-[#21A45B]'
          }`}
        />

        <View className="ml-3 flex-1">
          <Text className="text-[13px] font-black text-[#182333]">
            {title}
          </Text>

          <Text className="mt-1 text-[9px] font-medium text-[#858D99]">
            {subtitle}
          </Text>
        </View>

        <View
          className={`rounded-full px-2.5 py-1 ${
            isAmber
              ? 'bg-[#FFF6DF]'
              : 'bg-[#EAF8F0]'
          }`}
        >
          <Text
            className={`text-[8px] font-black ${
              isAmber
                ? 'text-[#D88900]'
                : 'text-[#21A45B]'
            }`}
          >
            {isAmber ? 'YOU' : 'MATCH'}
          </Text>
        </View>
      </View>

      {/* Summary */}
      <View className="mx-4 rounded-[13px] border border-[#EEEEEC] bg-[#FAFAF9] p-3">
        <Text className="text-[7px] font-black tracking-[1px] text-[#8A929D]">
          SWAP SUMMARY
        </Text>

        <Text className="mt-1.5 text-[12px] font-extrabold leading-[17px] text-[#182333]">
          {swapTitle(swap, type)}
        </Text>
      </View>

      {/* Details */}
      <View className="mt-1 px-4">
        <DetailRow
          icon={FileText}
          label="Details"
          value={swapMeta(swap, type)}
        />

        {/* Flight */}
        {swap && 'origin' in swap && (
          <>
            <DetailRow
              icon={Plane}
              label="Route"
              value={routeText(
                swap.origin,
                swap.destination,
              )}
            />

            <DetailRow
              icon={Clock3}
              label="Departure"
              value={formatTime(
                swap.departureTime,
              )}
            />

            <DetailRow
              icon={Clock3}
              label="Arrival"
              value={formatTime(
                swap.arrivalTime,
              )}
            />
          </>
        )}

        {/* Leave */}
        {swap && 'currentStart' in swap && (
          <>
            <DetailRow
              icon={CalendarDays}
              label="Current leave"
              value={`${formatDate(
                swap.currentStart,
              )} → ${formatDate(
                swap.currentEnd,
              )}`}
            />

            <DetailRow
              icon={CalendarDays}
              label="Desired leave"
              value={`${formatDate(
                swap.desiredStart,
              )} → ${formatDate(
                swap.desiredEnd,
              )}`}
            />
          </>
        )}

        {/* Status */}
        <DetailRow
          icon={CheckCircle2}
          label="Status"
          value={labelize(swap?.status)}
          last={!swap?.note}
        />

        {/* Note */}
        {swap?.note && (
          <View className="py-3.5">
            <View className="flex-row items-center">
              <FileText
                size={14}
                color={colors.muted}
                strokeWidth={2}
              />

              <Text className="ml-2 text-[10px] font-bold text-[#858D99]">
                Note
              </Text>
            </View>

            <Text className="mt-2 text-[10px] font-semibold leading-4 text-[#182333]">
              {swap.note}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

/* =====================================================
   DETAIL ROW
===================================================== */

function DetailRow({
  icon: Icon,
  label,
  value,
  last = false,
}: {
  icon: typeof FileText;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View
      className={`min-h-[50px] flex-row items-center justify-between gap-3 ${
        !last
          ? 'border-b border-[#ECEAE7]'
          : ''
      }`}
    >
      {/* Label */}
      <View className="min-w-[105px] flex-row items-center">
        <Icon
          size={14}
          color={colors.muted}
          strokeWidth={2}
        />

        <Text className="ml-2 text-[10px] font-semibold text-[#858D99]">
          {label}
        </Text>
      </View>

      {/* Value */}
      <Text
        className="flex-1 text-right text-[10px] font-extrabold leading-[15px] text-[#182333]"
        numberOfLines={3}
      >
        {value}
      </Text>
    </View>
  );
}
