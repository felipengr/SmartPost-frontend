// Chamadas da API, uma por rota do contrato (docs/API.md)
import type { Municipio, Usuario } from '@/types';

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
