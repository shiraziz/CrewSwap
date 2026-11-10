import { useState } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ChevronRight, Lock, Trash2 } from 'lucide-react-native';
import { colors, Header, Screen } from '@/components/ui';

export default function Privacy() {
  const [profileVisible, setProfileVisible] = useState(true);
  const [showPhone, setShowPhone] = useState(false);
  const [showEmail, setShowEmail] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [shareHistory, setShareHistory] = useState(true);

  const toggles = [
    { label: 'Profile visible to crew', value: profileVisible, onChange: setProfileVisible },
    { label: 'Show phone number', value: showPhone, onChange: setShowPhone },
    { label: 'Show email address', value: showEmail, onChange: setShowEmail },
    { label: 'Two-factor authentication', value: twoFactor, onChange: setTwoFactor },
    { label: 'Share swap history for matching', value: shareHistory, onChange: setShareHistory },
  ];

  return (
    <Screen scroll>
      <Header title="Privacy & Security" back={() => router.back()} />

      <Text className={styles.section}>Visibility</Text>
      <View className={styles.card}>
        {toggles.map(({ label, value, onChange }, i) => (
          <View key={label} className={[styles.row, (i === toggles.length - 1 && styles.rowLast)].filter(Boolean).join(' ')}>
            <Text className={styles.label}>{label}</Text>
            <Switch value={value} onValueChange={onChange} trackColor={{ false: colors.line, true: colors.amber }} thumbColor="#fff" />
          </View>
        ))}
      </View>

      <Text className={styles.section}>Account</Text>
      <View className={styles.card}>
        <Pressable className={styles.linkRow} onPress={() => router.push('/change-password')}>
          <View className={styles.linkLeft}>
            <Lock size={16} color={colors.ink} />
            <Text className={styles.label}>Change Password</Text>
          </View>
          <ChevronRight size={17} color={colors.muted} />
        </Pressable>
      </View>

      <Pressable className={styles.delete}>
        <Trash2 size={16} color={colors.red} />
        <Text className={styles.deleteText}>Delete Account</Text>
      </Pressable>
    </Screen>
  );
}

const styles = { section: 'text-[#17212B] text-[14px] font-extrabold mx-[20px] mt-[20px] mb-[11px]', card: 'mx-[20px] bg-[#FFFFFF] rounded-[14px] px-[16px]', row: 'min-h-[54px] flex-row justify-between items-center border-b border-b-[#E8E3DB]', rowLast: 'border-b-[0px]', label: 'text-[#17212B] text-[13px] font-bold', linkRow: 'min-h-[52px] flex-row justify-between items-center', linkLeft: 'flex-row items-center gap-[12px]', delete: 'self-center flex-row gap-[6px] items-center mt-[26px] mb-[18px]', deleteText: 'text-[#D94B4B] text-[13px] font-extrabold' } as const;
