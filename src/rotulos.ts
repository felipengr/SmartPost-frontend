// Textos exibidos para os valores da API (o contrato manda os códigos; os textos ficam no app)
import type { StatusDenuncia, TipoProblema } from '@/types';

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

// Única sequência que a API aceita: recebida → em_analise → resolvida
export const PROXIMO_STATUS: Record<StatusDenuncia, StatusDenuncia | null> = {
  recebida: 'em_analise',
  em_analise: 'resolvida',
  resolvida: null,
};

// Texto do botão do gestor para levar ao próximo status
export const ACAO_STATUS: Record<StatusDenuncia, string> = {
  recebida: 'Mover para Em análise',
  em_analise: 'Marcar como resolvida',
  resolvida: '',
};
