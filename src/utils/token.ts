export interface JwtPayload {
  id?: string;
  email?: string;
  iat?: number;
  exp?: number;
}

/* Decode a JWT payload without verifying the signature (client-side only). */
export const decodeToken = (token: string): JwtPayload | null => {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(normalized);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
};

/* A token is valid only if it can be decoded and is not expired. */
export const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;

  const decoded = decodeToken(token);
  if (!decoded) return false;

  if (typeof decoded.exp === "number") {
    return decoded.exp * 1000 > Date.now();
  }

  // No expiry claim: fall back to existence check.
  return true;
};
