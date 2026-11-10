import { Tabs } from 'expo-router';
import { BottomTabs } from '@/components/BottomTabs';

export default function TabsLayout() {
  return <Tabs tabBar={() => <BottomTabs />} screenOptions={{ headerShown: false }} />;
}
