export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0] as string;
}

export function formatDateTime(date: Date): string {
  return date.toISOString();
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function isAfter(date: Date, comparison: Date): boolean {
  return date.getTime() > comparison.getTime();
}
