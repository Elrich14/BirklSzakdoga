export type Currency = "HUF" | "EUR";

export const SUPPORTED_CURRENCIES: Currency[] = ["HUF", "EUR"];

export const EUR_TO_HUF_RATE = 400;

export function formatPrice(amountHuf: number, currency: Currency): string {
  if (currency === "HUF") {
    return `${amountHuf.toLocaleString("hu-HU")} Ft`;
  }
  const eur = amountHuf / EUR_TO_HUF_RATE;
  return `€${eur.toFixed(2)}`;
}
