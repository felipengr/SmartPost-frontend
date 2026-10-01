// Chamadas da API, uma por rota do contrato (docs/API.md)
import { File } from 'expo-file-system';

import type {
  Denuncia,
  Municipio,
  PaginaDenuncias,
  Papel,
  StatusDenuncia,
  TipoProblema,
  Usuario,
} from '@/types';

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

export type NovaDenuncia = {
  fotoUri: string;
  tipos: TipoProblema[];
  descricao: string;
  posicao: Posicao;
  endereco: string;
};

// multipart/form-data, como no contrato. No SDK 57 o fetch global é o expo/fetch (padrão
// web), que só aceita Blob no FormData: o File do expo-file-system é um Blob que lê o
// arquivo do disco na hora de enviar. O antigo { uri, name, type } não funciona mais.
export async function publicarDenuncia(nova: NovaDenuncia) {
  const form = new FormData();
  form.append('foto', new File(nova.fotoUri), 'foto.jpg');
  for (const tipo of nova.tipos) form.append('tipos', tipo);
  if (nova.descricao) form.append('descricao', nova.descricao);
  form.append('latitude', String(nova.posicao.latitude));
  form.append('longitude', String(nova.posicao.longitude));
  form.append('endereco', nova.endereco);

  return converter(
    await api<DenunciaDaApi>('/denuncias', { method: 'POST', corpo: form, tempoLimiteMs: 60_000 }),
  );
}

// Troca a senha. A API derruba todas as sessões (inclusive esta) e devolve um token novo
export function trocarSenha(senhaAtual: string, novaSenha: string) {
  return api<{ token: string }>('/me/senha', { method: 'PATCH', corpo: { senhaAtual, novaSenha } });
}

export type NovoUsuario = {
  nome: string;
  cpf: string;
  senhaInicial: string;
  papel: Papel;
};

// Só gestor. O usuário nasce no município do gestor logado (a API decide, não o app)
export function cadastrarUsuario(novo: NovoUsuario) {
  return api<Usuario>('/usuarios', { method: 'POST', corpo: novo });
}

// Como o gestor vê cada usuário da cidade (CPF só mascarado, a API nunca manda o completo)
export type UsuarioDaCidade = {
  id: string;
  nome: string;
  papel: Papel;
  cpfMascarado: string;
  criadoEm: string;
};

// Só gestor: usuários do município dele, por nome (até 50; `busca` por nome ou parte do CPF)
export function listarUsuarios(busca: string) {
  const query = busca.trim() ? `?${new URLSearchParams({ busca: busca.trim() })}` : '';
  return api<{ itens: UsuarioDaCidade[]; total: number }>(`/usuarios${query}`);
}

// Só gestor: senha nova para quem esqueceu (a pessoa sai de todos os aparelhos)
export function redefinirSenha(id: string, novaSenha: string) {
  return api<void>(`/usuarios/${id}/senha`, { method: 'PATCH', corpo: { novaSenha } });
}

// Só gestor: avança o status (recebida → em_analise → resolvida). Devolve o item atualizado
export async function mudarStatus(id: string, status: StatusDenuncia) {
  return converter(
    await api<DenunciaDaApi>(`/denuncias/${id}/status`, { method: 'PATCH', corpo: { status } }),
  );
}
