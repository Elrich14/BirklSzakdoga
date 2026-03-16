export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const resolveImageUrl = (url: string): string =>
  url.startsWith("/uploads") ? `${API_BASE}${url}` : url;
