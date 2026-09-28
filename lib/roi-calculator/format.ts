const usdFull = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export function formatCurrency(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  return usdFull.format(value);
}

export function formatCurrencyFull(value: number): string {
  return usdFull.format(value);
}

export function formatYears(value: number): string {
  if (!isFinite(value) || value < 0) return 'N/A';
  return `${value.toFixed(2)} yrs`;
}

export function formatBps(value: number): string {
  return `${value} bps`;
}

export function formatPct(value: number): string {
  return `${value}%`;
}

export function formatAum(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`;
  return usdFull.format(value);
}

export function formatCompact(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`;
  return usdFull.format(value);
}

export function formatMillions(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(1)}B`;
  return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
}

export function formatRoi(value: number): string {
  if (!isFinite(value) || isNaN(value)) return 'N/A';
  return `${value.toFixed(1)}x`;
}

export function formatPaybackYear(year: number): string {
  if (!isFinite(year) || year > 5) return '5+ years';
  return `Year ${Math.ceil(year)}`;
}

export function formatMarginExpansion(bps: number): string {
  const sign = bps >= 0 ? '+' : '';
  return `${sign}${Math.round(bps)} bps`;
}
