import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';

import { DENUNCIAS_MOCK, USUARIO_MOCK } from '@/mocks/data';
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
  login: (cpf: string, senha: string) => Promise<boolean>;
  logout: () => void;
  criarDenuncia: (dados: NovaDenuncia) => Denuncia;
};

const AppContext = createContext<AppContextValue | null>(null);

// Estado global mockado. Quando houver backend, estas funções passam a chamar a API.
export function AppProvider({ children }: { children: ReactNode }) {
  const [municipio, setMunicipio] = useState<Municipio | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [denuncias, setDenuncias] = useState<Denuncia[]>(DENUNCIAS_MOCK);
  const [fotoRascunho, setFotoRascunho] = useState<string | undefined>();

  const login = useCallback(async (cpf: string, senha: string) => {
    await new Promise((r) => setTimeout(r, 600));
    if (cpf.replace(/\D/g, '').length !== 11 || senha.length < 4) return false;
    setUsuario({ ...USUARIO_MOCK, cpf });
    return true;
  }, []);

  const logout = useCallback(() => {
    setUsuario(null);
  }, []);

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
