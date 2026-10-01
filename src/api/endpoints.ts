// Chamadas da API, uma por rota do contrato (docs/API.md)
import type { Denuncia, Municipio, PaginaDenuncias, Usuario } from '@/types';

import { api } from './cliente';

export function listarMunicipios() {
  return api<Municipio[]>('/municipios');
}

export function entrar(municipioId: string, cpf: string, senha: string) {
  return api<{ token: string; usuario: Usuario }>('/auth/login', {
    method: 'POST',
    corpo: { municipioId, cpf, senha },
  });
}

export type Perfil = Usuario & { estatisticas: { denuncias: number } };

export function buscarPerfil() {
  return api<Perfil>('/me');
}

// Na API a data vem como texto ISO; no app, usamos Date
type DenunciaDaApi = Omit<Denuncia, 'criadaEm'> & { criadaEm: string };

function converter(d: DenunciaDaApi): Denuncia {
  return { ...d, criadaEm: new Date(d.criadaEm) };
}

export type Posicao = { latitude: number; longitude: number };

type FiltroFeed = {
  // 'feed' = todas do município; 'minhas' = só as do usuário logado
  lista: 'feed' | 'minhas';
  cursor?: string | null;
  posicao?: Posicao | null;
};

export async function listarDenuncias({ lista, cursor, posicao }: FiltroFeed) {
  const query = new URLSearchParams({ limite: '20' });
  if (cursor) query.set('cursor', cursor);
  // Com a posição, cada item volta com distanciaKm
  if (posicao) {
    query.set('lat', String(posicao.latitude));
    query.set('lng', String(posicao.longitude));
  }
  const caminho = lista === 'minhas' ? '/denuncias/minhas' : '/denuncias';
  const pagina = await api<{ itens: DenunciaDaApi[]; proximoCursor: string | null }>(
    `${caminho}?${query}`,
  );
  return { ...pagina, itens: pagina.itens.map(converter) } satisfies PaginaDenuncias;
}
