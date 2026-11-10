import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { CalendarDays } from 'lucide-react-native';
import { api, formatDate, formatTime } from '@/lib/api';
import { useApiResource } from '@/lib/data';
import { colors, Header, Screen } from '@/components/ui';

type RosterItem = { id: string; dutyType: string; startsAt: string; endsAt: string; note?: string | null; flight?: { flightNumber: string; origin: string; destination: string; fleet: string } | null };

export default function Roster() {
  const { data, loading, error } = useApiResource(() => api<RosterItem[]>('/roster'), []);
  return <Screen scroll><Header title="Roster" back={() => router.back()} right={<CalendarDays size={20} color={colors.ink} />} /><View className="mx-5 flex-row items-center justify-between rounded-xl border border-line bg-paper p-3.5"><Text className="text-xs font-extrabold text-ink">Current roster</Text><CalendarDays size={17} color={colors.muted} /></View><View className="flex-row gap-2 px-5 py-5"><Text className="rounded-full bg-amber px-[18px] py-2 text-[11px] font-extrabold text-white">All</Text><Text className="rounded-full border border-line bg-paper px-[13px] py-2 text-[11px] font-bold text-muted">Flights</Text><Text className="rounded-full border border-line bg-paper px-[13px] py-2 text-[11px] font-bold text-muted">Leave</Text><Text className="rounded-full border border-line bg-paper px-[13px] py-2 text-[11px] font-bold text-muted">Standby</Text></View>{loading ? <Text className="mx-5 text-xs text-muted">Loading roster...</Text> : null}{error ? <Text className="mx-5 text-xs text-red">{error}</Text> : null}{!loading && !data?.length ? <Text className="mx-5 text-xs text-muted">No roster items yet.</Text> : null}{data?.map((item) => <View key={item.id}><Text className="mb-2 mt-3 mx-5 text-sm font-extrabold text-ink">{formatDate(item.startsAt)}</Text><View className="mx-5 mb-2 flex-row items-center rounded-xl border border-line bg-paper p-3.5"><View><Text className="text-[10px] leading-[18px] text-muted">{formatTime(item.startsAt)}{'\n'}{formatTime(item.endsAt)}</Text></View><View className="ml-4 flex-1"><Text className="text-xs font-extrabold text-ink">{item.flight ? `${item.flight.origin} to ${item.flight.destination}` : item.dutyType}</Text><Text className="mt-1.5 text-[11px] text-muted">{item.flight ? `${item.flight.flightNumber} - ${item.dutyType}` : item.note ?? 'Roster duty'}</Text></View><Text className="text-[11px] font-extrabold text-ink">{item.flight?.fleet ?? item.dutyType}</Text></View></View>)}</Screen>;
}
