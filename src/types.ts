export type Municipio = {
  id: string;
  nome: string;
  uf: string;
  estado: string;
};

export type Papel = 'cidadao' | 'gestor';

// Como a API devolve (sem CPF: o servidor nunca manda)
export type Usuario = {
  id: string;
  nome: string;
  papel: Papel;
  municipio: Municipio;
};

export type TipoProblema =
  | 'fio_exposto'
  | 'sem_energia'
  | 'sem_internet'
  | 'sem_telefone'
  | 'risco_populacao';

export type StatusDenuncia = 'recebida' | 'em_analise' | 'resolvida';

export type Denuncia = {
  id: string;
  protocolo: string;
  endereco: string;
  criadaEm: Date;
  tipos: TipoProblema[];
  status: StatusDenuncia;
  descricao: string;
  distanciaKm: number;
  fotoUri?: string;
  // Mock: marca denúncias feitas pelo usuário logado
  doUsuario?: boolean;
};
