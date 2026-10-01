import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { definirToken, ErroApi, quandoSessaoExpirar } from '@/api/cliente';
import { buscarPerfil, entrar, trocarSenha as trocarSenhaNaApi } from '@/api/endpoints';
import { apagarSessao, lerSessao, salvarSessao } from '@/api/sessao';
import type { Municipio, Usuario } from '@/types';

type AppContextValue = {
  municipio: Municipio | null;
  usuario: Usuario | null;
  // Foto da denúncia em andamento. Fica no estado (e não em params da rota) porque o
  // caminho do arquivo tem caracteres codificados (%40, %2F) que o router decodificaria.
  fotoRascunho: string | undefined;
  setFotoRascunho: (uri: string | undefined) => void;
  selecionarMunicipio: (m: Municipio) => void;
  // Lança ErroApi com a mensagem pronta para a tela se o login falhar
  login: (cpf: string, senha: string) => Promise<void>;
  logout: () => void;
  // Lança ErroApi (ex.: SENHA_INCORRETA) com a mensagem pronta para a tela
  trocarSenha: (senhaAtual: string, novaSenha: string) => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

// Estado global: sessão e rascunho da nova denúncia. As listas de denúncias
// vêm da API em cada tela (hook useDenuncias).
export function AppProvider({ children }: { children: ReactNode }) {
  const [municipio, setMunicipio] = useState<Municipio | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [fotoRascunho, setFotoRascunho] = useState<string | undefined>();

  // Sai da conta: esquece o token e apaga a sessão salva no aparelho.
  // Com usuario = null, o Stack.Protected do _layout volta para o fluxo de login.
  const logout = useCallback(() => {
    definirToken(null);
    setUsuario(null);
    apagarSessao().catch(() => {});
  }, []);

  // Ao abrir o app: restaura a sessão salva e confere com a API se ela ainda vale
  // (a senha pode ter sido trocada em outro aparelho, o que derruba o token)
  useEffect(() => {
    quandoSessaoExpirar(logout);

    lerSessao().then((sessao) => {
      if (!sessao) return;
      definirToken(sessao.token);
      setUsuario(sessao.usuario);
      setMunicipio(sessao.usuario.municipio);

      buscarPerfil()
        .then(({ estatisticas: _, ...atual }) => {
          setUsuario(atual);
          salvarSessao({ token: sessao.token, usuario: atual }).catch(() => {});
        })
        // 401 já desloga pelo quandoSessaoExpirar; sem internet, segue com a sessão salva
        .catch(() => {});
    });

    return () => quandoSessaoExpirar(null);
  }, [logout]);

  const login = useCallback(
    async (cpf: string, senha: string) => {
      if (!municipio) {
        throw new ErroApi(0, 'SEM_MUNICIPIO', 'Volte e selecione o seu município.');
      }
      const sessao = await entrar(municipio.id, cpf, senha);
      definirToken(sessao.token);
      await salvarSessao(sessao);
      setMunicipio(sessao.usuario.municipio);
      setUsuario(sessao.usuario);
    },
    [municipio],
  );

  // A API derruba todas as sessões ao trocar a senha (inclusive esta) e devolve um token
  // novo: guardá-lo na hora mantém este aparelho logado
  const trocarSenha = useCallback(
    async (senhaAtual: string, novaSenha: string) => {
      const { token } = await trocarSenhaNaApi(senhaAtual, novaSenha);
      definirToken(token);
      if (usuario) await salvarSessao({ token, usuario });
    },
    [usuario],
  );

  const value = useMemo(
    () => ({
      municipio,
      usuario,
      fotoRascunho,
      setFotoRascunho,
      selecionarMunicipio: setMunicipio,
      login,
      logout,
      trocarSenha,
    }),
    [municipio, usuario, fotoRascunho, login, logout, trocarSenha],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp deve ser usado dentro de <AppProvider>');
  return ctx;
}
