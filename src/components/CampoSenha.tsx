import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, type TextInputProps, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';

type Props = Pick<
  TextInputProps,
  'value' | 'onChangeText' | 'placeholder' | 'onSubmitEditing' | 'returnKeyType' | 'autoComplete'
>;

// Campo de senha com o botão de olho para mostrar/esconder o que foi digitado
export function CampoSenha({ autoComplete = 'password', ...props }: Props) {
  const [visivel, setVisivel] = useState(false);

  return (
    <View style={styles.campo}>
      <TextInput
        {...props}
        style={styles.input}
        placeholderTextColor={colors.textSubtle}
        secureTextEntry={!visivel}
        autoComplete={autoComplete}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={visivel ? 'Esconder senha' : 'Mostrar senha'}
        onPress={() => setVisivel((v) => !v)}
        hitSlop={12}
        style={styles.olho}>
        <Ionicons
          name={visivel ? 'eye-off-outline' : 'eye-outline'}
          size={20}
          color={colors.textMuted}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: spacing.md,
    fontSize: 15,
    color: colors.text,
  },
  olho: {
    paddingHorizontal: spacing.md,
    height: '100%',
    justifyContent: 'center',
  },
});
