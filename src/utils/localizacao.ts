import * as Location from 'expo-location';

import type { Posicao } from '@/api/endpoints';

const TEMPO_LIMITE_MS = 8_000;
// Posição recente o bastante para o feed (evita ligar o GPS a cada tela)
const VALIDADE_MS = 60_000;

let ultima: { posicao: Posicao; em: number } | null = null;

function paraPosicao(local: Location.LocationObject | null): Posicao | null {
  return local ? { latitude: local.coords.latitude, longitude: local.coords.longitude } : null;
}

// GPS ligado com precisão média; desiste depois de alguns segundos
async function posicaoAtual() {
  try {
    return await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      new Promise<null>((resolver) => setTimeout(() => resolver(null), TEMPO_LIMITE_MS)),
    ]);
  } catch {
    return null;
  }
}

// Posição do aparelho para mostrar a distância no feed, ou null se a pessoa negou a
// permissão ou o aparelho não sabe onde está. O feed funciona sem ela.
export async function obterPosicao(): Promise<Posicao | null> {
  if (ultima && Date.now() - ultima.em < VALIDADE_MS) return ultima.posicao;

  try {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) return null;

    // 1) última posição recente (sai na hora) → 2) GPS agora → 3) última posição de qualquer
    // idade: para a distância no feed, uma posição antiga é melhor que nenhuma
    const posicao =
      paraPosicao(await Location.getLastKnownPositionAsync({ maxAge: 5 * 60_000 })) ??
      paraPosicao(await posicaoAtual()) ??
      paraPosicao(await Location.getLastKnownPositionAsync());

    if (posicao) ultima = { posicao, em: Date.now() };
    else if (__DEV__) console.warn('[localização] o aparelho não informou nenhuma posição');
    return posicao;
  } catch (e) {
    if (__DEV__) console.warn('[localização]', e);
    return null;
  }
}
