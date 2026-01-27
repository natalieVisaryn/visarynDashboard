import React, { useState, useEffect, useRef } from "react";
import { MenuBarContext } from "./menuBarContext";

const MENU_STATE_KEY = "menuBarState";

export function MenuBarProvider({ children }: { children: React.ReactNode }) {
  // Lazy initialization: read from localStorage only on initial render
  const [isMenuOpen, setIsMenuOpenState] = useState(() => {
    const savedState = localStorage.getItem(MENU_STATE_KEY);
    return savedState === "true";
  });
  
  const isInitialMount = useRef(true);

  // Save state to localStorage whenever it changes (but not on initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    localStorage.setItem(MENU_STATE_KEY, String(isMenuOpen));
  }, [isMenuOpen]);

  const setIsMenuOpen = (isOpen: boolean) => {
    setIsMenuOpenState(isOpen);
  };

  const toggleMenu = () => {
    setIsMenuOpenState((prev) => !prev);
  };

  return (
    <MenuBarContext.Provider value={{ isMenuOpen, setIsMenuOpen, toggleMenu }}>
      {children}
    </MenuBarContext.Provider>
  );
}
