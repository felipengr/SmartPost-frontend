export function tempoRelativo(data: Date): string {
  const min = Math.floor((Date.now() - data.getTime()) / 60_000);
  if (min < 1) return 'agora';
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'ontem' : `há ${d} dias`;
}

export function dataHora(data: Date): string {
  const hoje = new Date();
  const mesmoDia = data.toDateString() === hoje.toDateString();
  const hora = `${String(data.getHours()).padStart(2, '0')}:${String(data.getMinutes()).padStart(2, '0')}`;
  if (mesmoDia) return `Hoje • ${hora}`;
  return `${String(data.getDate()).padStart(2, '0')}/${String(data.getMonth() + 1).padStart(2, '0')} • ${hora}`;
}

export function mascararCpf(valor: string): string {
  const d = valor.replace(/\D/g, '').slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? '';
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (primeira + ultima).toUpperCase();
}

export function distancia(km: number): string {
  if (km === 0) return 'Você está aqui';
  return `${km.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km de você`;
}
