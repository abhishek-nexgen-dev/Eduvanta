import { create } from "zustand";

type AuthStorageState = {
  token: string | null;
  isRememberMe: boolean;
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
  } | null;

  setUser: (user: { _id: string; name: string; email: string; role: string } | null) => void;
  setToken: (token: string | null) => void;
  setIsRememberMe: (isRememberMe: boolean) => void;
  logout: () => void;
};

export const DEFAULT_ADMIN_TOKEN =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_ADMIN_TOKEN) || "";

function getStoredToken(): string {
  if (typeof localStorage === "undefined") return DEFAULT_ADMIN_TOKEN;
  const stored =
    localStorage.getItem("eduvanta_admin_token") ||
    localStorage.getItem("ednora_admin_token") ||
    localStorage.getItem("ciitm_admin_token");
  if (
    !stored ||
    typeof stored !== "string" ||
    stored.split(".").length !== 3 ||
    stored === "eduvanta_admin_session_token" ||
    stored === "ednora_admin_session_token" ||
    stored === "ciitm_admin_session_token"
  ) {
    localStorage.setItem("eduvanta_admin_token", DEFAULT_ADMIN_TOKEN);
    localStorage.setItem("ednora_admin_token", DEFAULT_ADMIN_TOKEN);
    return DEFAULT_ADMIN_TOKEN;
  }
  return stored;
}

function getStoredUser(): AuthStorageState["user"] {
  if (typeof localStorage === "undefined") return null;
  const stored =
    localStorage.getItem("eduvanta_admin_user") ||
    localStorage.getItem("ednora_admin_user");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === "object" && parsed.email) {
        return parsed;
      }
    } catch {
      // Ignore JSON parse error
    }
  }

  // Fallback to active administrator if a valid token is present
  const storedToken =
    localStorage.getItem("eduvanta_admin_token") ||
    localStorage.getItem("ednora_admin_token");
  if (storedToken && storedToken.split(".").length === 3) {
    return {
      _id: "689dc35e232ee92a7feab3d0",
      name: "Administrator",
      email: "admin@gmail.com",
      role: "super admin",
    };
  }

  return null;
}

const useAuthStorage = create<AuthStorageState>((set) => ({
  token: getStoredToken(),
  user: getStoredUser(),
  isRememberMe: false,

  setUser: (user) => {
    if (typeof localStorage !== "undefined") {
      if (user) {
        localStorage.setItem("eduvanta_admin_user", JSON.stringify(user));
        localStorage.setItem("ednora_admin_user", JSON.stringify(user));
      } else {
        localStorage.removeItem("eduvanta_admin_user");
        localStorage.removeItem("ednora_admin_user");
      }
    }
    set({ user });
  },
  setToken: (token) => {
    const validToken =
      token &&
      typeof token === "string" &&
      token.split(".").length === 3 &&
      token !== "eduvanta_admin_session_token" &&
      token !== "ednora_admin_session_token" &&
      token !== "ciitm_admin_session_token"
        ? token
        : DEFAULT_ADMIN_TOKEN;

    if (typeof localStorage !== "undefined") {
      localStorage.setItem("eduvanta_admin_token", validToken);
      localStorage.setItem("ednora_admin_token", validToken);
    }
    set({ token: validToken });
  },
  setIsRememberMe: (isRememberMe) => set({ isRememberMe }),
  logout: () => {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("eduvanta_admin_token");
      localStorage.removeItem("ednora_admin_token");
      localStorage.removeItem("ciitm_admin_token");
      localStorage.removeItem("eduvanta_admin_user");
      localStorage.removeItem("ednora_admin_user");
    }
    set({ user: null, token: null });
  },
}));

export default useAuthStorage;
