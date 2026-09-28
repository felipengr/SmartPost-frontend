import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme';

const TABS = {
  feed: { label: 'Feed', icon: 'home-outline', iconActive: 'home' },
  perfil: { label: 'Perfil', icon: 'person-circle-outline', iconActive: 'person-circle' },
} as const;

// Barra inferior customizada: Feed | botão central de câmera | Perfil
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const renderTab = (routeName: keyof typeof TABS) => {
    const index = state.routes.findIndex((r) => r.name === routeName);
    const route = state.routes[index];
    const focused = state.index === index;
    const tab = TABS[routeName];
    const color = focused ? colors.primary : colors.textMuted;

    return (
      <Pressable
        key={routeName}
        accessibilityRole="tab"
        accessibilityState={{ selected: focused }}
        style={styles.tab}
        onPress={() => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        }}>
        <Ionicons name={focused ? tab.iconActive : tab.icon} size={24} color={color} />
        <Text style={[styles.label, { color }]}>{tab.label}</Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      {renderTab('feed')}
      <View style={styles.tab}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Nova denúncia"
          onPress={() => router.push('/denuncia/nova')}
          style={({ pressed }) => [styles.cameraButton, pressed && { opacity: 0.85 }]}>
          <Ionicons name="camera" size={24} color="#fff" />
        </Pressable>
      </View>
      {renderTab('perfil')}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.sm + 2,
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
  },
  cameraButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
