import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { Save } from 'lucide-react-native';
import { api } from '@/lib/api';
import { Button, Header, Screen } from '@/components/ui';
import { FleetQualificationSelect } from '@/components/FleetQualificationSelect';

const fallbackFleets = ['A320', 'A330', 'A350', 'B737', 'B777', 'B787'];

export default function Preferences() {
  const [fleets, setFleets] = useState<string[]>(fallbackFleets);
  const [selectedFleets, setSelectedFleets] = useState<string[]>([]);
  const [qualificationOpen, setQualificationOpen] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setError('');

      try {
        const [qualifications, availableFleets] = await Promise.all([
          api<{ fleet: string }[]>('/qualifications/me'),
          api<string[]>('/reference/fleets'),
        ]);

        setSelectedFleets(qualifications.map((item) => item.fleet));
        setFleets(availableFleets);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not load preferences.');
      }
    };

    void load();
  }, []);

  const addFleet = (fleet: string) => setSelectedFleets((current) => current.includes(fleet) ? current : [...current, fleet]);
  const removeFleet = (fleet: string) => setSelectedFleets((current) => current.filter((item) => item !== fleet));

  const save = async () => {
    setSaving(true);
    setError('');
    setSaved('');
    try {
      await api('/qualifications/me', {
        method: 'PUT',
        body: JSON.stringify({ fleets: selectedFleets }),
      });
      setSaved('Preferences saved.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save preferences.');
    } finally {
      setSaving(false);
    }
  };

  return <Screen scroll><Header title="Preferences" back={() => router.back()} /><View className="px-5"><Text className="mb-3 mt-5 text-sm font-extrabold text-ink">Fleet Qualifications</Text><FleetQualificationSelect options={fleets} selected={selectedFleets} open={qualificationOpen} onOpen={() => setQualificationOpen(true)} onClose={() => setQualificationOpen(false)} onSelect={addFleet} onRemove={removeFleet} /></View>{error ? <Text className="mx-5 mt-3.5 text-xs text-red">{error}</Text> : null}{saved ? <Text className="mx-5 mt-3.5 text-xs text-green">{saved}</Text> : null}<View className="m-5"><Button title={saving ? 'Saving...' : 'Save Preferences'} icon={Save} onPress={save} disabled={saving} /></View></Screen>;
}
