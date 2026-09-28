import { StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '@/theme';

type Tone = keyof typeof colors.chip;

export function Chip({ label, tone }: { label: string; tone: Tone }) {
  const c = colors.chip[tone];
  return (
    <View style={[styles.chip, { backgroundColor: c.bg }]}>
      <Text style={[styles.text, { color: c.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
});
