import { useState } from "react";
import PageHeader from "./PageHeader";
import PageLayout from "./PageLayout";

const cardStyle: React.CSSProperties = {
  backgroundColor: "var(--dark-blue)",
  borderRadius: "4px",
  padding: "24px 24px 6px 24px",
};

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: '"Hero New", sans-serif',
  fontWeight: 700,
  fontSize: "18px",
  lineHeight: "120%",
  color: "var(--textWhite)",
};

const sectionSubtitleStyle: React.CSSProperties = {
  fontFamily: '"Hero New", sans-serif',
  fontSize: "14px",
  lineHeight: "140%",
  color: "var(--textGrey)",
  marginTop: "6px",
};

const ruleTitleStyle: React.CSSProperties = {
  fontFamily: '"Hero New", sans-serif',
  fontWeight: 600,
  fontSize: "15px",
  color: "var(--textWhite)",
};

const ruleDescriptionStyle: React.CSSProperties = {
  fontFamily: '"Hero New", sans-serif',
  fontSize: "14px",
  lineHeight: "150%",
  color: "var(--textGrey)",
  marginTop: "8px",
};

const chipStyle: React.CSSProperties = {
  fontFamily: '"Hero New", sans-serif',
  fontSize: "14px",
  color: "var(--textGrey)",
  backgroundColor: "var(--input-field-blue)",
  borderRadius: "6px",
  padding: "4px 10px",
};

type RuleKind = "override" | "additive" | "reductive";

interface RuleEntry {
  title: string;
  description: string;
  regulatoryCritical?: boolean;
  chips: string[];
}

const OVERRIDE_RULES: RuleEntry[] = [
  {
    title: "Sanctions List Match",
    description:
      "Wallet appears on an authoritative sanctions list, including OFAC, EU, or UK HMT financial sanctions lists.",
    regulatoryCritical: true,
    chips: [
      "Score Contribution: 10 (override)",
      "RULE_SANCTIONS_MATCH",
      "Override",
      "v1.0",
    ],
  },
  {
    title: "DOJ Enforcement Action (Override Rule)",
    description:
      "Wallet appears in a U.S. Department of Justice cryptocurrency enforcement action where an address has been publicly identified.",
    regulatoryCritical: true,
    chips: [
      "Score Contribution: Score = 10 (override)",
      "RULE_DOJ_ENFORCEMENT_MATCH",
      "Override",
      "v1.0",
    ],
  },
];

const ADDITIVE_RULES: RuleEntry[] = [
  {
    title: "Visaryn Blacklist Match (High Confidence)",
    description:
      "Direct match on a wallet included in the Visaryn Global Blacklist or the organization's internal blacklist with high confidence designation.",
    chips: ["Score Contribution: +7 pts", "RULE_BLACKLIST_MATCH_HIGH", "Additive", "v1.0"],
  },
  {
    title: "Visaryn Blacklist Match (Medium Confidence)",
    description:
      "Direct match on a wallet included in the Visaryn Global Blacklist or the organization's internal blacklist with medium confidence designation.",
    chips: ["+5 pts", "RULE_BLACKLIST_MATCH_MEDIUM", "Additive", "v1.0"],
  },
  {
    title: "Visaryn Blacklist Match (Low Confidence)",
    description:
      "Direct match on a wallet included in the Visaryn Global Blacklist or the organization's internal blacklist with low confidence designation.",
    chips: ["+3 pts", "RULE_BLACKLIST_MATCH_LOW", "Additive", "v1.0"],
  },
  {
    title: "Direct Exposure to Sanctions-Listed Wallet (Last 30 Days)",
    description:
      "Wallet has directly transacted with a sanctions-listed wallet within the past 30 days. (Ethereum scope: EOA-to-EOA transactions only; smart contracts excluded.)",
    chips: ["+4 pts", "RULE_EXPOSURE_SANCTIONS_30D", "Additive", "v1.0"],
  },
  {
    title: "Direct Exposure to Blacklisted Wallet (Last 30 Days)",
    description:
      "Wallet has directly transacted with a Visaryn Global Blacklist or organization-blacklisted wallet within the past 30 days. (Ethereum scope: EOA-to-EOA transactions only; smart contracts excluded.)",
    chips: ["+3 pts", "RULE_EXPOSURE_BLACKLIST_30D", "Additive", "v1.0"],
  },
  {
    title: "Wallet Age: 0-2 Days",
    description:
      "Wallet's first observed transaction occurred within the past 0-2 days, indicating a newly created wallet.",
    chips: ["+2 pts", "RULE_WALLET_AGE_0_2_DAYS", "Additive", "v1.0"],
  },
  {
    title: "Wallet Age: 3-7 Days",
    description:
      "Wallet's first observed transaction occurred within the past 3-7 days, indicating a recently created wallet.",
    chips: ["+1 pt", "RULE_WALLET_AGE_3_7_DAYS", "Additive", "v1.0"],
  },
];

