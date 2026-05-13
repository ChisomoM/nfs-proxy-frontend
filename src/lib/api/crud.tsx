import { API, getRoute, pipe } from "./end_points";
import { STORAGE_KEYS } from "@/types/auth";
// import { getAuthHeader } from "./auth";

const ROUTING_URL: string = import.meta.env.VITE_BACKEND_URL as string;

// Storage keys (harmonized with AuthContext/types)
const AUTH_TOKENS_KEY = STORAGE_KEYS.TOKENS;

// Get access token from localStorage (used by AuthContext)
const getAccessTokenFromStorage = (): string | null => {
  try {
    if (typeof window === 'undefined') return null;
    
    const tokensJson = localStorage.getItem(AUTH_TOKENS_KEY);
    if (!tokensJson) return null;
    
    // In our new system, tokens might be just the string or {token: '...'}
    try {
      const tokens = JSON.parse(tokensJson);
      return tokens.token || tokens.access_token || null;
    } catch {
      return tokensJson; // Just a string
    }
  } catch (err) {
    console.error('Failed to get access token from storage:', err);
    return null;
  }
};

// First, let's create a function to refresh the token
const refreshAccessToken = async () => {
  try {
    // Get refresh token from cookies
    const refreshToken = document.cookie.replace(
      /(?:(?:^|.*;\s*)refreshToken\s*=\s*([^;]*).*$)|^.*$/,
      "$1"
    );

    // Fallback: Check localStorage if cookie is missing
    let tokenToUse = refreshToken;
    if (!tokenToUse) {
      const tokensJson = localStorage.getItem(AUTH_TOKENS_KEY);
      if (tokensJson) {
        try {
          const tokens = JSON.parse(tokensJson);
          tokenToUse = tokens.refresh_token;
        } catch {}
      }
    }

    if (!tokenToUse) {
      throw new Error("No refresh token available");
    }

    // Try to refresh the token
    const response = await fetch(`${ROUTING_URL}${getRoute("REFRESH_TOKEN")}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ refresh_token: tokenToUse }),
    });
    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }
    const data = await response.json();
    if (data?.token || data?.access_token) {
      const newToken = data.token || data.access_token;
      
      // Update localStorage with the new token while preserving other fields
      const tokensJson = localStorage.getItem(AUTH_TOKENS_KEY);
      if (tokensJson) {
        try {
          const tokens = JSON.parse(tokensJson);
          tokens.token = newToken;
          localStorage.setItem(AUTH_TOKENS_KEY, JSON.stringify(tokens));
        } catch {
          localStorage.setItem(AUTH_TOKENS_KEY, JSON.stringify({ token: newToken }));
        }
      } else {
        localStorage.setItem(AUTH_TOKENS_KEY, JSON.stringify({ token: newToken }));
      }
      
      return newToken;
    }
    if (data?.error) {
      throw new Error(data.error);
    }
    throw new Error("Failed to refresh token");
  } catch (error) {
    console.error("Token refresh error:", error);
    sessionStorage.removeItem("accessToken");
    document.cookie =
      "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    // Only throw, don't redirect here. Let fetchData handle logout.
    throw error;
  }
};

// Modify fetchData to handle token refresh
export const fetchData = async (
  key: string,
  method: string,
  params: Record<string, string> = {},
  body: unknown = null,
  query: Record<string, string> = {},
  headers: Record<string, string> = {}
) => {
  const h = new Headers();
  h.append("Content-Type", "application/json");

  // Read tokens from localStorage (AuthContext storage)
  // Skip for login/register/otp endpoints
  const isAuthEndpoint = ["LOGIN", "ADMIN_LOGIN", "REGISTER", "SEND_OTP", "VERIFY_OTP"].includes(key);
  
  if (typeof window !== "undefined" && !isAuthEndpoint) {
    const accessToken = getAccessTokenFromStorage();
    if (accessToken) {
      h.append("Authorization", `Bearer ${accessToken}`);
    }
  }

  Object.entries(headers).forEach(([key, value]) => {
    h.append(key, String(value));
  });

  const q = new URLSearchParams(query).toString();
  const url = `${ROUTING_URL}${pipe(getRoute(key), params)}${q ? `?${q}` : ""}`;

  const options: RequestInit = {
    method,
    headers: h,
    credentials: "include",
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  // Log request details for debugging CORS issues
  console.log(`[API] ${method} ${url}`);
  console.log(`[API] Origin: ${typeof window !== 'undefined' ? window.location.origin : 'N/A'}`);
  console.log(`[API] Headers:`, {
    'Content-Type': h.get('Content-Type'),
    'Authorization': h.get('Authorization') ? '***' : 'none',
    'Credentials': 'include'
  });

  let res: Response;
  try {
    res = await fetch(url, options);
  } catch (fetchError) {
    console.error(`[API] Network/CORS Error: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
    console.error(`[API] This usually indicates a CORS preflight failure or network error`);
    throw fetchError;
  }

  // Log response details for debugging CORS issues
  console.log(`[API] Response Status: ${res.status} ${res.statusText}`);
  console.log(`[API] CORS Headers:`, {
    'Access-Control-Allow-Origin': res.headers.get('Access-Control-Allow-Origin'),
    'Access-Control-Allow-Methods': res.headers.get('Access-Control-Allow-Methods'),
    'Access-Control-Allow-Headers': res.headers.get('Access-Control-Allow-Headers'),
  });

  if (res.ok) {
    if (res.status === 204) {
      return;
    }

    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await res.text();
      console.error("Expected JSON but received:", text.substring(0, 100));
      throw new Error(`Server returned non-JSON response (${res.status}). Likely a route mismatch or server error.`);
    }

    const result = await res.json();
    if (result.status === 0) {
      return result.data;
    } else if (result.success !== undefined) {
      if (result.success) {
        return result.data || result;
      } else {
        throw new Error(result.message || "Operation failed");
      }
    } else if (result.status !== undefined && result.status !== 0) {
      throw new Error(result.message || "Operation failed");
    } else {
      return result.data || result;
    }
  }

  // If the response is 401, try to refresh the token and retry the request once
  // Skip token refresh for login endpoints - let them fail naturally
  if (res.status === 401 && !["LOGIN", "ADMIN_LOGIN", "REGISTER"].includes(key)) {
    try {
      const newAccessToken = await refreshAccessToken();
      h.set("Authorization", `Bearer ${newAccessToken}`);
      res = await fetch(url, options);
      if (res.ok) {
        if (res.status === 204) {
          return;
        }
        const retryResult = await res.json();
        if (retryResult.status !== 0) {
          throw new Error(retryResult.message);
        }
        return retryResult.data;
      }
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError);
      sessionStorage.removeItem("accessToken");
      document.cookie =
        "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      // UI should catch this and show a toast
      throw new Error("SESSION_EXPIRED");
    }
  }

    if (res.status === 429) {
      throw new Error("Too many requests. Try again later")
    }

  // Extract error message from API response
  try {
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const errorData = await res.json();
      const errorMessage = errorData?.message || errorData?.error || `Error: ${res.status} ${res.statusText}`;
      console.error(`[API Error] ${key} (${method} ${url}):`, errorMessage);
      throw new Error(errorMessage);
    } else {
      const errorText = await res.text();
      console.error("Error response is not JSON:", errorText.substring(0, 200));
      console.error(`[API Error] ${key}: ${res.status} ${res.statusText}`);
      throw new Error(`Server Error (${res.status}): ${res.statusText}`);
    }
  } catch (err) {
    // If JSON parsing fails or it's already an error, handle it
    if (err instanceof Error) {
      throw err;
    }
    throw new Error(`Error: ${res.status} ${res.statusText}`);
  }
};

