export function getUserRole(): "admin" | "user" | "guest" {
  try {
    const user = localStorage.getItem("user");
    if (!user) return "guest";
    const parsed = JSON.parse(user);
    return parsed.role || "guest";
  } catch {
    return "guest";
  }
}

export const getCurrentUserId = (): string | null => {
  try {
    const user = localStorage.getItem("user");
    if (!user) return null;
    const parsed = JSON.parse(user);
    return parsed.id || null;
  } catch {
    return null;
  }
};