const REDUCTIVE_RULES: RuleEntry[] = [
  {
    title: "Primarily Funded by Reputable CEX (Last 90 Days)",
    description:
      "At least 60% of inbound transaction value over the past 90 days originates from a curated list of reputable centralized exchanges (CEXs).",
    chips: ["Score Contribution: -2 pts", "RULE_CEX_FUNDING_90D", "Reductive", "v1.0"],
  },
  {
    title: "First Funding from Reputable CEX (Conditional)",
    description:
      "The wallet's first inbound transaction originated from a reputable centralized exchange. This rule is evaluated only if the 90-day primary funding rule cannot be determined due to incomplete data.",
    chips: ["-2 pts", "RULE_CEX_FIRST_FUNDING", "Reductive", "v1.0"],
  },
  {
    title: "Inactive Wallet (>180 Days)",
    description:
      "Wallet has had no transaction activity for more than 180 days. (Ethereum scope: EOA-to-EOA transactions only.)",
    chips: ["-1 pt", "RULE_INACTIVE_180D", "Reductive", "v1.0"],
  },
];

function RuleSectionHeader({
  iconSrc,
  iconAlt,
  title,
  subtitle,
}: {
  iconSrc: string;
  iconAlt: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", marginBottom: "35px" }}>
      <img src={iconSrc} alt={iconAlt} width={24} height={24} style={{ flexShrink: 0, marginTop: "8px" }} />
      <div>
        <div style={sectionTitleStyle}>{title}</div>
        <div style={sectionSubtitleStyle}>{subtitle}</div>
      </div>
    </div>
  );
}

function RuleList({ rules, kind }: { rules: RuleEntry[]; kind: RuleKind }) {
  return (
    <div>
      {rules.map((rule, i) => (
        <div
          key={`${kind}-${rule.title}`}
          style={{
            paddingTop: i === 0 ? 0 : "15px",
            paddingBottom: "15px",
            borderBottom: i < rules.length - 1 ? "1px solid var(--input-field-border)" : "none",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px" }}>
            <span style={ruleTitleStyle}>{rule.title}</span>
            {rule.regulatoryCritical ? (
              <img
                src="/regulatorilyCritical.svg"
                alt="Regulatory Critical"
                style={{ height: "25px", width: "auto", display: "block" }}
              />
            ) : null}
          </div>
          <div style={ruleDescriptionStyle}>{rule.description}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "14px" }}>
            {rule.chips.map((c) => (
              <span key={c} style={chipStyle}>
                {c}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminRules() {
  const [tab, setTab] = useState<"current" | "history">("current");

  const tabButton = (id: "current" | "history", label: string) => {
    const active = tab === id;
    return (
      <button
        type="button"
        onClick={() => setTab(id)}
        style={{
          fontFamily: '"Hero New", sans-serif',
          fontSize: "14px",
          fontWeight: 500,
          color: active ? "var(--blue)" : "var(--textGrey)",
          background: "none",
          border: "none",
          borderBottom: active ? "2px solid var(--blue)" : "2px solid transparent",
          padding: "20px 20px 20px 20px",
          marginRight: "28px",
          cursor: "pointer",
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <>
      <div>
        <title>Rules</title>
        <meta name="description" content="Scoring ruleset" />
        <link rel="icon" href="/visarynIcon.svg" type="image/svg+xml" />
      </div>
      <PageLayout>
        <PageHeader pageTitle="Rules" />
        <div
          style={{
            paddingTop: "28px",
            paddingRight: "64px",
            paddingBottom: "48px",
            paddingLeft: "64px",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-end", borderBottom: "1px solid var(--input-field-blue)" }}>
            {tabButton("current", "Current Ruleset (v1.0)")}
            {tabButton("history", "Version History")}
          </div>

          {tab === "current" ? (
            <>
              <div
                style={{
                  fontFamily: '"Hero New", sans-serif',
                  fontSize: "13px",
                  color: "var(--textGrey)",
                  marginTop: "30px",
                  marginBottom: "40px",
                }}
              >
                Ruleset v1.0 published: 3/15/2026 at 1:00:00 AM
              </div>

              <div style={{ ...cardStyle, marginBottom: "24px" }}>
                <RuleSectionHeader
                  iconSrc="/redHexExclamation.svg"
                  iconAlt=""
                  title="Override Rules"
                  subtitle="Immediately assign score = 10 and terminate all further rule evaluation"
                />
                <RuleList rules={OVERRIDE_RULES} kind="override" />
              </div>

              <div style={{ ...cardStyle, marginBottom: "24px" }}>
                <RuleSectionHeader
                  iconSrc="/alertOrange.svg"
                  iconAlt=""
                  title="Additive Rules"
                  subtitle="Contributions are summed"
                />
                <RuleList rules={ADDITIVE_RULES} kind="additive" />
              </div>

              <div style={{ ...cardStyle, marginBottom: "24px" }}>
                <RuleSectionHeader
                  iconSrc="/greenCircleWithDash.svg"
                  iconAlt=""
                  title="Reductive Rules"
                  subtitle="Reduce score but never below 0"
                />
                <RuleList rules={REDUCTIVE_RULES} kind="reductive" />
              </div>
            </>
          ) : (
            <div
              style={{
                ...cardStyle,
                marginTop: "24px",
                fontFamily: '"Hero New", sans-serif',
                fontSize: "14px",
                color: "var(--textGrey)",
              }}
            >
              Version history will appear here when multiple ruleset versions are available.
            </div>
          )}
        </div>
      </PageLayout>
    </>
  );
}
