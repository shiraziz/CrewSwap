import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { router } from 'expo-router';

import {
  ClipboardCheck,
  RefreshCcw,
  Send,
  Tag,
  ArrowRight,
  Clock,
  Plane,
} from 'lucide-react-native';

import { colors, Logo, Screen, SectionTitle } from '@/components/ui';
import { api, formatTime } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useApiResource } from '@/lib/data';
import {
  AnySwap,
  Match,
  RequestItem,
  labelize,
  swapMeta,
  swapTitle,
} from '@/lib/crewswap';

type Dashboard = {
  activeSwaps: number;
  flightSwaps: number;
  leaveSwaps: number;
  accommodationSwaps: number;
  newMatches: number;
};

type Flight = {
  id: string;
  flightNumber: string;
  date: string;
  origin: string;
  destination: string;
  departureTime: string;
  fleet: string;
};

type RosterItem = {
  id: string;
  dutyType: string;
  startsAt: string;
  endsAt: string;
  note?: string | null;
  flight?: {
    flightNumber: string;
    origin: string;
    destination: string;
    fleet: string;
  } | null;
};

function isFuture(value?: string) {
  return value ? new Date(value).getTime() >= Date.now() : false;
}

function buildTrip(
  rosterItems: RosterItem[] | null,
  flights: Flight[] | null,
) {
  const rosterTrip = (rosterItems ?? []).find((item) =>
    isFuture(item.startsAt),
  );

  if (rosterTrip) {
    return {
      date: rosterTrip.startsAt,
      origin: rosterTrip.flight?.origin ?? rosterTrip.dutyType,
      destination:
        rosterTrip.flight?.destination ??
        rosterTrip.note ??
        'Duty',
      time: formatTime(rosterTrip.startsAt),
      fleet: rosterTrip.flight?.fleet ?? rosterTrip.dutyType,
      number:
        rosterTrip.flight?.flightNumber ??
        rosterTrip.dutyType,
      source: 'Roster',
    };
  }

  const nextFlight =
    (flights ?? []).find(
      (flight) =>
        isFuture(flight.departureTime) ||
        isFuture(flight.date),
    ) ?? flights?.[0];

  if (!nextFlight) {
    return null;
  }

  return {
    date: nextFlight.date,
    origin: nextFlight.origin,
    destination: nextFlight.destination,
    time: formatTime(nextFlight.departureTime),
    fleet: nextFlight.fleet,
    number: nextFlight.flightNumber,
    source: 'Flight',
  };
}

