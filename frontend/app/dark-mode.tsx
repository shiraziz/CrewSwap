import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { colors, Header, Screen } from '@/components/ui';

export default function DarkMode() {
  const [mode, setMode] = useState('system');
  const options = [{ key: 'light', label: 'Light' }, { key: 'dark', label: 'Dark' }, { key: 'system', label: 'System Default' }];
  return <Screen scroll><Header title="Dark Mode" back={() => router.back()} /><View className={styles.list}>{options.map(({ key, label }) => <Pressable key={key} className={styles.item} onPress={() => setMode(key)}><Text className={styles.label}>{label}</Text>{mode === key ? <Check size={18} color={colors.amber} /> : null}</Pressable>)}</View></Screen>;
}
const styles = { list: 'mx-[20px] bg-[#FFFFFF] rounded-[14px] px-[16px] mt-[10px]', item: 'min-h-[52px] flex-row justify-between items-center border-b border-b-[#E8E3DB]', label: 'text-[#17212B] text-[13px] font-bold' } as const;
