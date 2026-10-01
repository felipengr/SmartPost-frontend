import * as Location from 'expo-location';

import type { Posicao } from '@/api/endpoints';

const TEMPO_LIMITE_MS = 8_000;
// Posição recente o bastante para o feed (evita ligar o GPS a cada tela)
const VALIDADE_MS = 60_000;

let ultima: { posicao: Posicao; em: number } | null = null;

function paraPosicao(local: Location.LocationObject | null): Posicao | null {
  return local ? { latitude: local.coords.latitude, longitude: local.coords.longitude } : null;
}

// Liga o GPS e desiste depois de alguns segundos
async function posicaoAtual(
  precisao = Location.Accuracy.Balanced,
  tempoLimiteMs = TEMPO_LIMITE_MS,
) {
  try {
    return await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: precisao }),
      new Promise<null>((resolver) => setTimeout(() => resolver(null), tempoLimiteMs)),
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

export type LocalDaDenuncia = { posicao: Posicao; endereco: string };

// Erro com mensagem pronta para a tela da nova denúncia
export class ErroLocalizacao extends Error {}

// "Rua Dr. Cândido Rodrigues - Centro": só rua e bairro, sem o número. O endereço aparece
// para todo o município no feed, e o número pode ser a casa de quem denunciou.
// (O Android às vezes devolve o número em `name`: só usa `name` se tiver letras.)
function formatarEndereco(item: Location.LocationGeocodedAddress | undefined) {
  const nomeDoLugar = item?.name && /[a-zà-ÿ]/i.test(item.name) ? item.name : null;
  const rua = item?.street ?? nomeDoLugar;
  const texto = [rua, item?.district].filter(Boolean).join(' - ');
  return (texto || item?.city || item?.subregion || 'Endereço não identificado').slice(0, 300);
}

// Onde está o problema: precisa ser a posição de agora (é ela que vai para a prefeitura),
// então aqui não vale a última posição antiga como no feed
export async function obterLocalDaDenuncia(): Promise<LocalDaDenuncia> {
  const { granted } = await Location.requestForegroundPermissionsAsync();
  if (!granted) {
    throw new ErroLocalizacao(
      'Permita o acesso à localização nas configurações do aparelho para registrar onde está o problema.',
    );
  }

  const local =
    (await posicaoAtual(Location.Accuracy.High, 15_000)) ??
    (await Location.getLastKnownPositionAsync({ maxAge: 2 * 60_000 }));
  const posicao = paraPosicao(local);
  if (!posicao) {
    throw new ErroLocalizacao(
      'Não foi possível obter sua localização. Verifique se o GPS está ligado e tente de novo.',
    );
  }
  ultima = { posicao, em: Date.now() };

  // Endereço por extenso a partir das coordenadas; se falhar, segue com bairro/cidade ou um aviso
  let endereco: string;
  try {
    const [item] = await Location.reverseGeocodeAsync(posicao);
    endereco = formatarEndereco(item);
  } catch {
    endereco = formatarEndereco(undefined);
  }
  return { posicao, endereco };
}
