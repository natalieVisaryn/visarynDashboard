import React from "react";
import { useMenuBar } from "./menuBar/useMenuBar";
import { useUser } from "../context/userContext";
import MenuBarOpen from "./menuBar/menuBarOpen";
import MenuBarClosed from "./menuBar/menuBarClosed";

interface PageLayoutProps {
  children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  const { isMenuOpen, setIsMenuOpen } = useMenuBar();
  const { isLoading } = useUser();

  if (isLoading) {
    return (
      <div style={{ color: "white", textAlign: "center", padding: "2rem" }}>
        Loading...
      </div>
    );
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
