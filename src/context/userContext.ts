import { createContext, useContext } from "react";

/** Normalize whoami `accountType` so role checks and menu logic stay stable across API casing. */
export function normalizeUserAccountType(
  accountType: unknown,
): "ADMIN" | "USER" | undefined {
  if (typeof accountType !== "string") return undefined;
  const t = accountType.trim().toUpperCase();
  if (t === "ADMIN" || t === "USER") return t;
  return undefined;
}

export interface User {
  id: string;
  name: string;
  email: string;
  accountType: "ADMIN" | "USER";
  orgId: string;
}

export interface UserContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  refreshUser: () => Promise<void>;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
  isAdmin: false,
  refreshUser: async () => {},
});

export function useUser() {
  return useContext(UserContext);
}
