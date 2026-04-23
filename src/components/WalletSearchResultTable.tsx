import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CSVLink } from "react-csv";
import { API_BASE_URL } from "../utils/auth";
import { useUser } from "../context/userContext";
import { formatRiskLevelLabel } from "./screeningUtils";

interface WalletScore {
  id: string;
  walletAddress: string;
  riskScore: number;
  riskLevel: string;
  recommendedAction: string;
  checkedAt: string;
  decisionConfidence: string;
  rulesetVersion: string;
}

interface TableRow {
  id: string;
  walletAddress: string;
  blockchain: "ETH" | "BTC";
  riskScore: number;
  riskLevel: string;
  recommendedAction: string;
  timestamp: string;
  confidence: string;
  ruleset: string;
  /** Organization name when using admin cross-org list; empty otherwise. */
  screenedBy: string;
}

function detectBlockchain(address: string): "ETH" | "BTC" {
  return address.startsWith("0x") ? "ETH" : "BTC";
}

/**
 * Hard cap on rows in a single getAllWalletScores response (server-side). This is NOT the same as the
 * "Show N per page" dropdown — when the UI asks for more than this, we issue multiple API requests and merge.
 * If merge results look wrong, confirm with Network that `page` is 0-based indices of fixed-size chunks of this length.
 */
const GET_ALL_WALLET_SCORES_MAX_ROWS_PER_RESPONSE = 25;

/** Admin endpoint allows up to 100 rows per request (server MAX_PAGE_SIZE). */
const GET_ADMIN_WALLET_SCORES_MAX_ROWS_PER_RESPONSE = 100;

/** #2cc740 at 0.5 opacity — bulk screening row highlight */
const BULK_ROW_HIGHLIGHT = "rgba(44, 199, 64, 0.2)";
/** Longer duration + ease-out so the green highlight eases out gradually */
const BULK_HIGHLIGHT_FADE_MS = 1000;

function mapWalletScoreToRow(score: WalletScore, screenedBy = ""): TableRow {
  return {
    id: score.id,
    walletAddress: score.walletAddress,
    blockchain: detectBlockchain(score.walletAddress),
    riskScore: score.riskScore,
    riskLevel: score.riskLevel ?? "",
    recommendedAction: score.recommendedAction,
    timestamp: score.checkedAt,
    confidence: score.decisionConfidence
      ? score.decisionConfidence.charAt(0).toUpperCase() + score.decisionConfidence.slice(1)
      : "",
    ruleset: score.rulesetVersion ?? "",
    screenedBy,
  };
}

