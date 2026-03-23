import { createContext, useContext } from "react";

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
