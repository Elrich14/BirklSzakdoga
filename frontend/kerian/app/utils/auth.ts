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


// hasznalat:
// if (getUserRole() === "admin") {
//   // mutass admin gombot
// }