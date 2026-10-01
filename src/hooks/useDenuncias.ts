import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import { ErroApi } from '@/api/cliente';
import { listarDenuncias, type Posicao } from '@/api/endpoints';
import type { Denuncia } from '@/types';
import { obterPosicao } from '@/utils/localizacao';

function mensagem(e: unknown) {
  return e instanceof ErroApi ? e.message : 'Não foi possível carregar as ocorrências.';
}

// Lista paginada do feed ou de "minhas denúncias".
// Recarrega ao voltar para a tela (ex.: depois de publicar uma denúncia).
export function useDenuncias(lista: 'feed' | 'minhas') {
  const [itens, setItens] = useState<Denuncia[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const posicao = useRef<Posicao | null>(null);
  // Ignora respostas antigas se uma nova recarga começou no meio do caminho
  const geracao = useRef(0);

  const recarregar = useCallback(
    async (puxouParaAtualizar = false) => {
      const minha = ++geracao.current;
      if (puxouParaAtualizar) setAtualizando(true);
      try {
        posicao.current = await obterPosicao();
        const pagina = await listarDenuncias({ lista, posicao: posicao.current });
        if (minha !== geracao.current) return;
        setItens(pagina.itens);
        setCursor(pagina.proximoCursor);
        setErro(null);
      } catch (e) {
        // Mantém o que já estava na tela e só avisa
        if (minha === geracao.current) setErro(mensagem(e));
      } finally {
        if (minha === geracao.current) {
          setCarregando(false);
          setAtualizando(false);
        }
      }
    },
    [lista],
  );

  const carregarMais = useCallback(async () => {
    if (!cursor || carregandoMais || carregando) return;
    const minha = geracao.current;
    setCarregandoMais(true);
    try {
      const pagina = await listarDenuncias({ lista, cursor, posicao: posicao.current });
      if (minha !== geracao.current) return;
      setItens((atuais) => [...atuais, ...pagina.itens]);
      setCursor(pagina.proximoCursor);
    } catch (e) {
      if (minha === geracao.current) setErro(mensagem(e));
    } finally {
      setCarregandoMais(false);
    }
  }, [lista, cursor, carregandoMais, carregando]);

  useFocusEffect(
    useCallback(() => {
      recarregar();
    }, [recarregar]),
  );

  return { itens, carregando, atualizando, carregandoMais, erro, recarregar, carregarMais };
}
