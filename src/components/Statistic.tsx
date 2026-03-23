import type { ReactNode } from "react";

interface StatisticProps {
  icon: string;
  title: string;
  value: ReactNode;
  iconWidth?: string;
  iconHeight?: string;
}

export default function Statistic({
  icon,
  title,
  value,
  iconWidth = "24px",
  iconHeight = "37px",
}: StatisticProps) {
  return (
    <div
      style={{
        width: "250px",
        backgroundColor: "transparent",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      {/* Row 1: Icon and Title */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          paddingBottom: "5px",
          minHeight: "37px",
        }}
      >
        <img src={icon} alt={title} style={{ width: iconWidth, height: iconHeight }} />
        <span
          style={{
            color: "var(--textWhite)",
            fontSize: "16px",
            fontWeight: 400,
            lineHeight: "120%",
            letterSpacing: "-2%",
            textAlign: "center",
          }}
        >
          {title}
        </span>
      </div>

      {/* Row 2: Value */}
      <div
        style={{
          width: "100%",
          height: "24px",
          opacity: 1,
          gap: "6px",
          display: "flex",
        }}
      >
        <span
          style={{
            color: "var(--textWhite)",
            fontSize: "24px",
            fontWeight: 500,
          }}
        >
          {value}
        </span>
      </div>

    </div>
  );
}
