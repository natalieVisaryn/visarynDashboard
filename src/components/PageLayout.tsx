import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkAuth } from "../utils/auth";
import { useMenuBar } from "./menuBar/useMenuBar";
import MenuBarOpen from "./menuBar/menuBarOpen";
import MenuBarClosed from "./menuBar/menuBarClosed";

interface PageLayoutProps {
  children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  const { isMenuOpen, setIsMenuOpen } = useMenuBar();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuth = async () => {
      const authenticated = await checkAuth();
      setIsAuthenticated(authenticated);
      if (!authenticated) {
        navigate("/login");
      }
    };

    verifyAuth();
  }, [navigate]);

  if (isAuthenticated === null) {
    return (
      <div style={{ color: "white", textAlign: "center", padding: "2rem" }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className={isMenuOpen ? "menu-open" : "menu-closed"}>
      {isMenuOpen ? (
        <MenuBarOpen onIconClick={() => setIsMenuOpen(false)} />
      ) : (
        <MenuBarClosed onIconClick={() => setIsMenuOpen(true)} />
      )}
      <div style={{ paddingTop: "80px" }}>{children}</div>
    </main>
  );
}
