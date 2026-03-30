export function safeHex(hex: string): string {
  if (!hex || typeof hex !== 'string') return '#B0A090';
  const clean = hex.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return '#B0A090';
  return `#${clean}`;
}

export function darken(hex: string, amount: number): string {
  const safe = safeHex(hex);
  const num = parseInt(safe.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0x00ff) - amount);
  const b = Math.max(0, (num & 0x0000ff) - amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export function lighten(hex: string, amount: number): string {
  const safe = safeHex(hex);
  const num = parseInt(safe.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0x00ff) + amount);
  const b = Math.min(255, (num & 0x0000ff) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

