import type { CSSProperties, ReactElement } from "react";

export type OrgBlacklistEntry = {
  id: string;
  walletAddress: string;
  chain: "BTC" | "ETH";
  createdAt: string;
  category: string;
  confidenceLevel: string;
  notes: string;
  source: string | null;
};

/** Table row; `orgName` is set when loaded from GET /backend/getAdminBlacklist */
export type BlacklistTableEntry = OrgBlacklistEntry & {
  orgName?: string | null;
};

export type SortColumn =
  | "walletAddress"
  | "blockchain"
  | "added"
  | "addedBy"
  | "category"
  | "confidence"
  | "riskImpact"
  | "source";

export type SortCycle = 1 | 2 | 3;

const CATEGORY_DISPLAY: Record<string, string> = {
  KNOWN_SCAM_FRAUD: "Known Scam/Fraud",
};

export function formatCategory(val: string | null | undefined): string {
  if (!val) return "None";
  return (
    CATEGORY_DISPLAY[val] ??
    val
      .split("_")
      .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
      .join(" ")
  );
}

export function formatConfidence(val: string): string {
  return val.charAt(0) + val.slice(1).toLowerCase();
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${mm}/${dd}/${yyyy} at ${hours}:${minutes} ${ampm}`;
}

export const thStyle: CSSProperties = {
  padding: "calc(1rem + 10px) 1rem 1rem 1rem",
  textAlign: "left",
  fontFamily: '"Hero New", sans-serif',
  fontSize: "14px",
  fontWeight: 400,
  color: "var(--text-grey-white)",
  whiteSpace: "nowrap",
};

export const tdStyle: CSSProperties = {
  padding: "1rem",
  fontFamily: '"Hero New", sans-serif',
  fontSize: "14px",
  color: "var(--text-grey-white)",
  whiteSpace: "nowrap",
};

export function truncateAddress(addr: string, maxLen = 28): string {
  return addr.length > maxLen ? addr.slice(0, maxLen) + "..." : addr;
}

const CONFIDENCE_ORDER: Record<string, number> = { LOW: 1, MEDIUM: 2, HIGH: 3 };

export function sortEntries(
  entries: BlacklistTableEntry[],
  column: SortColumn | null,
  cycle: SortCycle
): BlacklistTableEntry[] {
  if (!column) return entries;
  const direction = cycle === 1 ? 1 : -1;
  return [...entries].sort((a, b) => {
    let cmp = 0;
    switch (column) {
      case "walletAddress":
        cmp = a.walletAddress.localeCompare(b.walletAddress);
        break;
      case "blockchain":
        cmp = a.chain.localeCompare(b.chain);
        break;
      case "added":
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case "addedBy":
        cmp = (a.orgName ?? "").localeCompare(b.orgName ?? "");
        break;
      case "category":
        cmp = a.category.localeCompare(b.category);
        break;
      case "confidence":
      case "riskImpact":
        cmp =
          (CONFIDENCE_ORDER[a.confidenceLevel.toUpperCase()] ?? 0) -
          (CONFIDENCE_ORDER[b.confidenceLevel.toUpperCase()] ?? 0);
        break;
      case "source":
        cmp = (a.source ?? "none").localeCompare(b.source ?? "none");
        break;
    }
    return cmp * direction;
  });
}

export function renderSortArrow(
  column: SortColumn,
  activeColumn: SortColumn | null,
  activeCycle: SortCycle
): ReactElement | null {
  if (activeColumn !== column || activeCycle === 3) return null;
  return (
    <img
      src={activeCycle === 1 ? "/upArrowBlue.svg" : "/downArrowBlue.svg"}
      alt={activeCycle === 1 ? "Ascending" : "Descending"}
      style={{ width: "11px", height: "15px" }}
    />
  );
}
