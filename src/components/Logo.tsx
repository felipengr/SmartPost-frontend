import { Image, type ImageStyle, type StyleProp } from 'react-native';

// O PNG tem bastante margem branca ao redor do poste, por isso o tamanho visual é ~60% do `size`.
export function LogoIcon({ size = 48, style }: { size?: number; style?: StyleProp<ImageStyle> }) {
  return (
    <Image
      source={require('../../assets/icon-smartposte.png')}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
      accessibilityLabel="Smart Poste"
    />
  );
}
