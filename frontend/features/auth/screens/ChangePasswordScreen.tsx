import { useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { Save } from 'lucide-react-native';
import { api } from '@/lib/api';
import { Button, colors, Field, Header, Screen } from '@/components/ui';

export default function ChangePassword() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setError('');
    setSaved('');
    if (!current || next.length < 8 || next !== confirm) {
      setError('Enter your current password and matching new passwords of at least 8 characters.');
      return;
    }
    setSaving(true);
    try {
      await api('/auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword: current, newPassword: next }) });
      setCurrent('');
      setNext('');
      setConfirm('');
      setSaved('Password updated.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update password.');
    } finally {
      setSaving(false);
    }
  };

  return <Screen scroll><Header title="Change Password" back={() => router.back()} /><View className="px-5"><Field label="Current Password" placeholder="Enter current password" value={current} onChangeText={setCurrent} secureTextEntry /><Field label="New Password" placeholder="Enter new password" value={next} onChangeText={setNext} secureTextEntry /><Field label="Confirm New Password" placeholder="Re-enter new password" value={confirm} onChangeText={setConfirm} secureTextEntry /><Text className="-mt-2 mb-4 text-[11px] text-muted">At least 8 characters.</Text>{error ? <Text className="mb-3 text-xs text-red">{error}</Text> : null}{saved ? <Text className="mb-3 text-xs text-green">{saved}</Text> : null}<View className="mt-1.5"><Button title={saving ? 'Updating...' : 'Update Password'} icon={Save} onPress={save} /></View></View></Screen>;
}
