import React from "react";
import { useMenuBar } from "./menuBar/useMenuBar";

interface PageHeaderProps {
  pageTitle: string;
  children?: React.ReactNode;
}

export default function PageHeader({ pageTitle, children }: PageHeaderProps) {
  const { isMenuOpen, toggleMenu } = useMenuBar();
  const menuBarWidth = isMenuOpen ? 240 : 90;

  return (
    <div
      style={{
        width: `calc(100vw - ${menuBarWidth}px)`,
        height: "80px",
        backgroundColor: "var(--very-dark-blue)",
        borderBottom: "1px solid var(--input-field-blue)",
        position: "fixed",
        top: 0,
        left: `${menuBarWidth}px`,
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: "20px",
        paddingRight: "20px",
        gap: "12px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleMenu();
          }}
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            padding: "8px",
            marginLeft: "-8px",
          }}
        >
          <img
            src={isMenuOpen ? "/menuBarClose.svg" : "/menuBarOpen.svg"}
            alt={isMenuOpen ? "Close Menu" : "Open Menu"}
            width={24}
            height={18}
          />
        </div>
        <h1
          style={{
            fontWeight: 700,
            fontSize: "24px",
            margin: 0,
            paddingLeft: "10px",
            color: "var(--textWhite)",
          }}
        >
          {pageTitle}
        </h1>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          paddingRight: "10px",
        }}
      >
        <div style={{ paddingRight: "5px" }}>
          <img
            src="/greenCircle.svg"
            alt="System Status"
            width={12}
            height={12}
          />
        </div>
        <span
          style={{
            textAlign: "right",
            color: "var(--textWhite)",
          }}
        >
          System Operational
        </span>
      </div>
      {children}
    </div>
  );
}
