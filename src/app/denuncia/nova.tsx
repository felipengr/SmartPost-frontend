import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LogoIcon } from '@/components/Logo';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useApp } from '@/context/AppContext';
import { colors, radius, spacing } from '@/theme';

// 05 — Nova Denúncia (câmera)
export default function NovaDenuncia() {
  const insets = useSafeAreaInsets();
  const { municipio, setFotoRascunho } = useApp();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [pronta, setPronta] = useState(false);
  const [capturando, setCapturando] = useState(false);

  const temPermissao = permission?.granted ?? false;

  // Pede a permissão uma única vez ao abrir; depois, só pelo link na tela
  const jaPediu = useRef(false);
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain && !jaPediu.current) {
      jaPediu.current = true;
      requestPermission();
    }
  }, [permission, requestPermission]);

  const capturar = async () => {
    // Sem câmera (simulador/permissão negada): segue sem foto, usando a ilustração mock
    if (!temPermissao || !pronta || !cameraRef.current) {
      setFotoRascunho(undefined);
      router.push('/denuncia/detalhes');
      return;
    }
    try {
      setCapturando(true);
      const foto = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        // Sem som de disparo, para não constranger quem está fotografando na rua
        shutterSound: false,
      });
      setFotoRascunho(foto.uri);
      router.push('/denuncia/detalhes');
    } finally {
      setCapturando(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Nova denúncia" />

      {/* O botão fica fora da área da câmera: ela corta o que passa da borda (overflow) */}
      <View style={styles.cameraWrapper}>
        <View style={styles.cameraArea}>
          {temPermissao && (
            <CameraView
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              facing="back"
              onCameraReady={() => setPronta(true)}
            />
          )}

          <Text style={styles.hint}>Enquadre o poste e o fio danificado</Text>

          <View style={[styles.frame, temPermissao && styles.frameTransparent]}>
            {!temPermissao && (
              <View style={styles.noPermission}>
                <LogoIcon size={80} />
                {permission && !permission.granted && (
                  <Pressable onPress={requestPermission} hitSlop={8}>
                    <Text style={styles.permissionText}>
                      {permission.canAskAgain
                        ? 'Permitir acesso à câmera'
                        : 'Câmera bloqueada nas configurações'}
                    </Text>
                  </Pressable>
                )}
              </View>
            )}
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tirar foto"
          onPress={capturar}
          disabled={capturando}
          style={({ pressed }) => [styles.shutter, pressed && { transform: [{ scale: 0.95 }] }]}>
          <View style={styles.shutterInner}>
            {capturando && <ActivityIndicator color="#fff" />}
          </View>
        </Pressable>
      </View>

      <View style={[styles.info, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Text style={styles.infoText}>
          Localização e horário serão adicionados automaticamente.
        </Text>
        <Text style={styles.infoText}>Depois da foto, você poderá indicar o tipo de problema.</Text>

        <View style={styles.location}>
          <View style={{ flex: 1 }}>
            <View style={styles.row}>
              <Ionicons name="location-outline" size={13} color={colors.primary} />
              <Text style={styles.locationTitle}>
                {municipio ? `${municipio.nome} • ${municipio.uf}` : 'Localização'}
              </Text>
            </View>
            <Text style={styles.locationSub}>Ativar localização precisa</Text>
          </View>
          <Text style={styles.locationStatus}>Ativa</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  cameraWrapper: {
    alignItems: 'center',
    zIndex: 1,
    elevation: 1,
  },
  cameraArea: {
    alignSelf: 'stretch',
    height: 300,
    backgroundColor: colors.cameraBg,
    alignItems: 'center',
    paddingTop: spacing.md,
    overflow: 'hidden',
  },
  hint: {
    color: '#fff',
    fontSize: 13,
    marginBottom: spacing.md,
  },
  frame: {
    width: '58%',
    height: 150,
    borderWidth: 1,
    borderColor: '#4CAF73',
    borderRadius: radius.lg,
    backgroundColor: colors.cameraFrame,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameTransparent: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  noPermission: {
    alignItems: 'center',
  },
  permissionText: {
    color: '#9FE0B8',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  shutter: {
    position: 'absolute',
    bottom: -24,
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl + spacing.sm,
    gap: spacing.md,
  },
  infoText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  locationSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  locationStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
});
