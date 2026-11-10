import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ChevronRight, Globe, HelpCircle, Lock, LogOut, Moon, Shield, UserRound } from 'lucide-react-native';
import { colors, Header, Screen } from '@/components/ui';
import { useAuth } from '@/lib/auth';

const items = [
  { label: 'Personal Information', icon: UserRound, path: '/personal-info' },
  { label: 'Privacy & Security', icon: Shield, path: '/privacy' },
  { label: 'Language', icon: Globe, path: '/language' },
  { label: 'Dark Mode', icon: Moon, path: '/dark-mode' },
  { label: 'Change Password', icon: Lock, path: '/change-password' },
  { label: 'Help & Support', icon: HelpCircle, path: '/help' },
];

export default function Settings() {
  const auth = useAuth();
  const logout = async () => {
    await auth.logout();
    router.replace('/login');
  };
  return <Screen scroll><Header title="Settings" back={() => router.back()} /><View className="mx-5 overflow-hidden rounded-2xl border border-line bg-paper px-3.5">{items.map(({ label, icon: Icon, path }) => <Pressable key={label} className="min-h-[58px] flex-row items-center justify-between border-b border-line active:bg-cream" onPress={() => router.push(path as never)}><View className="flex-row items-center gap-3"><View className="h-8 w-8 items-center justify-center rounded-[10px] bg-cream"><Icon size={17} color={colors.ink} /></View><Text className="text-[13px] font-bold text-ink">{label}</Text></View><ChevronRight size={17} color={colors.muted} /></Pressable>)}</View><Pressable onPress={logout} className="mb-[18px] mt-8 flex-row self-center items-center gap-1.5"><LogOut size={16} color={colors.red} /><Text className="text-[13px] font-extrabold text-red">Log out</Text></Pressable></Screen>;
}
