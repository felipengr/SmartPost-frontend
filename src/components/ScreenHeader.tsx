import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme';

// Cabeçalho simples com botão voltar, usado no fluxo de nova denúncia
export function ScreenHeader({ title }: { title: string }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <Pressable hitSlop={12} accessibilityLabel="Voltar" onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={22} color={colors.text} />
      </Pressable>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
});
