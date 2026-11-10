import { Children, ReactNode } from 'react';
import { Pressable, Text, TextInput, TextInputProps, View } from 'react-native';
import { ChevronLeft, ChevronRight, LucideIcon } from 'lucide-react-native';

export const colors = {
  cream: '#FFF9F0', paper: '#FFFFFF', ink: '#17212B', muted: '#6B7480', line: '#E8E3DB',
  amber: '#F8AD05', amberSoft: '#FFF1C7', navySoft: '#EAF1F7', green: '#2D9D66',
  greenSoft: '#E7F6EC', red: '#D94B4B', redSoft: '#FDEAEA', yellow: '#F8AD05',
};

export function Logo({ compact = false }: { compact?: boolean }) {
  return <Text className={`${compact ? 'text-[24px]' : 'text-[35px]'} font-extrabold text-ink`}><Text>Crew</Text><Text className="text-yellow">Swap</Text></Text>;
}

export function Screen({ children, scroll = false }: { children: ReactNode; scroll?: boolean }) {
  const Content = scroll ? require('react-native').ScrollView : View;
  // React Native Web rejects text nodes directly inside a View. A Screen only
  // renders layout components, so whitespace/text nodes can be discarded.
  const screenChildren = Children.toArray(children).filter((child) => typeof child !== 'string');
  return <Content className="flex-1 bg-cream" contentContainerClassName={scroll ? 'pb-9' : undefined}>{screenChildren}</Content>;
}

export function Header({ title, back, right }: { title: string; back?: () => void; right?: ReactNode }) {
  return <View className="h-[76px] flex-row items-center justify-between px-5"><View className="w-[42px]">{back ? <Pressable onPress={back} className="h-[42px] w-[42px] items-center justify-center rounded-[15px] border border-[#E9EAEC] bg-white"><ChevronLeft size={22} color={colors.ink} /></Pressable> : null}</View><Text className="text-[20px] font-extrabold text-ink">{title}</Text><View className="w-[42px] items-end">{right}</View></View>;
}

export function Button({ title, onPress, secondary = false, disabled = false, icon: Icon }: { title: string; onPress: () => void; secondary?: boolean; disabled?: boolean; icon?: LucideIcon }) {
  const tone = secondary ? 'border border-yellow bg-white' : 'bg-yellow';
  const label = secondary ? 'text-yellow' : 'text-white';
  return <Pressable disabled={disabled} onPress={onPress} className={`min-h-[54px] flex-row items-center justify-center gap-2.5 rounded-[18px] px-[18px] shadow-sm ${tone} ${disabled ? 'opacity-55' : ''}`}>{Icon ? <Icon size={18} color={secondary ? colors.amber : '#fff'} strokeWidth={2.5} /> : null}<Text className={`text-[15px] font-extrabold ${label}`}>{title}</Text></Pressable>;
}

export function Field({ label, placeholder, value, onChangeText, multiline = false, ...props }: TextInputProps & { label: string }) {
  return <View className="mb-[18px]"><Text className="mb-2 text-[12px] font-bold text-ink">{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#9BA1A8" multiline={multiline} className={`rounded-[16px] border border-line bg-white px-[15px] text-[14px] font-medium text-ink ${multiline ? 'min-h-[104px] pt-[14px] text-top' : 'min-h-[54px]'}`} {...props} /></View>;
}

export function SelectField({ label, value, onPress }: { label: string; value: string; onPress?: () => void }) {
  return <Pressable onPress={onPress} className="mb-3 min-h-[66px] flex-row items-center justify-between rounded-[16px] border border-line bg-white px-[15px] py-[10px]"><View><Text className="mb-1 text-[12px] font-bold text-ink">{label}</Text><Text className="text-[14px] font-bold text-ink">{value}</Text></View><ChevronRight size={18} color={colors.muted} /></Pressable>;
}

export function SectionTitle({ title, action }: { title: string; action?: string }) {
  return <View className="mb-3 mt-6 flex-row items-center justify-between px-5"><Text className="text-[20px] font-extrabold text-ink">{title}</Text>{action ? <Text className="rounded-full bg-yellow/10 px-3 py-2 text-[12px] font-bold text-yellow">{action}</Text> : null}</View>;
}
