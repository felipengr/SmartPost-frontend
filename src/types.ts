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

// Item do feed como a API devolve (criadaEm já convertida de texto ISO para Date)
export type Denuncia = {
  id: string;
  protocolo: string;
  endereco: string;
  latitude: number;
  longitude: number;
  criadaEm: Date;
  tipos: TipoProblema[];
  status: StatusDenuncia;
  descricao: string;
  fotoUrl: string;
  // null quando o app não mandou a localização do usuário
  distanciaKm: number | null;
  // Feita pelo usuário logado (a API nunca diz quem denunciou)
  minha: boolean;
};

export type PaginaDenuncias = { itens: Denuncia[]; proximoCursor: string | null };
