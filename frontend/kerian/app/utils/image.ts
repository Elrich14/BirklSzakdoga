export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const resolveImageUrl = (url: string): string => {
  if (url.startsWith("http")) return url;
  if (url.startsWith("/uploads")) return `${API_BASE}${url}`;
  return url;
};
