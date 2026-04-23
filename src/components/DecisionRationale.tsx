import type { CSSProperties } from "react";
import type {
  DecisionRationaleSection,
  RationaleStatusIcon as RationaleStatusIconKind,
} from "./screeningUtils";
import { getDecisionRationaleLayout } from "./screeningUtils";

function InfoIcon() {
  return (
    <img src="/infoIconGrey.svg" alt="" style={{ width: 14, height: 14, opacity: 0.7 }} />
  );
}

function RationaleStatusIcon({ icon }: { icon: RationaleStatusIconKind }) {
  if (icon === "green") {
    return <img src="/greenCircleWithCheck.svg" alt="" style={{ width: 18, height: 18 }} />;
  }
  if (icon === "orange") {
    return <img src="/alertOrange.svg" alt="" style={{ width: 18, height: 16 }} />;
  }
  return <img src="/redHexX.svg" alt="" style={{ width: 18, height: 18 }} />;
}

const rowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "1px solid var(--input-field-blue)",
  padding: "10px 0",
  gap: "12px",
};

function RationaleColumn({ sections }: { sections: DecisionRationaleSection[] }) {
  return (
    <div style={{ minWidth: 0 }}>
      {sections.map((section, sectionIndex) => (
        <div key={section.title} style={{ marginBottom: "8px" }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: "15px",
              color: "var(--textWhite)",
              marginTop: sectionIndex === 0 ? 0 : "28px",
              marginBottom: "12px",
            }}
          >
            {section.title}
          </div>
          <div style={{ borderTop: "1px solid var(--input-field-blue)" }} />
          {section.rows.map((row) => (
            <div key={row.label} style={rowStyle}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "var(--text-grey-white)",
                  fontSize: "14px",
                  fontWeight: 400,
                  minWidth: 0,
                  paddingRight: "8px",
                }}
              >
                {row.label} <InfoIcon />
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: "var(--text-grey-white)",
                  fontSize: "13px",
                  flexShrink: 0,
                }}
              >
                {row.value}
                {row.icon !== null ? <RationaleStatusIcon icon={row.icon} /> : null}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function DecisionRationale({ riskFactors }: { riskFactors: string[] }) {
  const { left, right } = getDecisionRationaleLayout(riskFactors);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
        columnGap: "clamp(28px, 4vw, 56px)",
        rowGap: "8px",
        alignItems: "start",
      }}
    >
      <RationaleColumn sections={left} />
      <RationaleColumn sections={right} />
    </div>
  );
}
