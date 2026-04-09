export type WalletScoreDetail = {
  id: string;
  checkedAt: string;
  walletAddress: string;
  chain: "ETH" | "BTC";
  riskScore: number;
  riskLevel: string;
  recommendedAction: string;
  decisionConfidence: string;
  riskFactors: string[];
  auditSummary: string;
  rulesetVersion: string;
  decisionBasis: string;
  ruleIds: string[];
  sanctionsLists: string[];
  blacklist: string[];
};

export const riskScoreColors: Record<number, string> = {
  1: "#214B1B",
  2: "#3E4D17",
  3: "#5D4F13",
  4: "#7E510E",
  5: "#5C3910",
  6: "#A74C07",
  7: "#6D270E",
  8: "#731A0C",
  9: "#79100C",
  10: "#7D070B",
};

export function formatDate(iso: string): string {
  const d = new Date(iso);
  const mm = d.getMonth() + 1;
  const dd = d.getDate();
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${mm}/${dd}/${yyyy} at ${hh}:${min}:${ss}`;
}

export function formatTitle(value: string): string {
  return value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/** Substrings / prefixes matched against `riskFactors` entries for Decision Rationale rows. */
export const DECISION_RATIONALE_FACTORS = {
  SANCTIONS_DIRECT: "Direct match on sanctions list (OFAC/EU/UK)",
  ENFORCEMENT_DIRECT: "Direct match on enforcement list (DOJ advisory)",
  SYSTEM_BLACKLIST_PREFIX: "System blacklist match (confidence:",
  REGULATOR_TX_30D: "Direct transaction with regulator-critical wallet in last 30 days",
  BLACKLIST_TX_30D: "Direct transaction with blacklisted wallet in last 30 days",
  WALLET_FIRST_SEEN_2D: "Wallet first seen within last 2 days",
  WALLET_FIRST_SEEN_7D: "Wallet first seen within last 7 days",
  INACTIVE_180D: "No wallet activity in last 180 days",
  CEX_PRIMARY_90D: "Primarily funded from labeled CEX sources (last 90 days, based on transaction value)",
  CEX_INITIAL: "Initially funded from labeled CEX source",
} as const;

export type RationaleStatusIcon = "green" | "orange" | "redHex";

export type DecisionRationaleRow = {
  label: string;
  value: "Yes" | "No";
  icon: RationaleStatusIcon;
};

export type DecisionRationaleSection = {
  title: string;
  rows: DecisionRationaleRow[];
};

function riskFactorIncludes(factors: string[], needle: string): boolean {
  return factors.some((f) => f.includes(needle));
}

function hasSystemBlacklistMatch(factors: string[]): boolean {
  return factors.some((f) => f.startsWith(DECISION_RATIONALE_FACTORS.SYSTEM_BLACKLIST_PREFIX));
}

/** Two-column Decision Rationale data: left then right column sections. */
export function getDecisionRationaleLayout(riskFactors: string[]): {
  left: DecisionRationaleSection[];
  right: DecisionRationaleSection[];
} {
  const f = riskFactors;

  const sanctionsHit = riskFactorIncludes(f, DECISION_RATIONALE_FACTORS.SANCTIONS_DIRECT);
  const dojHit = riskFactorIncludes(f, DECISION_RATIONALE_FACTORS.ENFORCEMENT_DIRECT);
  const blacklistHit = hasSystemBlacklistMatch(f);
  const regTxHit = riskFactorIncludes(f, DECISION_RATIONALE_FACTORS.REGULATOR_TX_30D);
  const highRiskTxHit = riskFactorIncludes(f, DECISION_RATIONALE_FACTORS.BLACKLIST_TX_30D);
  const new2Hit = riskFactorIncludes(f, DECISION_RATIONALE_FACTORS.WALLET_FIRST_SEEN_2D);
  const new7Hit = riskFactorIncludes(f, DECISION_RATIONALE_FACTORS.WALLET_FIRST_SEEN_7D);
  const inactiveHit = riskFactorIncludes(f, DECISION_RATIONALE_FACTORS.INACTIVE_180D);
  const cexPrimaryHit = riskFactorIncludes(f, DECISION_RATIONALE_FACTORS.CEX_PRIMARY_90D);
  const cexInitialHit = riskFactorIncludes(f, DECISION_RATIONALE_FACTORS.CEX_INITIAL);

  const left: DecisionRationaleSection[] = [
    {
      title: "Sanctions & Enforcement",
      rows: [
        {
          label: "Direct match with sanctioned entity",
          value: sanctionsHit ? "Yes" : "No",
          icon: sanctionsHit ? "redHex" : "green",
        },
        {
          label: "Direct match with DOJ-listed wallet",
          value: dojHit ? "Yes" : "No",
          icon: dojHit ? "redHex" : "green",
        },
      ],
    },
    {
      title: "Known Risk Intelligence",
      rows: [
        {
          label: "Direct Match with Known Blacklists",
          value: blacklistHit ? "Yes" : "No",
          icon: blacklistHit ? "orange" : "green",
        },
      ],
    },
    {
      title: "Risky Counterparty Activity",
      rows: [
        {
          label: "Recent transaction with sanctioned wallet (30 days)",
          value: regTxHit ? "Yes" : "No",
          icon: regTxHit ? "orange" : "green",
        },
        {
          label: "Recent transaction with high-risk wallet (30 days)",
          value: highRiskTxHit ? "Yes" : "No",
          icon: highRiskTxHit ? "orange" : "green",
        },
      ],
    },
  ];

  const right: DecisionRationaleSection[] = [
    {
      title: "Wallet Profile",
      rows: [
        {
          label: "New wallet (first seen ≤2 days)",
          value: new2Hit ? "Yes" : "No",
          icon: new2Hit ? "orange" : "green",
        },
        {
          label: "New wallet (first seen ≤7 days)",
          value: new7Hit ? "Yes" : "No",
          icon: new7Hit ? "orange" : "green",
        },
        {
          label: "Inactive wallet (no activity 180+ days)",
          value: inactiveHit ? "Yes" : "No",
          icon: inactiveHit ? "orange" : "green",
        },
      ],
    },
    {
      title: "Funding Profile",
      rows: [
        {
          label: "Primarily funded by exchange (90 days)",
          value: cexPrimaryHit ? "Yes" : "No",
          icon: cexPrimaryHit ? "green" : "orange",
        },
        {
          label: "Initially funded by known exchange",
          value: cexInitialHit ? "Yes" : "No",
          icon: cexInitialHit ? "green" : "orange",
        },
      ],
    },
  ];

  return { left, right };
}
