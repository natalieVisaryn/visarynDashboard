import { useContext } from "react";
import { MenuBarContext } from "./menuBarContext";

export function useMenuBar() {
    const context = useContext(MenuBarContext);
    if (context === undefined) {
        throw new Error("useMenuBar must be used within a MenuBarProvider");
    }
    return context;
}
