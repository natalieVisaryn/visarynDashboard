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

export function ruleIdsText(data: WalletScoreDetail): string {
  const ids: string[] = [];
  if (data.ruleIds.includes("SANCTIONS_DIRECT_MATCH")) ids.push("SANCTIONS_DIRECT_MATCH");
  if (data.ruleIds.includes("ENFORCEMENT_DIRECT_MATCH")) ids.push("ENFORCEMENT_DIRECT_MATCH");
  if (data.blacklist.length > 0) ids.push("BLACKLIST_DIRECT_MATCH");
  return ids.join(", ");
}

export function directMatchText(data: WalletScoreDetail): string {
  const sanctions = data.sanctionsLists.map(formatTitle);
  const blacklist = data.blacklist;
  const listPart = [...sanctions, ...blacklist].join(", ");
  const rulePart = ruleIdsText(data);

  if (!listPart && !rulePart) return "No direct matches";
  if (listPart && rulePart) return `${listPart} • Rule ID: ${rulePart}`;
  if (listPart) return listPart;
  return `Rule ID: ${rulePart}`;
}

export function walletActivity(ruleIds: string[]): string {
  return ruleIds.includes("INACTIVE_180D")
    ? "Inactive > 180 days"
    : "Inactive < 180 days";
}

export function walletAge(riskFactors: string[]): string {
  if (riskFactors.includes("Wallet first seen within last 2 days")) {
    return "Wallet first seen within last 2 days";
  }
  if (riskFactors.includes("Wallet first seen within last 7 days")) {
    return "Wallet first seen within last 7 days";
  }
  return "Wallet first seen more than 7 days ago.";
}

export function fundingSource(ruleIds: string[]): string {
  if (
    ruleIds.includes("CEX_PRIMARY_FUNDING_90D") ||
    ruleIds.includes("CEX_INITIAL_FUNDING")
  ) {
    return "Centralized Exchange(s)";
  }
  return "Primarily via P2P transfers";
}