export default function Home() {
  const { profile } = useAuth();

  const dashboard = useApiResource(
    () => api<Dashboard>('/dashboard'),
    [],
  );

  const roster = useApiResource(
    () => api<RosterItem[]>('/roster'),
    [],
  );

  const flights = useApiResource(
    () => api<Flight[]>('/flights/my'),
    [],
  );

  const swaps = useApiResource(
    () => api<AnySwap[]>('/swaps/active'),
    [],
  );

  const requests = useApiResource(
    () => api<RequestItem[]>('/requests/incoming'),
    [],
  );

  const matches = useApiResource(
    () => api<Match[]>('/matches'),
    [],
  );

  const loading =
    dashboard.loading ||
    roster.loading ||
    flights.loading ||
    swaps.loading ||
    requests.loading ||
    matches.loading;

  const error =
    dashboard.error ||
    roster.error ||
    flights.error ||
    swaps.error ||
    requests.error ||
    matches.error;

  const pendingRequests =
    requests.data?.filter(
      (item) => item.status === 'PENDING',
    ).length ?? 0;

  const activeSwaps = swaps.data ?? [];

  const recentMatches = (matches.data ?? []).slice(0, 2);

  const nextTrip = buildTrip(
    roster.data,
    flights.data,
  );

  const reloadAll = () => {
    dashboard.reload();
    roster.reload();
    flights.reload();
    swaps.reload();
    requests.reload();
    matches.reload();
  };

  const stats = [
    {
      label: 'New Matches',
      value:
        dashboard.data?.newMatches ??
        recentMatches.length,
      icon: Tag,
      path: '/(tabs)/matches',
    },
    {
      label: 'Requests',
      value: pendingRequests,
      icon: ClipboardCheck,
      path: '/(tabs)/requests',
    },
    {
      label: 'Active Swaps',
      value:
        dashboard.data?.activeSwaps ??
        activeSwaps.length,
      icon: Plane,
      path: '/(tabs)/profile',
    },
  ];

  return (
    <Screen scroll>
      {/* ================= HEADER ================= */}
      <View style={styles.top}>
        {/* ================= GREETING ================= */}
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>Good morning,</Text>
          <Text style={styles.name}>
            {profile
              ? `${profile.firstName} ${profile.lastName}`
              : 'Yousseff Amir'}{' '}
            👋
          </Text>
        </View>

      </View>

      <Text style={styles.prompt}>
        Ready to find your perfect swap?
      </Text>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : null}

      {/* ================= HERO ================= */}
      <View style={styles.hero}>
        <Image
          source={require('@/assets/hero-plane.png')}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <View
          pointerEvents="none"
          style={styles.heroOverlay}
        />
        
      </View>

      {/* ================= OVERVIEW ================= */}
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionTitleText}>Overview</Text>
          <Text style={styles.sectionSubtitleText}>Your swap activity</Text>
        </View>
        <Pressable style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View all</Text>
        </Pressable>
      </View>

      <View style={styles.stats}>
        {stats.map(
          ({
            label,
            value,
            icon: Icon,
            path,
          }) => (
            <Pressable
              key={label}
              style={styles.stat}
              onPress={() =>
                router.push(path as never)
              }
            >
              <View style={styles.statIconContainer}>
                <Icon size={16} color={colors.amber} />
              </View>

              <Text style={styles.statValue}>
                {value}
              </Text>

              <Text style={styles.statLabel}>
                {label}
              </Text>
            </Pressable>
          ),
        )}
      </View>

      {/* ================= NEXT TRIP ================= */}
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionTitleText}>Your Next Trip</Text>
          <Text style={styles.sectionSubtitleText}>Upcoming flight from your roster</Text>
        </View>
      </View>

      {nextTrip ? (
        <Pressable
          style={styles.trip}
          onPress={() =>
            router.push(
              '/roster',
            )
          }
        >
          {/* Top Yellow Bar inside card */}
          <View style={styles.tripTopBar} />

          <View style={styles.tripCardContent}>
            <View style={styles.tripHeaderRow}>
              <View style={styles.dateBox}>
                <Text style={styles.month}>
                  {new Date(
                    nextTrip.date,
                  )
                    .toLocaleDateString(
                      undefined,
                      {
                        month: 'short',
                      },
                    )
                    .toUpperCase()}
                </Text>
                <Text style={styles.day}>
                  {new Date(
                    nextTrip.date,
                  ).getDate()}
                </Text>
              </View>

              <View style={styles.confirmedBadge}>
                <Text style={styles.confirmed}>• Confirmed</Text>
              </View>
            </View>

            {/* Route Graph */}
            <View style={styles.routeContainer}>
              <View style={styles.routePoint} />
              <View style={styles.routeLine}>
                <View style={styles.planeIconContainer}>
                  <Plane size={12} color={colors.amber} />
                </View>
              </View>
              <View style={styles.routePoint} />
            </View>

            <View style={styles.citiesRow}>
              <Text style={styles.cityName}>{nextTrip.origin}</Text>
              <Text style={styles.cityName}>{nextTrip.destination}</Text>
            </View>

            <View style={styles.tripFooterDivider} />

            <View style={styles.tripFooter}>
              <View style={styles.footerInfoItem}>
                <Clock size={13} color={colors.muted} />
                <Text style={styles.tripInfoText}>{nextTrip.time}</Text>
              </View>
              <View style={styles.footerInfoItem}>
                <Plane size={13} color={colors.muted} />
                <Text style={styles.tripInfoText}>{nextTrip.fleet}</Text>
              </View>

              <Pressable style={styles.detailsAction}>
                <Text style={styles.detailsActionText}>Details</Text>
                <ArrowRight size={12} color={colors.amber} />
              </Pressable>
            </View>
          </View>
        </Pressable>
      ) : (
        <EmptyLine
          text="No upcoming roster or flight items yet."
          action="Open roster"
          onPress={() =>
            router.push(
              '/roster',
            )
          }
        />
      )}

      {/* ================= RECENT MATCHES ================= */}
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionTitleText}>Recent Matches</Text>
        </View>
        <Pressable>
          <Text style={styles.viewAllText}>View all</Text>
        </Pressable>
      </View>

      {recentMatches.map((match) => (
        <Pressable
          key={match.id}
          style={styles.rowCard}
          onPress={() =>
            router.push({
              pathname: '/swap-detail',
              params: {
                id: match.id,
              },
            })
          }
        >
          <View style={styles.rowIcon}>
            <ClipboardCheck
              size={17}
              color={colors.amber}
            />
          </View>

          <View style={styles.rowMain}>
            <Text style={styles.route}>
              {labelize(match.type)} match -{' '}
              {match.score}%
            </Text>

            <Text style={styles.tripInfo}>
              {match.reasons
                .slice(0, 2)
                .join(' - ') ||
                labelize(match.status)}
            </Text>
          </View>
        </Pressable>
      ))}

      {!matches.loading &&
      !recentMatches.length ? (
        <EmptyLine
          text="No matches yet."
          action="Refresh"
          onPress={() =>
            matches.reload()
          }
        />
      ) : null}

      {/* ================= ACTIVE SWAPS ================= */}
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionTitleText}>Your Active Swaps</Text>
        </View>
        <Pressable>
          <Text style={styles.viewAllText}>Add</Text>
        </Pressable>
      </View>

      {activeSwaps
        .slice(0, 3)
        .map((swap) => (
          <View
            key={swap.id}
            style={styles.swap}
          >
            <Text style={styles.route}>
              {swapTitle(
                swap,
                swap.type,
              )}
            </Text>

            <Text style={styles.tripInfo}>
              {swapMeta(
                swap,
                swap.type,
              )}{' '}
              - {labelize(swap.status)}
            </Text>
          </View>
        ))}

      {!swaps.loading &&
      !activeSwaps.length ? (
        <EmptyLine
          text="No active swaps yet."
          action="Add swap"
          onPress={() =>
            router.push(
              '/swaps',
            )
          }
        />
      ) : null}
    </Screen>
  );
}

