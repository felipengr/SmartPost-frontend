import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import { colors, radius } from '@/theme';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'link';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

export function Button({ title, onPress, variant = 'primary', loading, disabled, style }: Props) {
  const isPrimary = variant === 'primary';
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        isPrimary ? styles.primary : styles.link,
        inactive && isPrimary && styles.disabled,
        pressed && { opacity: 0.8 },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#fff' : colors.primary} />
      ) : (
        <Text style={isPrimary ? styles.primaryText : styles.linkText}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  primaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  linkText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
});
