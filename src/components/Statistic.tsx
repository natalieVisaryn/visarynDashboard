import React from "react";

interface StatisticProps {
  icon: string;
  title: string;
  value: string;
  subtext: React.ReactNode;
}

export default function Statistic({
  icon,
  title,
  value,
  subtext,
}: StatisticProps) {
  return (
    <div
      style={{
        width: "250px",
        height: "87px",
        backgroundColor: "transparent",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Row 1: Icon and Title */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <img src={icon} alt={title} style={{ width: "24px", height: "28px" }} />
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
          width: "76px",
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
            fontWeight: 700,
          }}
        >
          {value}
        </span>
      </div>

      {/* Row 3: Subtext */}
      <div
        style={{
          color: "var(--textGrey)",
          fontSize: "13px",
          fontWeight: 400,
          lineHeight: "120%",
          letterSpacing: "0px",
        }}
      >
        {subtext}
      </div>
    </div>
  );
}
