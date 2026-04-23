import { useEffect, useState } from "react";
import { API_BASE_URL } from "../utils/auth";
import { UserContext, normalizeUserAccountType } from "./userContext";
import type { User } from "./userContext";

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/backend/whoami`, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        const accountType = normalizeUserAccountType(data.accountType);
        setUser(
          accountType
            ? { ...data, accountType }
            : (data as User),
        );
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const isAdmin = user?.accountType === "ADMIN";

  return (
    <UserContext.Provider value={{ user, isLoading, isAdmin, refreshUser: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
}
