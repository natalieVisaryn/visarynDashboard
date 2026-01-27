import { createContext } from "react";

export interface MenuBarContextType {
    isMenuOpen: boolean;
    setIsMenuOpen: (isOpen: boolean) => void;
    toggleMenu: () => void;
}

export const MenuBarContext = createContext<MenuBarContextType | undefined>(undefined);