function EmptyLine({
  text,
  action,
  onPress,
}: {
  text: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <View style={styles.emptyLine}>
      <Text style={styles.empty}>
        {text}
      </Text>

      {action && onPress ? (
        <Pressable onPress={onPress}>
          <Text style={styles.emptyAction}>
            {action}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  top: {
    paddingHorizontal: 20,
    paddingTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  greetingContainer: {
    flex: 1,
  },

  greeting: {
    color: colors.muted,
    fontSize: 14,
  },

  name: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: '800',
    marginTop: 2,
  },

  prompt: {
    color: colors.muted,
    fontSize: 13,
    paddingHorizontal: 20,
    marginTop: 6,
    marginBottom: 15,
  },

  error: {
    color: colors.red,
    fontSize: 12,
    marginHorizontal: 20,
    marginTop: 10,
    lineHeight: 18,
  },

  hero: {
    marginHorizontal: 20,
    marginTop: 5,
    height: 250,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#334155',
    position: 'relative',
    justifyContent: 'center',
  },

  heroImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },

  heroContent: {
    padding: 20,
    zIndex: 1,
  },

  heroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
  },

  heroSubtitle: {
    color: '#E2E8F0',
    fontSize: 12,
    marginTop: 6,
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginTop: 22,
    marginBottom: 10,
  },

  sectionTitleText: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '800',
  },

  sectionSubtitleText: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2,
  },

  viewAllButton: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },

  viewAllText: {
    color: '#D97706',
    fontSize: 12,
    fontWeight: '700',
  },

  stats: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
  },

  stat: {
    flex: 1,
    backgroundColor: colors.paper,
    borderRadius: 16,
    padding: 14,
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#F1F0EC',
    justifyContent: 'space-between',
  },

  statIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statValue: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 4,
  },

  statLabel: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2,
  },

  trip: {
    marginHorizontal: 20,
    backgroundColor: colors.paper,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F0EC',
  },

  tripTopBar: {
    height: 6,
    backgroundColor: '#F59E0B',
    width: '100%',
  },

  tripCardContent: {
    padding: 16,
  },

  tripHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  dateBox: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
  },

  month: {
    color: '#D97706',
    fontSize: 10,
    fontWeight: '800',
  },

  day: {
    color: '#B45309',
    fontSize: 20,
    fontWeight: '800',
  },

  confirmedBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  confirmed: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '700',
  },

  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 10,
  },

  routePoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
  },

  routeLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#FDE68A',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },

  planeIconContainer: {
    position: 'absolute',
    backgroundColor: colors.paper,
    paddingHorizontal: 4,
  },

  citiesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingHorizontal: 4,
  },

  cityName: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '800',
  },

  tripFooterDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 14,
  },

  tripFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  footerInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  tripInfoText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },

  detailsAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },

  detailsActionText: {
    color: '#D97706',
    fontSize: 12,
    fontWeight: '700',
  },

  rowCard: {
    marginHorizontal: 20,
    backgroundColor: colors.paper,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 13,
    marginBottom: 8,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },

  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.amberSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  rowMain: {
    flex: 1,
  },

  swap: {
    marginHorizontal: 20,
    backgroundColor: colors.paper,
    borderRadius: 12,
    padding: 13,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.line,
  },

  emptyLine: {
    marginHorizontal: 20,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 13,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  empty: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },

  emptyAction: {
    color: colors.amber,
    fontSize: 12,
    fontWeight: '800',
  },

  route: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '800',
  },

  tripInfo: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 4,
  },
});
