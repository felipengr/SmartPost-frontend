import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AppProvider, useApp } from '@/context/AppContext';
import { colors } from '@/theme';

function RootStack() {
  const { usuario } = useApp();

  // A ordem importa: quando o guard muda, o Expo Router redireciona para a primeira
  // tela disponível. Logado → (tabs)/feed. Deslogado → splash.
  // Município e login ficam só no fluxo deslogado; senão, após o login, o histórico
  // voltaria para a tela de município em vez de ir para o feed.
  return (
    <Stack
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Protected guard={!!usuario}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="denuncia/nova" />
        <Stack.Screen name="denuncia/detalhes" />
        <Stack.Screen name="denuncia/sucesso" options={{ gestureEnabled: false }} />
        <Stack.Screen name="minhas-denuncias" />
        <Stack.Screen name="alterar-senha" />
        <Stack.Screen name="cadastrar-morador" />
        <Stack.Screen name="moradores" />
      </Stack.Protected>

      <Stack.Protected guard={!usuario}>
        <Stack.Screen name="index" />
        <Stack.Screen name="municipio" />
        <Stack.Screen name="login" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <StatusBar style="dark" />
      <RootStack />
    </AppProvider>
  );
}
