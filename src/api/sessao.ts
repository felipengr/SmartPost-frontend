import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { Usuario } from '@/types';

// Sessão salva no cofre criptografado do aparelho (Keychain no iOS, Keystore no Android),
// para o app abrir já logado. No navegador o SecureStore não existe: lá nada é salvo
// e o login dura só enquanto a aba estiver aberta.
const CHAVE = 'smartposte.sessao';
const disponivel = Platform.OS !== 'web';

export type Sessao = { token: string; usuario: Usuario };

export async function lerSessao(): Promise<Sessao | null> {
  if (!disponivel) return null;
  try {
    const salva = await SecureStore.getItemAsync(CHAVE);
    return salva ? (JSON.parse(salva) as Sessao) : null;
  } catch {
    // Conteúdo corrompido ou cofre indisponível: começa deslogado
    return null;
  }
}

export async function salvarSessao(sessao: Sessao) {
  if (disponivel) await SecureStore.setItemAsync(CHAVE, JSON.stringify(sessao));
}

export async function apagarSessao() {
  if (disponivel) await SecureStore.deleteItemAsync(CHAVE);
}
