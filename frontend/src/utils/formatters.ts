/**
 * Standard utility formatters for hydrographic sonar telemetry & ML confidence
 */

export function formatPercentage(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val)) return '0%';
  const num = val <= 1 && val > 0 ? Math.round(val * 100) : Math.round(val);
  return `${num}%`;
}

export function formatConfidence(val: number | undefined | null): number {
  if (val === undefined || val === null || isNaN(val)) return 0;
  return val <= 1 && val > 0 ? Math.round(val * 100) : Math.round(val);
}

export function formatCoordinate(coord: string | undefined | null, fallback: string = '7.8220° N'): string {
  if (!coord) return fallback;
  return coord;
}
