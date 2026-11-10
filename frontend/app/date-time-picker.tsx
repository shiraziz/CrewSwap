import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Button, colors, Header, Screen } from '@/components/ui';

const calendar = [['', '', '', '1', '2', '3', '4'], ['5', '6', '7', '8', '9', '10', '11'], ['12', '13', '14', '15', '16', '17', '18'], ['19', '20', '21', '22', '23', '24', '25'], ['26', '27', '28', '29', '30', '31', '']];
const hours = ['07', '08', '09'];
const minutes = ['59', '00', '01'];

export default function DateTimePicker() {
  const [day, setDay] = useState('20');
  const [hour, setHour] = useState('08');
  const [minute, setMinute] = useState('00');
  const [period, setPeriod] = useState('AM');
  return <Screen scroll><Header title="Select Date & Time" back={() => router.back()} /><View className="px-5"><Text className="mb-4 mt-3 text-[15px] font-extrabold text-ink">Select Date</Text><View className="flex-row items-center justify-between"><Text className="text-[16px] font-extrabold text-ink">May 2025</Text><View className="flex-row gap-[18px]"><ChevronLeft size={19} color={colors.ink} /><ChevronRight size={19} color={colors.ink} /></View></View><View className="mt-[22px] flex-row justify-between">{['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((label) => <Text key={label} className="w-[37px] text-center text-[10px] font-bold text-muted">{label}</Text>)}</View><View className="mt-2 flex-row flex-wrap">{calendar.flatMap((week, weekIndex) => week.map((value, dayIndex) => <Pressable key={`${weekIndex}-${dayIndex}`} onPress={() => value && setDay(value)} className={`h-[45px] w-[14.285%] items-center justify-center ${value === day ? 'rounded-[22px] bg-yellow' : ''}`}><Text className={`text-[13px] font-bold ${value === day ? 'text-white' : 'text-ink'}`}>{value}</Text></Pressable>))}</View><Text className="mb-4 mt-8 text-[15px] font-extrabold text-ink">Select Time</Text><View className="mb-[22px] h-[126px] flex-row items-center justify-center border-y border-line bg-white"><TimeWheel values={hours} selected={hour} onSelect={setHour} /><Text className="mx-[7px] text-[20px] font-extrabold text-ink">:</Text><TimeWheel values={minutes} selected={minute} onSelect={setMinute} /><TimeWheel values={['AM', 'PM']} selected={period} onSelect={setPeriod} /></View><Button title="Done" onPress={() => router.back()} /></View></Screen>;
}

function TimeWheel({ values, selected, onSelect }: { values: string[]; selected: string; onSelect: (value: string) => void }) {
  return <View className="w-[58px] items-center gap-3">{values.map((value) => <Pressable key={value} onPress={() => onSelect(value)}><Text className={`py-[3px] ${value === selected ? 'text-[22px] font-extrabold text-ink' : 'text-[16px] text-[#B5B8BB]'}`}>{value}</Text></Pressable>)}</View>;
}
