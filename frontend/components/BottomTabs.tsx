import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

type Tab = {
  label: string;
  path: '/home' | '/matches' | '/swaps' | '/requests' | '/profile';
  icon: keyof typeof Ionicons.glyphMap;
  active: keyof typeof Ionicons.glyphMap;
};

const tabs: Tab[] = [
  { label: 'Home', path: '/home', icon: 'home-outline', active: 'home' },
  { label: 'Matches', path: '/matches', icon: 'apps-outline', active: 'apps' },
  { label: '', path: '/swaps', icon: 'add', active: 'add' },
  { label: 'Requests', path: '/requests', icon: 'chatbox-ellipses-outline', active: 'chatbox-ellipses' },
  { label: 'Profile', path: '/profile', icon: 'person-outline', active: 'person' },
];

export function BottomTabs() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View className="bg-white pt-px">
      <View className="h-[72px] flex-row items-center justify-between border-t border-[#E8E9EC] bg-white px-2 shadow-sm">
        {tabs.map((tab) => {
          const isActive = pathname === tab.path || pathname.startsWith(`${tab.path}/`);

          if (!tab.label) {
            return (
              <View key={tab.path} className="-mt-5 h-[72px] w-[68px] items-center justify-center">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Add a swap"
                  className="h-[56px] w-[56px] items-center justify-center rounded-full border-4 border-white bg-yellow shadow-lg active:scale-95 active:opacity-90"
                  onPress={() => router.push(tab.path)}
                >
                  <Ionicons name="add" size={30} color="#FFFFFF" />
                </Pressable>
              </View>
            );
          }

          return (
            <Pressable
              key={tab.path}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              className="relative h-[68px] flex-1 items-center justify-center pt-1 active:opacity-70"
              onPress={() => router.push(tab.path)}
            >
              <View className={`h-8 w-[38px] items-center justify-center rounded-2xl ${isActive ? 'bg-[#FFF8E7]' : ''}`}>
                <Ionicons name={isActive ? tab.active : tab.icon} size={21} color={isActive ? '#F8AD05' : '#8A9099'} />
              </View>
              <Text className={`mt-1 text-[10px] tracking-[0.1px] ${isActive ? 'font-bold text-yellow' : 'font-semibold text-[#8A9099]'}`} numberOfLines={1}>
                {tab.label}
              </Text>
              {isActive && <View className="absolute bottom-[3px] h-1 w-1 rounded-full bg-yellow" />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
