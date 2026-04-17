import { API_BASE } from "@/constants/constants";

export const resolveImageUrl = (url: string): string => {
  if (url.startsWith("http")) return url;
  if (url.startsWith("/uploads")) return `${API_BASE}${url}`;
  return url;
};
