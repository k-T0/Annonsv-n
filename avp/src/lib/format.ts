export function formatSEK(value: number): string {
  try {
    return new Intl.NumberFormat("sv-SE", {
      style: "currency",
      currency: "SEK",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${value} kr`;
  }
}