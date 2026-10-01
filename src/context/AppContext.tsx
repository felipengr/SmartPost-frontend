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
import { buscarPerfil, entrar } from '@/api/endpoints';
import { apagarSessao, lerSessao, salvarSessao } from '@/api/sessao';
import { DENUNCIAS_MOCK } from '@/mocks/data';
import type { Denuncia, Municipio, TipoProblema, Usuario } from '@/types';

type NovaDenuncia = {
  fotoUri?: string;
  tipos: TipoProblema[];
  observacao: string;
};

type AppContextValue = {
  municipio: Municipio | null;
  usuario: Usuario | null;
  denuncias: Denuncia[];
  // Foto da denúncia em andamento. Fica no estado (e não em params da rota) porque o
  // caminho do arquivo tem caracteres codificados (%40, %2F) que o router decodificaria.
  fotoRascunho: string | undefined;
  setFotoRascunho: (uri: string | undefined) => void;
  selecionarMunicipio: (m: Municipio) => void;
  // Lança ErroApi com a mensagem pronta para a tela se o login falhar
  login: (cpf: string, senha: string) => Promise<void>;
  logout: () => void;
  criarDenuncia: (dados: NovaDenuncia) => Denuncia;
};

const AppContext = createContext<AppContextValue | null>(null);

// Estado global. Login e sessão já usam a API; as denúncias ainda são mock.
export function AppProvider({ children }: { children: ReactNode }) {
  const [municipio, setMunicipio] = useState<Municipio | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [denuncias, setDenuncias] = useState<Denuncia[]>(DENUNCIAS_MOCK);
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

  const criarDenuncia = useCallback(
    ({ fotoUri, tipos, observacao }: NovaDenuncia) => {
      const ultimo = Math.max(...denuncias.map((d) => Number(d.id)), 0);
      const id = String(ultimo + 1);
      const nova: Denuncia = {
        id,
        protocolo: `SP-${id.padStart(4, '0')}`,
        endereco: 'Rua Dr. Cândido Rodrigues',
        criadaEm: new Date(),
        tipos,
        status: 'recebida',
        descricao: observacao,
        distanciaKm: 0,
        fotoUri,
        doUsuario: true,
      };
      setDenuncias((prev) => [nova, ...prev]);
      return nova;
    },
    [denuncias],
  );

  const value = useMemo(
    () => ({
      municipio,
      usuario,
      denuncias,
      fotoRascunho,
      setFotoRascunho,
      selecionarMunicipio: setMunicipio,
      login,
      logout,
      criarDenuncia,
    }),
    [municipio, usuario, denuncias, fotoRascunho, login, logout, criarDenuncia],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp deve ser usado dentro de <AppProvider>');
  return ctx;
}
