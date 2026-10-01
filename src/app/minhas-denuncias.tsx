import { StyleSheet, View } from 'react-native';

import { ListaDenuncias } from '@/components/ListaDenuncias';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors } from '@/theme';

// Perfil → Minhas denúncias (GET /denuncias/minhas)
export default function MinhasDenuncias() {
  return (
    <View style={styles.screen}>
      <ScreenHeader title="Minhas denúncias" />
      <ListaDenuncias lista="minhas" textoVazio="Você ainda não registrou denúncias." />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
