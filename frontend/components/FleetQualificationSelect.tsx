import { Modal, Pressable, Text, View } from 'react-native';
import { Check, ChevronRight, X } from 'lucide-react-native';
import { colors } from './ui';

type Props = {
  options: string[];
  selected: string[];
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onSelect: (fleet: string) => void;
  onRemove: (fleet: string) => void;
};

export function FleetQualificationSelect({ options, selected, open, onOpen, onClose, onSelect, onRemove }: Props) {
  return (
    <>
      <Pressable className={styles.selectField} onPress={onOpen}>
        <View>
          <Text className={styles.label}>Flight Qualification</Text>
          <Text className={styles.selectValue}>Select One</Text>
        </View>
        <ChevronRight size={18} color={colors.muted} />
      </Pressable>

      <View className={styles.chips}>
        {selected.map((fleet) => (
          <Pressable key={fleet} className={styles.chipActive} onPress={() => onRemove(fleet)}>
            <Text className={styles.chipActiveText}>{fleet}</Text>
            <X size={12} color="#fff" strokeWidth={2.6} />
          </Pressable>
        ))}
        {!selected.length ? <Text className={styles.empty}>No flight qualifications selected.</Text> : null}
      </View>

      <Modal transparent visible={open} animationType="fade" onRequestClose={onClose}>
        <Pressable className={styles.backdrop} onPress={onClose}>
          <Pressable className={styles.sheet} onPress={(event) => event.stopPropagation()}>
            <View className={styles.sheetHead}>
              <Text className={styles.sheetTitle}>Select Flight Qualification</Text>
              <Pressable className={styles.close} onPress={onClose}><X size={17} color={colors.ink} /></Pressable>
            </View>
            {options.map((fleet) => {
              const isSelected = selected.includes(fleet);
              return (
                <Pressable key={fleet} className={[styles.option, (isSelected && styles.optionSelected)].filter(Boolean).join(' ')} onPress={() => { onSelect(fleet); onClose(); }}>
                  <Text className={[styles.optionText, (isSelected && styles.optionTextSelected)].filter(Boolean).join(' ')}>{fleet}</Text>
                  {isSelected ? <Check size={16} color={colors.amber} strokeWidth={2.6} /> : null}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = { selectField: 'min-h-[62px] bg-[#FFFFFF] border border-[#E8E3DB] rounded-[12px] px-[14px] py-[10px] mb-[12px] flex-row justify-between items-center', label: 'text-[#17212B] text-[12px] font-bold mb-[8px]', selectValue: 'text-[#6B7480] text-[14px] font-bold', chips: 'flex-row flex-wrap gap-[8px] mb-[16px]', chipActive: 'bg-[#F8AD05] border border-[#F8AD05] rounded-[12px] py-[9px] px-[13px] flex-row items-center gap-[6px]', chipActiveText: 'text-[#fff] text-[11px] font-extrabold', empty: 'text-[#6B7480] text-[12px] leading-[18px]', backdrop: 'flex-1 bg-[rgba(23,33,43,0.28)] items-center justify-center p-[22px]', sheet: 'w-[100%] max-w-[340px] bg-[#FFFFFF] rounded-[14px] p-[14px] border border-[#E8E3DB]', sheetHead: 'flex-row items-center justify-between mb-[10px]', sheetTitle: 'text-[#17212B] text-[15px] font-extrabold', close: 'w-[32px] h-[32px] rounded-[10px] items-center justify-center bg-[#FFF9F0]', option: 'min-h-[46px] rounded-[11px] border border-[#E8E3DB] bg-[#FFF9F0] px-[13px] mb-[8px] flex-row items-center justify-between', optionSelected: 'bg-[#FFF1C7] border-[#F8AD05]', optionText: 'text-[#17212B] text-[13px] font-extrabold', optionTextSelected: 'text-[#17212B]' } as const;
