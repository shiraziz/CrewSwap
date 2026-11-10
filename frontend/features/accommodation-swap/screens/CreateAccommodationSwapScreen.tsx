import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Send } from 'lucide-react-native';
import { api } from '@/lib/api';
import { Button, colors, Field, Header, Screen } from '@/components/ui';

const swapTypes = [
  { label: 'Full Apartment', value: 'FULL_APARTMENT' },
  { label: 'Individual', value: 'INDIVIDUAL' },
];

const genders = [
  { label: 'Male', value: 'MALE' },
  { label: 'Female', value: 'FEMALE' },
  { label: 'Any', value: 'ANY' },
];

export default function AccommodationSwap() {
  const [currentAccommodation, setCurrentAccommodation] = useState('');
  const [desiredAccommodation, setDesiredAccommodation] = useState('');
  const [swapType, setSwapType] = useState('FULL_APARTMENT');
  const [gender, setGender] = useState('MALE');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!currentAccommodation.trim() || !desiredAccommodation.trim() || currentAccommodation.trim().toLowerCase() === desiredAccommodation.trim().toLowerCase()) { setError('Enter two different accommodations.'); return; }
    setSubmitting(true); setError('');
    try {
      const swap = await api<{ id: string }>('/accommodation-swaps', { method: 'POST', body: JSON.stringify({ currentAccommodationName: currentAccommodation.trim(), desiredAccommodationName: desiredAccommodation.trim(), swapType, gender, note: note.trim() || undefined }) });
      await api(`/accommodation-swaps/${swap.id}/publish`, { method: 'POST' });
      router.replace('/(tabs)/matches');
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not publish the accommodation swap.'); } finally { setSubmitting(false); }
  };

  return <Screen scroll><Header title="Post Accommodation Swap" back={() => router.back()} /><View className="px-5"><Field label="Current Accommodation" placeholder="Etihad Plaza" value={currentAccommodation} onChangeText={setCurrentAccommodation} /><Field label="Desired Accommodation" placeholder="Al Raha" value={desiredAccommodation} onChangeText={setDesiredAccommodation} /><Text className="mb-3 mt-2 text-sm font-extrabold text-ink">Swap Type</Text><View className="mb-4 flex-row flex-wrap gap-2">{swapTypes.map((type) => <Chip key={type.value} label={type.label} active={swapType === type.value} onPress={() => setSwapType(type.value)} />)}</View><Text className="mb-3 mt-2 text-sm font-extrabold text-ink">Gender</Text><View className="mb-4 flex-row flex-wrap gap-2">{genders.map((item) => <Chip key={item.value} label={item.label} active={gender === item.value} onPress={() => setGender(item.value)} />)}</View><Field label="Optional Note" placeholder="Add a note for your accommodation swap..." value={note} onChangeText={setNote} multiline />{error ? <Text className="mb-3 text-xs text-red">{error}</Text> : null}<Button title={submitting ? 'Publishing...' : 'Publish Accommodation Swap'} icon={Send} onPress={submit} /></View></Screen>;
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} className={`rounded-[10px] border px-3 py-2 ${active ? 'border-amber bg-amberSoft' : 'border-line bg-paper'}`}><Text className={`text-xs font-bold ${active ? 'text-ink' : 'text-muted'}`}>{label}</Text></Pressable>;
}