export const fetchEnvelope = async (
  key: string,
  method: string,
  params: Record<string, string> = {},
  body: unknown = null,
  query: Record<string, string> = {},
  headers: Record<string, string> = {}
) => {
  const h = new Headers();
  h.append("Content-Type", "application/json");

  const isAuthEndpoint = ["LOGIN", "ADMIN_LOGIN", "REGISTER", "SEND_OTP", "VERIFY_OTP"].includes(key);
  if (typeof window !== "undefined" && !isAuthEndpoint) {
    const accessToken = getAccessTokenFromStorage();
    if (accessToken) {
      h.append("Authorization", `Bearer ${accessToken}`);
    }
  }

  Object.entries(headers).forEach(([key, value]) => {
    h.append(key, String(value));
  });

  const q = new URLSearchParams(query).toString();
  const url = `${ROUTING_URL}${pipe(getRoute(key), params)}${q ? `?${q}` : ""}`;

  const options: RequestInit = {
    method,
    headers: h,
    credentials: "include",
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  // Log request details for debugging CORS issues
  console.log(`[API-Envelope] ${method} ${url}`);
  console.log(`[API-Envelope] Origin: ${typeof window !== 'undefined' ? window.location.origin : 'N/A'}`);
  console.log(`[API-Envelope] Headers:`, {
    'Content-Type': h.get('Content-Type'),
    'Authorization': h.get('Authorization') ? '***' : 'none',
    'Credentials': 'include'
  });

  let res: Response;
  try {
    res = await fetch(url, options);
  } catch (fetchError) {
    console.error(`[API-Envelope] Network/CORS Error: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
    console.error(`[API-Envelope] This usually indicates a CORS preflight failure or network error`);
    throw fetchError;
  }

  // Log response details for debugging CORS issues
  console.log(`[API-Envelope] Response Status: ${res.status} ${res.statusText}`);
  console.log(`[API-Envelope] CORS Headers:`, {
    'Access-Control-Allow-Origin': res.headers.get('Access-Control-Allow-Origin'),
    'Access-Control-Allow-Methods': res.headers.get('Access-Control-Allow-Methods'),
    'Access-Control-Allow-Headers': res.headers.get('Access-Control-Allow-Headers'),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    console.error(`[API-Envelope Error] ${key}:`, errorData?.message || errorData?.error || `Error: ${res.status} ${res.statusText}`);
    throw new Error(errorData?.message || errorData?.error || `Error: ${res.status} ${res.statusText}`);
  }

  return res.json();
};

// Export the refresh token function if needed elsewhere
export const refreshToken = refreshAccessToken;

type Endpoints = keyof typeof API;
export const post = (
  key: Endpoints,
  data: unknown,
  params: Record<string, string> = {}
) => {
  return fetchData(key, "POST", params, data);
};

export const list = (
  key: Endpoints,
  params: Record<string, string> = {},
  query: Record<string, string> = {}
) => fetchData(key, "GET", params, null, query);

export const retrieve = (key: Endpoints, params: Record<string, string> = {}) =>
  fetchData(key, "GET", params);

export const update = (
  key: Endpoints,
  data: unknown,
  params: Record<string, string> = {}
) => fetchData(key, "PUT", params, data);

export const remove = (key: Endpoints, params: Record<string, string> = {}) =>
  fetchData(key, "DELETE", params);

export const toggleProductAvailability = (
  productId: string,
  isAvailable: boolean,
  deactivatedByAuthority: boolean
) => {
  return update(
    "TOGGLE_PRODUCT_AVAILABILITY",
    { isAvailable, deactivatedByAuthority },
    { id: productId }
  );
};

export const file = async (
  key: Endpoints,
  params: Record<string, string> = {},
  query: Record<string, string> = {},
  headers: Record<string, string> | null = null
) => {
  const h = new Headers();
  h.append("Content-Type", "application/json");

  if (typeof window != "undefined" && !["ADMIN_LOGIN"].includes(key)) {
    const accessToken = getAccessTokenFromStorage();
    if (accessToken) {
      h.append("Authorization", `Bearer ${accessToken}`);
    }
  }

  if (headers) {
    Object.entries(headers).forEach(([key, value]) => {
      h.append(key, String(value));
    });
  }

  // h.append("X-From-Admin", location.host);
  const q = new URLSearchParams(query).toString();
  const url = `${ROUTING_URL}${pipe(getRoute(key), params)}${q ? `?${q}` : ""}`;

  const options: RequestInit = {
    method: "GET",
    headers: h,
    credentials: "include",
  };

  const res = await fetch(url, options);

  if (res.ok) {
    const disposition = res.headers.get("Content-Disposition");
    const filenameMatch = disposition?.match(
      /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
    );
    const filename = filenameMatch
      ? filenameMatch[1].replace(/['"]/g, "")
      : "file";

    const blob = await res.blob();
    const urlBlob = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = urlBlob;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(urlBlob);

    return; // No need to return anything else
  }
  const errorMessage = await res.json().then((res) => res.message);
  throw new Error(errorMessage);
};
