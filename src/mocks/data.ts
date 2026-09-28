import type { Denuncia, Municipio, StatusDenuncia, TipoProblema, Usuario } from '@/types';

export const MUNICIPIOS: Municipio[] = [
  { id: 'piracaia', nome: 'Piracaia', uf: 'SP', estado: 'São Paulo' },
];

export const USUARIO_MOCK: Usuario = {
  nome: 'Felipe Nogueira',
  cpf: '000.000.000-00',
};

export const TIPO_LABEL: Record<TipoProblema, string> = {
  fio_exposto: 'Fio rompido / exposto',
  sem_energia: 'Sem energia',
  sem_internet: 'Sem internet',
  sem_telefone: 'Sem telefone',
  risco_populacao: 'Risco à população',
};

// Rótulo curto usado nos chips do feed
export const TIPO_CHIP: Record<TipoProblema, string> = {
  fio_exposto: 'Fio exposto',
  sem_energia: 'Sem energia',
  sem_internet: 'Sem internet',
  sem_telefone: 'Sem telefone',
  risco_populacao: 'Risco',
};

export const STATUS_LABEL: Record<StatusDenuncia, string> = {
  recebida: 'Recebida',
  em_analise: 'Em análise',
  resolvida: 'Resolvida',
};

const minutosAtras = (min: number) => new Date(Date.now() - min * 60_000);

export const DENUNCIAS_MOCK: Denuncia[] = [
  {
    id: '248',
    protocolo: 'SP-0248',
    endereco: 'Rua Dr. Cândido Rodrigues',
    criadaEm: minutosAtras(12),
    tipos: ['fio_exposto', 'sem_energia'],
    status: 'recebida',
    descricao: 'Fio rompido próximo à calçada. Área sem energia desde o início da tarde.',
    distanciaKm: 1.2,
    doUsuario: true,
  },
  {
    id: '247',
    protocolo: 'SP-0247',
    endereco: 'Av. Dr. Pedro Álvares Cabral',
    criadaEm: minutosAtras(95),
    tipos: ['sem_internet', 'sem_telefone'],
    status: 'em_analise',
    descricao: 'Cabo de telecomunicação caído após a chuva. Rua inteira sem internet.',
    distanciaKm: 2.8,
  },
  {
    id: '241',
    protocolo: 'SP-0241',
    endereco: 'Rua XV de Novembro',
    criadaEm: minutosAtras(60 * 5),
    tipos: ['risco_populacao', 'fio_exposto'],
    status: 'resolvida',
    descricao: 'Poste inclinado com fios baixos em frente à escola.',
    distanciaKm: 0.6,
    doUsuario: true,
  },
];

// Estatísticas do perfil (mock até termos backend)
export const ESTATISTICAS_MOCK = {
  denuncias: 12,
  resolvidas: 8,
  emAnalise: 4,
};
