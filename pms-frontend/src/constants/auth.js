export const TOKEN_KEY = "pms_token";
const PROTECTED_ADMIN_EMAIL = "admin@websightworks.org";

const parseJwtPayload = (token) => {
  try {
    const base64 = token.split(".")[1];
    if (!base64) return null;
    const normalized = base64.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
};

export const getAuthUser = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  const payload = parseJwtPayload(token);
  if (!payload) return null;

  const role = String(payload.role || "").toUpperCase();
  const email = String(payload.sub || "").toLowerCase();

  return {
    token,
    email,
    role: role || (email === PROTECTED_ADMIN_EMAIL ? "ADMIN" : "MEMBER"),
  };
};

export const isAdminUser = () => {
  const user = getAuthUser();
  return user?.role === "ADMIN";
};
