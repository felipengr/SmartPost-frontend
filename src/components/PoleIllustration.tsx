import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

// Ilustração usada quando a denúncia ainda não tem foto (dados mockados)
export function PoleIllustration({
  height = 220,
  withWire = true,
}: {
  height?: number;
  withWire?: boolean;
}) {
  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.sky} />
      <View style={styles.ground} />
      <View style={[styles.pole, { height: height * 0.68, top: height * 0.3 }]} />
      <View style={[styles.crossarm, { top: height * 0.38 }]} />
      {withWire && (
        <>
          <View style={[styles.wire, { top: height * 0.43 }]} />
          <View style={[styles.spark, { top: height * 0.43 - 4 }]} />
        </>
      )}
    </View>
  );
}

const POLE = '#4A4036';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    alignItems: 'center',
  },
  sky: {
    ...StyleSheet.absoluteFill,
    bottom: '45%',
    backgroundColor: '#DCE7EC',
  },
  ground: {
    ...StyleSheet.absoluteFill,
    top: '55%',
    backgroundColor: '#E1E7DE',
  },
  pole: {
    position: 'absolute',
    width: 10,
    backgroundColor: POLE,
  },
  crossarm: {
    position: 'absolute',
    width: 76,
    height: 6,
    backgroundColor: POLE,
  },
  wire: {
    position: 'absolute',
    left: '13%',
    right: '15%',
    height: 2,
    backgroundColor: '#333',
  },
  spark: {
    position: 'absolute',
    right: '14%',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.danger,
  },
});