function formatScreenedAt(timestamp: string): string {
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return timestamp;
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${month}/${day}/${year} at ${hours}:${minutes} ${ampm}`;
}

type SortColumn =
  | "screenedAt"
  | "walletAddress"
  | "screenedBy"
  | "blockchain"
  | "riskScore"
  | "recommendedAction"
  | "confidence"
  | "ruleset";
type SortCycle = 1 | 2 | 3;

const ACTION_ORDER: Record<string, number> = { Allow: 1, Review: 2, Escalate: 3 };

function sortRows(rows: TableRow[], column: SortColumn | null, cycle: SortCycle): TableRow[] {
  if (!column || cycle === 3) return rows;
  const direction = cycle === 1 ? 1 : -1;
  return [...rows].sort((a, b) => {
    let cmp = 0;
    switch (column) {
      case "screenedAt":
        cmp = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        break;
      case "walletAddress":
        cmp = a.walletAddress.localeCompare(b.walletAddress);
        break;
      case "screenedBy":
        cmp = a.screenedBy.localeCompare(b.screenedBy);
        break;
      case "blockchain":
        cmp = a.blockchain.localeCompare(b.blockchain);
        break;
      case "riskScore":
        cmp = a.riskScore - b.riskScore;
        break;
      case "recommendedAction":
        cmp = (ACTION_ORDER[a.recommendedAction] ?? 0) - (ACTION_ORDER[b.recommendedAction] ?? 0);
        break;
      case "confidence":
        cmp = a.confidence.localeCompare(b.confidence);
        break;
      case "ruleset":
        cmp = a.ruleset.localeCompare(b.ruleset);
        break;
    }
    return cmp * direction;
  });
}

const CSV_HEADERS = [
  { label: "Screened At", key: "screenedAt" },
  { label: "Wallet Address", key: "walletAddress" },
  { label: "Block Chain", key: "blockChain" },
  { label: "Risk Score", key: "riskScore" },
  { label: "Recommended Action", key: "recommendedAction" },
  { label: "Confidence", key: "confidence" },
  { label: "Ruleset", key: "ruleset" },
] as const;

function rowToCsvRecord(row: TableRow, includeScreenedBy: boolean): Record<string, string> {
  const level = formatRiskLevelLabel(row.riskScore, row.riskLevel);
  const riskScoreText = level ? `${row.riskScore} ${level}` : String(row.riskScore);
  const base: Record<string, string> = {
    screenedAt: formatScreenedAt(row.timestamp),
    walletAddress: row.walletAddress,
    blockChain: row.blockchain,
    riskScore: riskScoreText,
    recommendedAction: row.recommendedAction,
    confidence: row.confidence,
    ruleset: row.ruleset,
  };
  if (includeScreenedBy) {
    return {
      screenedAt: base.screenedAt,
      screenedBy: row.screenedBy,
      walletAddress: base.walletAddress,
      blockChain: base.blockChain,
      riskScore: base.riskScore,
      recommendedAction: base.recommendedAction,
      confidence: base.confidence,
      ruleset: base.ruleset,
    };
  }
  return base;
}

const EXPORT_CONTROL_STYLE: React.CSSProperties = {
  height: "48px",
  padding: "0px 20px",
  borderRadius: "4px",
  border: "1px solid var(--blue)",
  backgroundColor: "var(--very-dark-blue)",
  color: "var(--blue)",
  cursor: "pointer",
  fontWeight: 500,
  fontFamily: '"Hero New", sans-serif',
  fontSize: "15px",
  whiteSpace: "nowrap",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

type WalletSearchResultTableProps = {
  adminView?: boolean;
  /** Increment to refetch Recent Screenings (e.g. after bulk upload). */
  refreshKey?: number;
  /** Row `id`s from a successful bulk screen; cleared after highlight + fade. */
  bulkHighlightIds?: string[];
  onBulkHighlightConsumed?: () => void;
};

export default function WalletSearchResultTable({
  adminView = false,
  refreshKey = 0,
  bulkHighlightIds = [],
  onBulkHighlightConsumed,
}: WalletSearchResultTableProps) {
  const { isAdmin } = useUser();
  /** Admin list API + org column: `/walletScreenings` or any admin on `/screenings`. */
  const useAdminWalletScores = adminView || isAdmin;
  const navigate = useNavigate();
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortCycle, setSortCycle] = useState<SortCycle>(1);
  const [filterText, setFilterText] = useState("");
  const [bulkHighlightFading, setBulkHighlightFading] = useState(false);

  const bulkHighlightKey = bulkHighlightIds.length > 0 ? bulkHighlightIds.join("\0") : "";

  const bulkHighlightSet = useMemo(() => new Set(bulkHighlightIds), [bulkHighlightIds]);

  useEffect(() => {
    if (!bulkHighlightKey) {
      setBulkHighlightFading(false);
      return undefined;
    }
    setBulkHighlightFading(false);
    const fadeTimer = window.setTimeout(() => setBulkHighlightFading(true), 5000);
    const doneTimer = window.setTimeout(() => {
      onBulkHighlightConsumed?.();
      setBulkHighlightFading(false);
    }, 5000 + BULK_HIGHLIGHT_FADE_MS);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(doneTimer);
    };
  }, [bulkHighlightKey, onBulkHighlightConsumed]);

  const handleSortClick = (column: SortColumn) => {
    if (column !== sortColumn) {
      setSortColumn(column);
      setSortCycle(1);
    } else {
      setSortCycle(((sortCycle % 3) + 1) as SortCycle);
    }
  };

  const renderSortArrow = (column: SortColumn) => {
    if (sortColumn !== column || sortCycle === 3) return null;
    return (
      <img
        src={sortCycle === 1 ? "/upArrowBlue.svg" : "/downArrowBlue.svg"}
        alt={sortCycle === 1 ? "Ascending" : "Descending"}
        style={{ width: "11px", height: "15px" }}
      />
    );
  };

  useEffect(() => {
    const fetchWalletScores = async () => {
      setLoading(true);
      try {
        const serverPageSize = useAdminWalletScores
          ? GET_ADMIN_WALLET_SCORES_MAX_ROWS_PER_RESPONSE
          : GET_ALL_WALLET_SCORES_MAX_ROWS_PER_RESPONSE;
        const start = (currentPage - 1) * itemsPerPage;
        const endExclusive = start + itemsPerPage;
        const firstApiPage = Math.floor(start / serverPageSize);
        const lastApiPage = Math.floor((endExclusive - 1) / serverPageSize);

        const fetches = [];
        for (let apiPage = firstApiPage; apiPage <= lastApiPage; apiPage++) {
          const url = useAdminWalletScores
            ? `${API_BASE_URL}/backend/getAdminWalletScores?page=${apiPage}&pageSize=${serverPageSize}`
            : `${API_BASE_URL}/backend/getAllWalletScores?page=${apiPage}&pageSize=${serverPageSize}`;
          fetches.push(
            fetch(url, { credentials: "include" }).then((res) => {
              if (!res.ok) throw new Error("Failed to fetch wallet scores");
              return res.json() as Promise<{
                data: (WalletScore & { orgName?: string })[];
                totalEntries: number;
              }>;
            }),
          );
        }

        const jsons = await Promise.all(fetches);
        let totalEntries = 0;
        const segments: TableRow[] = [];
        for (const json of jsons) {
          if (totalEntries === 0) totalEntries = json.totalEntries;
          segments.push(
            ...json.data.map((score) =>
              mapWalletScoreToRow(
                score,
                useAdminWalletScores ? (score.orgName ?? "") : "",
              ),
            ),
          );
        }

        const offset = start - firstApiPage * serverPageSize;
        const pageSlice = segments.slice(offset, offset + itemsPerPage);
        setTableData(pageSlice);
        setTotalItems(totalEntries);
        setTotalPages(Math.max(1, Math.ceil(totalEntries / itemsPerPage)));
      } catch (err) {
        console.error("Error fetching wallet scores:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWalletScores();
  }, [currentPage, itemsPerPage, useAdminWalletScores, refreshKey]);

  const filteredData = React.useMemo(() => {
    const query = filterText.trim().toLowerCase();
    if (!query) return tableData;

    const columnAccessors: ((row: TableRow) => string)[] = [
      (r) => formatScreenedAt(r.timestamp),
      ...(useAdminWalletScores ? [(r: TableRow) => r.screenedBy] : []),
      (r) => r.walletAddress,
      (r) => r.blockchain,
      (r) => `${r.riskScore} ${formatRiskLevelLabel(r.riskScore, r.riskLevel)}`,
      (r) => r.recommendedAction,
      (r) => r.confidence,
      (r) => r.ruleset,
    ];

    const matchedRows: { row: TableRow; firstMatchCol: number }[] = [];
    for (const row of tableData) {
      let firstMatchCol = -1;
      for (let i = 0; i < columnAccessors.length; i++) {
        if (columnAccessors[i](row).toLowerCase().includes(query)) {
          firstMatchCol = i;
          break;
        }
      }
      if (firstMatchCol !== -1) {
        matchedRows.push({ row, firstMatchCol });
      }
    }

    matchedRows.sort((a, b) => a.firstMatchCol - b.firstMatchCol);
    return matchedRows.map((m) => m.row);
  }, [tableData, filterText, useAdminWalletScores]);

  const displayedData = sortRows(filteredData, sortColumn, sortCycle);
  const displayedCount = filteredData.length;

  const csvExportHeaders = React.useMemo(() => {
    if (!useAdminWalletScores) return [...CSV_HEADERS];
    return [
      CSV_HEADERS[0],
      { label: "Screened By", key: "screenedBy" as const },
      CSV_HEADERS[1],
      ...CSV_HEADERS.slice(2),
    ];
  }, [useAdminWalletScores]);

  const csvData = React.useMemo(
    () => displayedData.map((row) => rowToCsvRecord(row, useAdminWalletScores)),
    [displayedData, useAdminWalletScores],
  );

  const tableColumns = React.useMemo((): [string, SortColumn][] => {
    const head: [string, SortColumn][] = useAdminWalletScores
      ? [
          ["Screened At", "screenedAt"],
          ["Screened By", "screenedBy"],
          ["Wallet Address", "walletAddress"],
        ]
      : [
          ["Screened At", "screenedAt"],
          ["Wallet Address", "walletAddress"],
        ];
    return [
      ...head,
      ["Block Chain", "blockchain"],
      ["Risk Score", "riskScore"],
      ["Recommended Action", "recommendedAction"],
      ["Confidence", "confidence"],
      ["Ruleset", "ruleset"],
    ];
  }, [useAdminWalletScores]);

  const columnCount = useAdminWalletScores ? 8 : 7;

  // Auto-dismiss copy notification after 3 seconds
  useEffect(() => {
    if (showCopyNotification) {
      const timer = setTimeout(() => {
        setShowCopyNotification(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showCopyNotification]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1 && value <= totalPages) {
      setCurrentPage(value);
    }
  };

  const handleCopyAddress = async (walletAddress: string) => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setShowCopyNotification(true);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        maxHeight: "100vh",
        backgroundColor: "transparent",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        paddingTop: "2rem",
        paddingBottom: "2rem",
        overflowY: "auto",
      }}
    >
      {/* Table */}
      <div
        style={{
          backgroundColor: "var(--dark-blue)",
          borderRadius: "4px",
          overflowX: "auto",
          paddingLeft: "20px",
          paddingRight: "20px",
        }}
      >
        {/* Header Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "20px",
            paddingBottom: "20px",
          }}
        >
          {/* Title - Left Justified */}
          <div
            style={{
              fontFamily: '"Hero New", sans-serif',
              fontWeight: 700,
              fontSize: "18px",
              lineHeight: "100%",
              color: "var(--textWhite)",
            }}
          >
            Recent Screenings
          </div>

          {/* Filter and Export - Right Justified */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
            }}
          >
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <img
                src="/GreyMagnifyingGlass.svg"
                alt="Search"
                style={{
                  position: "absolute",
                  left: "1rem",
                  width: "18px",
                  height: "18px",
                  pointerEvents: "none",
                }}
              />
              <input
                type="text"
                placeholder="Filter Screenings"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                style={{
                  height: "48px",
                  padding: "1rem 2.75rem 1rem 2.75rem",
                  borderRadius: "4px",
                  border: "1px solid var(--input-field-border)",
                  backgroundColor: "var(--input-field-blue)",
                  color: "var(--textWhite)",
                  boxSizing: "border-box",
                  fontFamily: '"Hero New", sans-serif',
                  fontSize: "14px",
                  minWidth: "320px",
                }}
              />
              {filterText && (
                <img
                  src="/xGrey.svg"
                  alt="Clear"
                  onClick={() => setFilterText("")}
                  style={{ position: "absolute", right: 16, top: 12, width: 16, height: 24, cursor: "pointer" }}
                />
              )}
            </div>
            {loading || displayedData.length === 0 ? (
              <button
                type="button"
                disabled
                style={{
                  ...EXPORT_CONTROL_STYLE,
                  cursor: "not-allowed",
                  opacity: 0.5,
                }}
              >
                <img
                  src="/exportBlue.svg"
                  alt="Export"
                  style={{ width: "24px", height: "16px" }}
                />
                Export
              </button>
            ) : (
              <CSVLink
                data={csvData}
                headers={[...csvExportHeaders]}
                filename="wallet-screenings.csv"
                style={{ ...EXPORT_CONTROL_STYLE, textDecoration: "none", color: "var(--blue)" }}
              >
                <img
                  src="/exportBlue.svg"
                  alt="Export"
                  style={{ width: "24px", height: "16px" }}
                />
                Export
              </CSVLink>
            )}
          </div>
        </div>
        <table
          style={{
            width: "100%",
            minWidth: useAdminWalletScores ? "920px" : "800px",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: "1px solid var(--input-field-blue)",
              }}
            >
              {tableColumns.map(([label, col]) => (
                <th
                  key={col}
                  style={{
                    padding: "1rem",
                    textAlign: "left",
                    fontFamily: '"Hero New", sans-serif',
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "var(--text-grey-white)",
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                  onClick={() => handleSortClick(col)}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    {label}
                    {renderSortArrow(col)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columnCount}
                  style={{
                    padding: "3rem 1rem",
                    textAlign: "center",
                    fontFamily: '"Hero New", sans-serif',
                    fontSize: "14px",
                    color: "var(--text-grey-white)",
                  }}
                >
                  Loading...
                </td>
              </tr>
            ) : displayedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columnCount}
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
                 <div style={{paddingTop: "20px"}}>No results found</div>   
                  </div>
                </td>
              </tr>
            ) : null}
            {displayedData.map((row, index) => {
              const isLastRow = index === displayedData.length - 1;
              const isBulkRow = bulkHighlightSet.has(row.id);
              let rowBackground: string;
              if (isBulkRow && !bulkHighlightFading) {
                rowBackground = BULK_ROW_HIGHLIGHT;
              } else if (isBulkRow && bulkHighlightFading) {
                rowBackground = "transparent";
              } else if (hoveredRow === index) {
                rowBackground = "var(--input-field-blue)";
              } else {
                rowBackground = "transparent";
              }
              return (
                <tr
                  key={row.id}
                  onClick={() => navigate(`/screenings/${row.id}`)}
                  onMouseEnter={() => setHoveredRow(index)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{
                    borderBottom: isLastRow
                      ? "none"
                      : "1px solid var(--input-field-blue)",
                    cursor: "pointer",
                    backgroundColor: rowBackground,
                    transition: isBulkRow
                      ? `background-color ${BULK_HIGHLIGHT_FADE_MS}ms ease-out`
                      : "background-color 0.15s ease",
                  }}
                >
                  <td
                    style={{
                      padding: "1rem",
                      verticalAlign: "middle",
                      fontFamily: '"Hero New", sans-serif',
                      fontSize: "13px",
                      fontWeight: 400,
                      color: "var(--textWhite)",
                      ...(isLastRow && { borderBottomLeftRadius: "4px" }),
                    }}
                  >
                    {formatScreenedAt(row.timestamp)}
                  </td>
                  {useAdminWalletScores && (
                    <td
                      style={{
                        padding: "1rem",
                        verticalAlign: "middle",
                        fontFamily: '"Hero New", sans-serif',
                        fontSize: "13px",
                        fontWeight: 400,
                        color: "var(--text-grey-white)",
                        maxWidth: "200px",
                      }}
                    >
                      {row.screenedBy}
                    </td>
                  )}
                  <td
                    style={{
                      padding: "1rem",
                      verticalAlign: "middle",
                      fontFamily: '"Hero New", sans-serif',
                      fontSize: "13px",
                      fontWeight: 400,
                      color: "var(--text-grey-white)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>{row.walletAddress}</span>
                      <img
                        src="/copyBlye.svg"
                        alt="Copy"
                        onClick={(e) => { e.stopPropagation(); handleCopyAddress(row.walletAddress); }}
                        style={{
                          width: "16px",
                          height: "16px",
                          cursor: "pointer",
                          marginRight: "30px",
                        }}
                      />
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "1rem",
                      verticalAlign: "middle",
                      fontFamily: '"Hero New", sans-serif',
                      fontSize: "13px",
                      fontWeight: 400,
                      color: "var(--textWhite)",
                    }}
                  >
                    {row.blockchain === "ETH" ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <img
                          src="/ethsmall.svg"
                          alt="ETH"
                          style={{ width: "24px", height: "24px" }}
                        />
                        <span>ETH</span>
                      </div>
                    ) : row.blockchain === "BTC" ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <img
                          src="/btcsmall.svg"
                          alt="BTC"
                          style={{ width: "24px", height: "24px" }}
                        />
                        <span>BTC</span>
                      </div>
                    ) : (
                      row.blockchain
                    )}
                  </td>
                  <td
                    style={{
                      padding: "1rem",
                      verticalAlign: "middle",
                      fontFamily: '"Hero New", sans-serif',
                      fontSize: "13px",
                      fontWeight: 400,
                      color: "var(--textWhite)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <img
                        src={`/${row.riskScore}score.svg`}
                        alt={`Risk Score ${row.riskScore}`}
                        style={{ width: "54px", height: "40px", display: "block" }}
                      />
                      <span>{formatRiskLevelLabel(row.riskScore, row.riskLevel)}</span>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "1rem",
                      verticalAlign: "middle",
                      fontFamily: '"Hero New", sans-serif',
                      fontSize: "13px",
                      fontWeight: 400,
                      color: "var(--textWhite)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {row.recommendedAction === "Allow" ? (
                        <img
                          src="/allow.svg"
                          alt="Allow"
                          style={{ width: "76px", height: "24px", display: "block" }}
                        />
                      ) : row.recommendedAction === "Review" ? (
                        <img
                          src="/review.svg"
                          alt="Review"
                          style={{ width: "94px", height: "24px", display: "block" }}
                        />
                      ) : row.recommendedAction === "Escalate" ? (
                        <img
                          src="/escalate.svg"
                          alt="Escalate"
                          style={{ width: "94px", height: "24px", display: "block" }}
                        />
                      ) : (
                        row.recommendedAction
                      )}
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "1rem",
                      verticalAlign: "middle",
                      fontFamily: '"Hero New", sans-serif',
                      fontSize: "13px",
                      fontWeight: 400,
                      color: "var(--textWhite)",
                    }}
                  >
                    {row.confidence}
                  </td>
                  <td
                    style={{
                      padding: "1rem",
                      verticalAlign: "middle",
                      fontFamily: '"Hero New", sans-serif',
                      fontSize: "13px",
                      fontWeight: 400,
                      color: "var(--textWhite)",
                      ...(isLastRow && { borderBottomRightRadius: "4px" }),
                    }}
                  >
                    {row.ruleset}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          backgroundColor: "var(--dark-blue)",
          borderRadius: "0 0 4px 4px",
        }}
      >
        {/* Border line with margins */}
        <div
          style={{
            borderTop: "1px solid var(--input-field-border)",
            marginLeft: "1rem",
            marginRight: "1rem",
          }}
        />
        {/* Footer content */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem",
          }}
        >
          {/* Left side - Showing n of y Searches */}
          <div
            style={{
              fontFamily: '"Hero New", sans-serif',
              fontSize: "14px",
              color: "var(--textWhite)",
            }}
          >
            Showing {displayedCount} of {totalItems} Searches
          </div>

          {/* Center - Pagination Controls */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {/* Left Arrow */}
            <button
              type="button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "4px",
                border: "1px solid var(--input-field-border)",
                backgroundColor:
                  currentPage === 1
                    ? "var(--very-dark-blue)"
                    : "var(--input-field-blue)",
                color: "var(--textWhite)",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                fontFamily: '"Hero New", sans-serif',
                fontSize: "16px",
                opacity: currentPage === 1 ? 0.5 : 1,
              }}
            >
              ◀
            </button>

            {/* Page Number Input */}
            <input
              type="number"
              value={currentPage}
              onChange={handlePageInputChange}
              min={1}
              max={totalPages}
              className="page-number-input"
              style={{
                width: "50px",
                height: "32px",
                padding: "0.5rem",
                textAlign: "center",
                borderRadius: "4px",
                border: "1px solid var(--input-field-border)",
                backgroundColor: "var(--input-field-blue)",
                color: "var(--textWhite)",
                fontFamily: '"Hero New", sans-serif',
                fontSize: "14px",
              }}
            />

            {/* Right Arrow */}
            <button
              type="button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "4px",
                border: "1px solid var(--input-field-border)",
                backgroundColor:
                  currentPage === totalPages
                    ? "var(--very-dark-blue)"
                    : "var(--input-field-blue)",
                color: "var(--textWhite)",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                fontFamily: '"Hero New", sans-serif',
                fontSize: "16px",
                opacity: currentPage === totalPages ? 0.5 : 1,
              }}
            >
              ▶
            </button>
          </div>

          {/* Right side - Show dropdown and Per Page */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                fontFamily: '"Hero New", sans-serif',
                fontSize: "14px",
                color: "var(--textWhite)",
              }}
            >
              Show
            </span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                border: "1px solid var(--input-field-border)",
                backgroundColor: "var(--input-field-blue)",
                color: "var(--textWhite)",
                fontFamily: '"Hero New", sans-serif',
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span
              style={{
                fontFamily: '"Hero New", sans-serif',
                fontSize: "14px",
                color: "var(--textWhite)",
              }}
            >
              Per Page
            </span>
          </div>
        </div>
      </div>

      {/* Copy Notification Badge */}
      {showCopyNotification && (
        <div
          style={{
            position: "fixed",
            bottom: "2rem",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "var(--dark-blue)",
            color: "var(--textWhite)",
            padding: "0.75rem 1.5rem",
            borderRadius: "4px",
            border: "1px solid var(--blue)",
            fontFamily: '"Hero New", sans-serif',
            fontSize: "14px",
            fontWeight: 500,
            zIndex: 9999,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          }}
        >
          Address copied to clipboard
        </div>
      )}
    </div>
  );
}
