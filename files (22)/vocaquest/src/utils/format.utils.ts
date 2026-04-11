// src/utils/format.utils.ts

export function formatXP(xp: number): string {
  return xp >= 1000 ? `${(xp / 1000).toFixed(1)}k` : String(xp);
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '…' : str;
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}
