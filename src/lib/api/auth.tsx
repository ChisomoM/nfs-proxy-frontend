import { STORAGE_KEYS } from "@/types/auth";

export const getAuthHeader = () => {
  if (typeof window !== 'undefined') {
    const tokensJson = localStorage.getItem(STORAGE_KEYS.TOKENS);
    if (!tokensJson) return {};
    
    try {
      const tokens = JSON.parse(tokensJson);
      const token = tokens.token || tokens.access_token || tokensJson;
      return { Authorization: `Bearer ${token}` };
    } catch {
      return { Authorization: `Bearer ${tokensJson}` };
    }
  }
  return {};
};

export const isAuthenticated = () => {
  if (typeof window !== 'undefined') {
    return !!localStorage.getItem(STORAGE_KEYS.TOKENS);
  }
  return false;
};