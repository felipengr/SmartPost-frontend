import { getRandomValues } from 'expo-crypto';

// Mesmo estilo do `npm run usuario:cadastrar` do backend: fácil de digitar e de ditar
// ("poste-luz-praca-4821"), difícil de adivinhar: 32³ × 10⁴ ≈ 330 milhões de combinações,
// com a API limitando 5 tentativas de login por minuto
const PALAVRAS = [
  'poste',
  'luz',
  'praca',
  'rua',
  'fio',
  'sol',
  'rio',
  'serra',
  'flor',
  'ponte',
  'trem',
  'lago',
  'vento',
  'pedra',
  'mata',
  'ceu',
  'lua',
  'mar',
  'campo',
  'casa',
  'banco',
  'feira',
  'jardim',
  'farol',
  'cerca',
  'trilha',
  'morro',
  'nuvem',
  'chuva',
  'folha',
  'ilha',
  'vila',
];

// Números aleatórios de verdade (Math.random é previsível e não serve para senha)
function sorteio(quantidade: number) {
  return Array.from(getRandomValues(new Uint32Array(quantidade)));
}

export function gerarSenhaInicial() {
  const [a = 0, b = 0, c = 0, d = 0] = sorteio(4);
  const palavras = [a, b, c].map((n) => PALAVRAS[n % PALAVRAS.length]);
  return [...palavras, String(d % 10_000).padStart(4, '0')].join('-');
}
