import { PropsWithChildren } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function Screen({ children, scroll = true }: PropsWithChildren<{ scroll?: boolean; className?: string }>) {
  const content = scroll ? (
    <ScrollView className={styles.flex} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : <View className={styles.content}>{children}</View>;
  return <SafeAreaView edges={['top', 'bottom']} className={styles.screen}>{content}</SafeAreaView>;
}

const styles = { screen: 'flex-1 bg-[#FFF9F0]', flex: 'flex-1', content: 'flex-1 px-[20px]', scrollContent: 'px-[20px] pb-[32px]' } as const;
