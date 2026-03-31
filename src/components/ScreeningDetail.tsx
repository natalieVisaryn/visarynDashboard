import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AddEditOrgBlacklist from "./AddEditOrgBlacklist";
import PageHeader from "./PageHeader";
import PageLayout from "./PageLayout";
import ScreeningHistoryDetail from "./ScreeningHistoryDetail";
import { API_BASE_URL } from "../utils/auth";
import {
  type WalletScoreDetail,
  riskScoreColors,
  formatDate,
  formatTitle,
  directMatchText,
  walletActivity,
  walletAge,
  fundingSource,
} from "./screeningUtils";

function truncateAddress(addr: string): string {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 4)}-${addr.slice(-4)}`;
}

function StatusIcon({ type }: { type: "good" | "warn" | "bad" }) {
  if (type === "good") return <img src="/greenCircleWithCheck.svg" alt="" style={{ width: 18, height: 18 }} />;
  if (type === "warn") return <img src="/alertOrange.svg" alt="" style={{ width: 18, height: 16 }} />;
  return <img src="/escalateIcon.svg" alt="" style={{ width: 18, height: 18 }} />;
}

function InfoIcon() {
  return (
    <img src="/infoIconGrey.svg" alt="" style={{ width: 14, height: 14, opacity: 0.7 }} />
  );
}

type WalletScoreHistoryItem = {
  id: string;
  checkedAt: string;
  riskScore: number;
  riskLevel: string;
  recommendedAction: string;
  decisionConfidence: string;
  rulesetVersion: string;
};

type HistorySortColumn = "screenedAt" | "riskScore" | "recommendation" | "confidence" | "ruleset";
type SortCycle = 1 | 2 | 3;

const historyThStyle: React.CSSProperties = {
  padding: "calc(1rem + 10px) 1rem 1rem 1rem",
  textAlign: "left",
  fontFamily: '"Hero New", sans-serif',
  fontSize: "14px",
  fontWeight: 400,
  color: "var(--text-grey-white)",
  whiteSpace: "nowrap",
};

const historyTdStyle: React.CSSProperties = {
  padding: "1rem",
  fontFamily: '"Hero New", sans-serif',
  fontSize: "14px",
  color: "var(--text-grey-white)",
  whiteSpace: "nowrap",
};

function sortHistory(
  entries: WalletScoreHistoryItem[],
  column: HistorySortColumn | null,
  cycle: SortCycle,
): WalletScoreHistoryItem[] {
  if (!column || cycle === 3) return entries;
  const direction = cycle === 1 ? 1 : -1;
  return [...entries].sort((a, b) => {
    let cmp = 0;
    switch (column) {
      case "screenedAt":
        cmp = new Date(a.checkedAt).getTime() - new Date(b.checkedAt).getTime();
        break;
      case "riskScore":
        cmp = a.riskScore - b.riskScore;
        break;
      case "recommendation":
        cmp = a.recommendedAction.localeCompare(b.recommendedAction);
        break;
      case "confidence":
        cmp = a.decisionConfidence.localeCompare(b.decisionConfidence);
        break;
      case "ruleset":
        cmp = a.rulesetVersion.localeCompare(b.rulesetVersion);
        break;
    }
    return cmp * direction;
  });
}

function filterHistory(
  entries: WalletScoreHistoryItem[],
  search: string,
): WalletScoreHistoryItem[] {
  if (!search.trim()) return entries;
  const term = search.toLowerCase();
  return entries.filter((row) => {
    const fields = [
      formatDate(row.checkedAt),
      String(row.riskScore),
      formatTitle(row.riskLevel),
      row.recommendedAction,
      formatTitle(row.decisionConfidence),
      row.rulesetVersion,
    ];
    return fields.some((f) => f.toLowerCase().includes(term));
  });
}

export default function ScreeningDetail() {
  const { screeningId } = useParams<{ screeningId: string }>();
  const navigate = useNavigate();

  const [entry, setEntry] = useState<WalletScoreDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"rationale" | "history">("rationale");
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const tabContentRef = useRef<HTMLDivElement>(null);
  const savedScrollRef = useRef<number | null>(null);

  const [walletInput, setWalletInput] = useState("");

  const [historyData, setHistoryData] = useState<WalletScoreHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historySearch, setHistorySearch] = useState("");
  const [historyPage, setHistoryPage] = useState(1);
  const [historyItemsPerPage, setHistoryItemsPerPage] = useState(10);
  const [historySortColumn, setHistorySortColumn] = useState<HistorySortColumn | null>("screenedAt");
  const [historySortCycle, setHistorySortCycle] = useState<SortCycle>(2);

  const fetchEntry = useCallback(async () => {
    if (!screeningId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/backend/getWalletScoreDetails/${screeningId}`, {
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 404) throw new Error("Screening not found");
        throw new Error("Failed to fetch screening details");
      }
      const data: WalletScoreDetail = await res.json();
      setEntry(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch screening details");
    } finally {
      setLoading(false);
    }
  }, [screeningId]);

  useEffect(() => {
    fetchEntry();
  }, [fetchEntry]);

  const fetchHistory = useCallback(async () => {
    if (!entry?.walletAddress) return;
    try {
      setHistoryLoading(true);
      const all: WalletScoreHistoryItem[] = [];
      let page = 0;
      let totalPages = 1;
      while (page < totalPages) {
        const res = await fetch(
          `${API_BASE_URL}/backend/getWalletScoreHistory/${entry.walletAddress}?page=${page}&pageSize=100`,
          { credentials: "include" },
        );
        if (!res.ok) throw new Error("Failed to fetch screening history");
        const json = await res.json();
        all.push(...json.data);
        totalPages = json.totalPages;
        page++;
      }
      setHistoryData(all);
    } catch (err) {
      console.error("Failed to fetch screening history:", err);
    } finally {
      setHistoryLoading(false);
    }
  }, [entry?.walletAddress]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleCopy = async () => {
    if (!entry) return;
    try {
      await navigator.clipboard.writeText(entry.walletAddress);
      setShowCopyNotification(true);
      setTimeout(() => setShowCopyNotification(false), 3000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const sortedHistory = sortHistory(historyData, historySortColumn, historySortCycle);
  const filteredHistory = filterHistory(sortedHistory, historySearch);
  const filteredHistoryTotal = filteredHistory.length;
  const historyTotalPages = Math.max(1, Math.ceil(filteredHistoryTotal / historyItemsPerPage));
  const historyStartIdx = (historyPage - 1) * historyItemsPerPage;
  const displayedHistory = filteredHistory.slice(historyStartIdx, historyStartIdx + historyItemsPerPage);

  const handleHistoryPageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= historyTotalPages) setHistoryPage(newPage);
  };

  const handleHistoryPageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1 && value <= historyTotalPages) setHistoryPage(value);
  };

  const handleHistorySortClick = (column: HistorySortColumn) => {
    if (column !== historySortColumn) {
      setHistorySortColumn(column);
      setHistorySortCycle(1);
    } else {
      setHistorySortCycle(((historySortCycle % 3) + 1) as SortCycle);
    }
  };

  const renderHistorySortArrow = (column: HistorySortColumn) => {
    if (historySortColumn !== column || historySortCycle === 3) return null;
    return (
      <img
        src={historySortCycle === 1 ? "/upArrowBlue.svg" : "/downArrowBlue.svg"}
        alt={historySortCycle === 1 ? "Ascending" : "Descending"}
        style={{ width: "11px", height: "15px" }}
      />
    );
  };

  const handleHistoryRowClick = (id: string) => {
    savedScrollRef.current = window.scrollY;
    if (tabContentRef.current) {
      tabContentRef.current.style.minHeight = `${tabContentRef.current.offsetHeight}px`;
    }
    setSelectedHistoryId(id);
  };

  useLayoutEffect(() => {
    if (savedScrollRef.current !== null) {
      window.scrollTo(0, savedScrollRef.current);
      savedScrollRef.current = null;
    }
  }, [selectedHistoryId]);

  useEffect(() => {
    if (!selectedHistoryId && tabContentRef.current) {
      tabContentRef.current.style.minHeight = '';
    }
  }, [selectedHistoryId]);

  return (
    <>
      <div>
        <title>Screening Detail</title>
        <meta name="description" content="Screening Detail" />
        <link rel="icon" href="/visarynIcon.svg" type="image/svg+xml" />
      </div>
      <PageLayout>
        <PageHeader pageTitle="Wallets" />
        <div style={{ paddingTop: "28px", paddingRight: "64px", paddingBottom: "48px", paddingLeft: "64px" }}>
          <div style={{ backgroundColor: "var(--dark-blue)", borderRadius: "4px", padding: "25px 20px", marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "25px", alignItems: "center" }}>
              <div style={{ fontWeight: 700, fontSize: "18px", color: "var(--textWhite)" }}>Screen Wallet Address</div>
              <button type="button" style={{ display: "flex", alignItems: "center", gap: "8px", height: "44px", borderRadius: "4px", border: "none", backgroundColor: "var(--input-field-blue)", color: "var(--blue)", padding: "0 16px", cursor: "pointer", fontSize: "15px" }}>
                <img src="/uploadFile.svg" alt="" style={{ width: 14, height: 14 }} />
                Bulk Wallet Screening
              </button>
            </div>
            <div style={{ color: "var(--textGrey)", marginBottom: "10px", fontSize: "14px" }}>Wallet Address</div>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <img src="/GreyMagnifyingGlass.svg" alt="" style={{ position: "absolute", left: 16, top: 18, width: 18, height: 18 }} />
                <input
                  placeholder="Enter Wallet Address"
                  value={walletInput}
                  onChange={(e) => setWalletInput(e.target.value)}
                  style={{ width: "100%", height: "54px", borderRadius: "4px", border: "1px solid var(--input-field-border)", backgroundColor: "var(--input-field-blue)", color: "var(--textWhite)", padding: "0 40px", fontSize: "14px" }}
                />
                {walletInput && (
                  <img
                    src="/xGrey.svg"
                    alt="Clear"
                    onClick={() => setWalletInput("")}
                    style={{ position: "absolute", right: 16, top: 15, width: 16, height: 24, cursor: "pointer" }}
                  />
                )}
              </div>
              <button type="button" style={{ width: "100px", height: "54px", border: "none", borderRadius: "4px", backgroundColor: "var(--blue)", color: "var(--text-dark-blue)", fontSize: "16px", cursor: "pointer" }}>
                Screen
              </button>
            </div>
          </div>

          <div style={{ backgroundColor: "var(--dark-blue)", borderRadius: "4px", overflow: "hidden", paddingTop: "32px", paddingRight: "32px", paddingLeft: "32px", paddingBottom: "55px" }}>
            <button onClick={() => navigate("/screenings")} style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "var(--input-field-blue)", border: "none", borderRadius: "4px", padding: "16px 24px", color: "var(--blue)", fontSize: "15px", fontWeight: 500, cursor: "pointer", marginBottom: "28px" }}>
              <img src="/backArrowBlue.svg" alt="" style={{ width: "16px", height: "16px" }} /> Back to Recent Screenings
            </button>

            {loading ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem", fontSize: "14px", color: "var(--text-grey-white)" }}>Loading...</div>
            ) : error ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem", fontSize: "14px", color: "#e05252" }}>{error}</div>
            ) : entry ? (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                    <img src={entry.chain === "BTC" ? "/btcsmall.svg" : "/ethsmall.svg"} alt={entry.chain} style={{ width: "120px", height: "120px", flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 500, fontSize: "28px", color: "var(--textWhite)", marginBottom: "18px" }}>
                        {truncateAddress(entry.walletAddress)}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--textGrey)", marginBottom: "6px" }}>
                        {entry.chain === "BTC" ? "Bitcoin" : "Ethereum"} Address
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "13px", fontWeight: 300, color: "var(--textWhite)" }}>{entry.walletAddress}</span>
                        <img src="/copyBlye.svg" alt="Copy" role="button" onClick={handleCopy} style={{ width: "14px", height: "14px", cursor: "pointer" }} />
                      </div>
                    </div>
                  </div>

                  <button onClick={() => setShowAddModal(true)} style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "var(--input-field-blue)", border: "none", borderRadius: "4px", padding: "16px 26px", color: "var(--blue)", fontSize: "15px", fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap" }}>
                    <img src="/noSymbolBlue.svg" alt="" style={{ width: "24px", height: "16px" }} />
                    Add to Blacklist
                  </button>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: riskScoreColors[entry.riskScore] ?? "#3E4D17",
                    borderRadius: "50px",
                    paddingTop: "8px",
                    paddingRight: "50px",
                    paddingLeft: "10px",
                    paddingBottom: "8px",
                    gap: "16px",
                    marginBottom: "12px",
                    marginLeft: "-12px",
                    flexWrap: "wrap",
                    height: "76px",
                    boxSizing: "border-box",
                  }}
                >
                  <img src={`/${entry.riskScore}score.svg`} alt={`Risk Score ${entry.riskScore}`} style={{ width: "80px", height: "60px", flexShrink: 0 }} />
                  <div style={{ flex: "1 1 auto", minWidth: "180px" }}>
                    <div style={{ fontWeight: 700, fontSize: "16px", color: "var(--textWhite)", marginBottom: "4px" }}>
                      {formatTitle(entry.riskLevel)} Risk detected
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--text-grey-white)" }}>
                      Recommendation: {entry.recommendedAction}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "clamp(12px, 2vw, 32px)", alignItems: "flex-start", flexShrink: 1 }}>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 400, opacity: 0.7, color: "var(--text-grey-white)", marginBottom: "7px" }}>Screened:</div>
                      <div style={{ fontSize: "14px",fontWeight: 400, color: "var(--text-grey-white)" }}>{formatDate(entry.checkedAt)}</div>
                    </div>
                    <div>
                    <div style={{ fontSize: "14px", fontWeight: 400, opacity: 0.7, color: "var(--text-grey-white)", marginBottom: "7px" }}>Confidence:</div>
                    <div style={{ fontSize: "14px",fontWeight: 400, color: "var(--text-grey-white)" }}>{formatTitle(entry.decisionConfidence)}</div>
                    </div>
                    <div>
                    <div style={{ fontSize: "14px", fontWeight: 400, opacity: 0.7, color: "var(--text-grey-white)", marginBottom: "7px" }}>Decision Basis:</div>
                    <div style={{ fontSize: "14px",fontWeight: 400, color: "var(--text-grey-white)" }}>{entry.decisionBasis || "N/A"}</div>
                    </div>
                    <div>
                    <div style={{ fontSize: "14px", fontWeight: 400, opacity: 0.7, color: "var(--text-grey-white)", marginBottom: "7px" }}>Ruleset:</div>
                    <div style={{ fontSize: "14px",fontWeight: 400, color: "var(--text-grey-white)" }}>{entry.rulesetVersion}</div>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: "right", fontSize: "12px", color: "var(--textGrey)", marginBottom: "28px" }}>
                  Intelligence Sources Updated: Jan 14, 2026
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "0",
                    borderBottom: "1px solid var(--input-field-blue)",
                    marginBottom: "24px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => { setActiveTab("rationale"); setSelectedHistoryId(null); }}
                    style={{
                      background: "none",
                      border: "none",
                      borderBottom:
                        activeTab === "rationale"
                          ? "2px solid var(--blue)"
                          : "2px solid transparent",
                      padding: "0 16px 16px 16px",
                      fontFamily: '"Hero New", sans-serif',
                      fontSize: "14px",
                      fontWeight: 500,
                      color:
                        activeTab === "rationale"
                          ? "var(--light-blue)"
                          : "var(--textGrey)",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Decision Rationale
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTab("history"); setSelectedHistoryId(null); }}
                    style={{
                      background: "none",
                      border: "none",
                      borderBottom:
                        activeTab === "history"
                          ? "2px solid var(--blue)"
                          : "2px solid transparent",
                      padding: "0 16px 16px 16px",
                      fontFamily: '"Hero New", sans-serif',
                      fontSize: "14px",
                      fontWeight: 500,
                      color:
                        activeTab === "history"
                          ? "var(--light-blue)"
                          : "var(--textGrey)",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Screening History
                  </button>
                </div>

                <div ref={tabContentRef}>
                {activeTab === "rationale" ? (
                  <>
                    <div style={{ fontWeight: 700, fontSize: "18px", color: "var(--textWhite)", marginBottom: "20px", paddingTop: "20px" }}>
                      Decision Rationale
                    </div>
                    <div style={{ borderTop: "1px solid var(--input-field-border)", marginBottom: "20px" }} />

                    <div style={{ fontWeight: 500, fontSize: "15px", color: "var(--text-grey-white)", marginTop: "28px", marginBottom: "15px" }}>
                      Blacklist &amp; Sanctions Intelligence
                    </div>
                    <div style={{ borderTop: "1px solid var(--input-field-blue)" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--input-field-blue)",  marginBottom: "10px", padding: "10px 0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-grey-white)", fontSize: "14px", fontWeight: 400 }}>
                        Direct Match with Known Blacklists <InfoIcon />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-grey-white)", fontSize: "13px" }}>
                        {directMatchText(entry)}
                        <StatusIcon type={directMatchText(entry) === "No direct matches" ? "good" : "bad"} />
                      </div>
                    </div>

                    <div style={{ fontWeight: 500, fontSize: "15px", color: "var(--text-grey-white)", marginTop: "28px", marginBottom: "15px"}}>
                      Transactional Patterns
                    </div>
                    <div style={{ borderTop: "1px solid var(--input-field-blue)" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--input-field-blue)",  marginBottom: "10px", padding: "10px 0"  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-grey-white)", fontSize: "14px", fontWeight: 400 }}>
                    Wallet Activity <InfoIcon />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-grey-white)", fontSize: "13px" }}>
                        {walletActivity(entry.ruleIds)}
                        <StatusIcon type={entry.ruleIds.includes("INACTIVE_180D") ? "good" : "warn"} />
                      </div>
                    </div>

                    <div style={{ fontWeight: 500, fontSize: "15px", color: "var(--text-grey-white)", marginTop: "28px", marginBottom: "15px" }}>
                      Wallet Identity &amp; Origin
                    </div>
                    <div style={{ borderTop: "1px solid var(--input-field-blue)" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--input-field-blue)",  marginBottom: "10px", padding: "10px 0"  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-grey-white)", fontSize: "14px", fontWeight: 400 }}>
                    Wallet Age <InfoIcon />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-grey-white)", fontSize: "13px" }}>
                        {walletAge(entry.riskFactors)}
                        <StatusIcon type={walletAge(entry.riskFactors).includes("more than 7") ? "good" : "warn"} />
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--input-field-blue)",  marginBottom: "10px", padding: "10px 0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-grey-white)", fontSize: "14px", fontWeight: 400 }}>
                    Funding Source <InfoIcon />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-grey-white)", fontSize: "13px" }}>
                        {fundingSource(entry.ruleIds)}
                        <StatusIcon type={fundingSource(entry.ruleIds) === "Centralized Exchange(s)" ? "good" : "warn"} />
                      </div>
                    </div>

                    <div style={{ fontWeight: 700, fontSize: "18px", color: "var(--textWhite)", marginTop: "38px", marginBottom: "14px" }}>
                      Screening Summary
                    </div>
                    <div style={{ borderTop: "1px solid var(--input-field-border)" }} />
                    <div style={{ fontSize: "13px", color: "var(--text-grey-white)", lineHeight: 1.5, paddingTop:"10px" }}>
                      {entry.auditSummary}
                    </div>
                  </>
                ) : selectedHistoryId ? (
                  <ScreeningHistoryDetail
                    screeningId={selectedHistoryId}
                    onBack={() => setSelectedHistoryId(null)}
                  />
                ) : (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", paddingTop: "20px" }}>
                      <div style={{ fontWeight: 700, fontSize: "18px", color: "var(--textWhite)" }}>
                        Screening History
                      </div>
                      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                        <img src="/GreyMagnifyingGlass.svg" alt="" style={{ position: "absolute", left: "1rem", width: "18px", height: "18px", pointerEvents: "none" }} />
                        <input
                          type="text"
                          placeholder="Filter screenings"
                          value={historySearch}
                          onChange={(e) => { setHistorySearch(e.target.value); setHistoryPage(1); }}
                          style={{
                            height: "44px",
                            padding: "0.75rem 2.75rem 0.75rem 2.75rem",
                            borderRadius: "4px",
                            border: "1px solid var(--input-field-border)",
                            backgroundColor: "var(--input-field-blue)",
                            color: "var(--textWhite)",
                            fontFamily: '"Hero New", sans-serif',
                            fontSize: "14px",
                            minWidth: "200px",
                          }}
                        />
                        {historySearch && (
                          <img
                            src="/xGrey.svg"
                            alt="Clear"
                            onClick={() => { setHistorySearch(""); setHistoryPage(1); }}
                            style={{ position: "absolute", right: 16, top: 10, width: 16, height: 24, cursor: "pointer" }}
                          />
                        )}
                      </div>
                    </div>

                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ borderBottom: "1px solid var(--input-field-blue)" }}>
                            {([
                              ["Screened At", "screenedAt"],
                              ["Risk Score", "riskScore"],
                              ["Recommendation", "recommendation"],
                              ["Confidence", "confidence"],
                              ["Ruleset", "ruleset"],
                            ] as [string, HistorySortColumn][]).map(([label, col]) => (
                              <th
                                key={col}
                                style={{ ...historyThStyle, cursor: "pointer", userSelect: "none" }}
                                onClick={() => handleHistorySortClick(col)}
                              >
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                  {label}
                                  {renderHistorySortArrow(col)}
                                </span>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {historyLoading ? (
                            <tr>
                              <td colSpan={5} style={{ ...historyTdStyle, textAlign: "center", padding: "3rem 1rem" }}>
                                Loading...
                              </td>
                            </tr>
                          ) : displayedHistory.length === 0 ? (
                            <tr>
                              <td
                                colSpan={5}
                                style={{
                                  padding: "3rem 1rem",
                                  textAlign: "center",
                                  fontFamily: '"Hero New", sans-serif',
                                  fontSize: "24px",
                                  fontWeight: 700,
                                  color: "var(--text-grey-white)",
                                }}
                              >
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "10px 0px" }}>
                                  <img src="/blueMagnifyingGlass.svg" alt="" width={40} height={40} />
                                  <div style={{ paddingTop: "20px" }}>No screening history found</div>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            displayedHistory.map((row, idx) => (
                              <tr
                                key={row.id}
                                onClick={() => handleHistoryRowClick(row.id)}
                                style={{
                                  borderBottom: idx === displayedHistory.length - 1 ? "none" : "1px solid var(--input-field-blue)",
                                  cursor: "pointer",
                                }}
                              >
                                <td style={historyTdStyle}>{formatDate(row.checkedAt)}</td>
                                <td style={historyTdStyle}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <img
                                      src={`/${row.riskScore}score.svg`}
                                      alt={`Score ${row.riskScore}`}
                                      style={{ width: "40px", height: "40px" }}
                                    />
                                    <span>{formatTitle(row.riskLevel)}</span>
                                  </div>
                                </td>
                                <td style={historyTdStyle}>
                                  {row.recommendedAction === "Allow" ? (
                                    <img src="/allow.svg" alt="Allow" style={{ width: "76px", height: "24px" }} />
                                  ) : row.recommendedAction === "Review" ? (
                                    <img src="/review.svg" alt="Review" style={{ width: "94px", height: "24px" }} />
                                  ) : row.recommendedAction === "Escalate" ? (
                                    <img src="/escalate.svg" alt="Escalate" style={{ width: "94px", height: "24px" }} />
                                  ) : (
                                    row.recommendedAction
                                  )}
                                </td>
                                <td style={historyTdStyle}>{formatTitle(row.decisionConfidence)}</td>
                                <td style={historyTdStyle}>{row.rulesetVersion}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <div style={{ borderTop: "1px solid var(--input-field-blue)", marginLeft: "1rem", marginRight: "1rem" }} />
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "1rem 0",
                        }}
                      >
                        <div style={{ fontFamily: '"Hero New", sans-serif', fontSize: "14px", color: "var(--textWhite)" }}>
                          Showing {displayedHistory.length} of {filteredHistoryTotal} screenings
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <button
                            type="button"
                            onClick={() => handleHistoryPageChange(historyPage - 1)}
                            disabled={historyPage === 1}
                            style={{
                              width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center",
                              borderRadius: "4px", border: "1px solid var(--input-field-border)",
                              backgroundColor: historyPage === 1 ? "var(--very-dark-blue)" : "var(--input-field-blue)",
                              color: "var(--textWhite)", cursor: historyPage === 1 ? "not-allowed" : "pointer",
                              fontFamily: '"Hero New", sans-serif', fontSize: "16px", opacity: historyPage === 1 ? 0.5 : 1,
                            }}
                          >◀</button>
                          <input
                            type="number"
                            value={historyPage}
                            onChange={handleHistoryPageInputChange}
                            min={1}
                            max={historyTotalPages}
                            className="page-number-input"
                            style={{
                              width: "50px", height: "32px", padding: "0.5rem", textAlign: "center", borderRadius: "4px",
                              border: "1px solid var(--input-field-border)", backgroundColor: "var(--input-field-blue)",
                              color: "var(--textWhite)", fontFamily: '"Hero New", sans-serif', fontSize: "14px",
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleHistoryPageChange(historyPage + 1)}
                            disabled={historyPage === historyTotalPages}
                            style={{
                              width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center",
                              borderRadius: "4px", border: "1px solid var(--input-field-border)",
                              backgroundColor: historyPage === historyTotalPages ? "var(--very-dark-blue)" : "var(--input-field-blue)",
                              color: "var(--textWhite)", cursor: historyPage === historyTotalPages ? "not-allowed" : "pointer",
                              fontFamily: '"Hero New", sans-serif', fontSize: "16px", opacity: historyPage === historyTotalPages ? 0.5 : 1,
                            }}
                          >▶</button>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontFamily: '"Hero New", sans-serif', fontSize: "14px", color: "var(--textWhite)" }}>Show</span>
                          <select
                            value={historyItemsPerPage}
                            onChange={(e) => { setHistoryItemsPerPage(Number(e.target.value)); setHistoryPage(1); }}
                            style={{
                              padding: "0.5rem 1rem", borderRadius: "4px", border: "1px solid var(--input-field-border)",
                              backgroundColor: "var(--input-field-blue)", color: "var(--textWhite)",
                              fontFamily: '"Hero New", sans-serif', fontSize: "14px", cursor: "pointer",
                            }}
                          >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                          </select>
                          <span style={{ fontFamily: '"Hero New", sans-serif', fontSize: "14px", color: "var(--textWhite)" }}>per page</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </PageLayout>

      <AddEditOrgBlacklist
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => setShowAddModal(false)}
        initialAddress={entry?.walletAddress ?? ""}
        initialChain={entry?.chain ?? "ETH"}
      />

      {showCopyNotification && (
        <div style={{ position: "fixed", bottom: "2rem", left: "50%", transform: "translateX(-50%)", backgroundColor: "var(--dark-blue)", color: "var(--textWhite)", padding: "0.75rem 1.5rem", borderRadius: "4px", border: "1px solid var(--blue)", fontSize: "14px", fontWeight: 500, zIndex: 9999, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)" }}>
          Address copied to clipboard
        </div>
      )}
    </>
  );
}
