// Única porta de saída do app para a API (contrato em docs/API.md).
// Endereço em EXPO_PUBLIC_API_URL (.env.local). No emulador Android, o computador é 10.0.2.2.
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:3333/v1';

const TEMPO_LIMITE_MS = 15_000;

// Erro no formato do contrato: { erro: { codigo, mensagem, campos? } }.
// `mensagem` já vem em português e pode ir direto para a tela.
export class ErroApi extends Error {
  constructor(
    readonly status: number,
    readonly codigo: string,
    mensagem: string,
    readonly campos?: Record<string, string>,
  ) {
    super(mensagem);
  }
}

let token: string | null = null;
let aoExpirarSessao: (() => void) | null = null;

export function definirToken(novo: string | null) {
  token = novo;
}

// O AppContext registra aqui o que fazer quando a API responder 401 (voltar ao login)
export function quandoSessaoExpirar(acao: (() => void) | null) {
  aoExpirarSessao = acao;
}

type Opcoes = {
  method?: 'GET' | 'POST' | 'PATCH';
  // Objeto vira JSON; FormData vai como multipart (o fetch monta o boundary)
  corpo?: unknown;
};

export async function api<T>(caminho: string, { method = 'GET', corpo }: Opcoes = {}): Promise<T> {
  const headers: Record<string, string> = { accept: 'application/json' };
  if (token) headers.authorization = `Bearer ${token}`;

  let body: BodyInit | undefined;
  if (corpo instanceof FormData) {
    body = corpo;
  } else if (corpo !== undefined) {
    headers['content-type'] = 'application/json';
    body = JSON.stringify(corpo);
  }

  const controle = new AbortController();
  const relogio = setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);

  let resposta: Response;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      method,
      headers,
      body,
      signal: controle.signal,
    });
  } catch {
    throw new ErroApi(
      0,
      'SEM_CONEXAO',
      'Não foi possível falar com o servidor. Verifique sua internet e tente de novo.',
    );
  } finally {
    clearTimeout(relogio);
  }

  if (resposta.status === 204) return undefined as T;

  const dados = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    const erro = dados?.erro;
    // Token vencido, adulterado ou anterior a uma troca de senha: volta para o login.
    // O 401 do próprio login (senha errada) não conta: ali ainda não há sessão.
    if (resposta.status === 401 && token) aoExpirarSessao?.();
    throw new ErroApi(
      resposta.status,
      erro?.codigo ?? 'ERRO_INTERNO',
      erro?.mensagem ?? 'Algo deu errado. Tente novamente mais tarde.',
      erro?.campos,
    );
  }

  return dados as T;
}
