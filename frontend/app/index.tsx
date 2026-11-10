import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { Plane } from 'lucide-react-native';
import { colors, Logo } from '@/components/ui';
import { useAuth } from '@/lib/auth';

export default function Launch() {
  const { loading, user } = useAuth();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? '/(tabs)/home' : '/login');
  }, [loading, user]);

  return (
    <View className={styles.container}>
      <Logo />
      <Text className={styles.tagline}>Swap smarter, fly better</Text>
      <View className={styles.bottom}>
        <View className={styles.plane}><Plane size={22} color={colors.amber} fill={colors.amber} /></View>
        <Text className={styles.loading}>Loading your session...</Text>
        <View className={styles.track}><View className={styles.progress} /></View>
      </View>
    </View>
  );
}

const styles = { container: 'flex-1 bg-[#FFF9F0] items-center justify-center p-[24px]', tagline: 'text-[#6B7480] text-[16px] mt-[12px]', bottom: 'absolute bottom-[70px] items-center', plane: 'bg-[#FFFFFF] w-[50px] h-[50px] rounded-[25px] justify-center items-center mb-[16px]', loading: 'text-[#17212B] text-[13px] mb-[16px]', track: 'w-[210px] h-[4px] bg-[#E1DED8] rounded-[2px]', progress: 'w-[128px] h-[4px] rounded-[2px] bg-[#F8AD05]' } as const;
