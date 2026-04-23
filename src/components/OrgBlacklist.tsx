import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "./PageHeader";
import PageLayout from "./PageLayout";
import OrganizationBlacklistPanel from "./OrganizationBlacklistPanel";
import { API_BASE_URL } from "../utils/auth";
import type { OrgBlacklistEntry, SortColumn, SortCycle } from "./orgBlacklistShared";
import {
  formatCategory,
  formatConfidence,
  formatDate,
  renderSortArrow,
  sortEntries,
  tdStyle,
  thStyle,
  truncateAddress,
} from "./orgBlacklistShared";

type ActiveTab = "org" | "global";

export default function OrgBlacklist() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ActiveTab>("org");
  const [globalWallets, setGlobalWallets] = useState<OrgBlacklistEntry[]>([]);
  const [globalLoading, setGlobalLoading] = useState(true);
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [globalItemsPerPage, setGlobalItemsPerPage] = useState(10);
  const [globalCurrentPage, setGlobalCurrentPage] = useState(1);
  const [globalSortColumn, setGlobalSortColumn] = useState<SortColumn | null>(null);
  const [globalSortCycle, setGlobalSortCycle] = useState<SortCycle>(1);

  const fetchGlobalBlacklist = useCallback(async () => {
    try {
      setGlobalLoading(true);
      const res = await fetch(`${API_BASE_URL}/backend/getGlobalBlacklist`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data: OrgBlacklistEntry[] = await res.json();
      setGlobalWallets(data);
    } catch (err) {
      console.error("Failed to fetch global blacklist:", err);
    } finally {
      setGlobalLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGlobalBlacklist();
  }, [fetchGlobalBlacklist]);

  const handleGlobalSortClick = (column: SortColumn) => {
    if (column !== globalSortColumn) {
      setGlobalSortColumn(column);
      setGlobalSortCycle(1);
    } else {
      setGlobalSortCycle(((globalSortCycle % 3) + 1) as SortCycle);
    }
  };

  const sortedGlobalWallets = sortEntries(globalWallets, globalSortColumn, globalSortCycle);
  const globalTotalItems = sortedGlobalWallets.length;
  const globalTotalPages = Math.max(1, Math.ceil(globalTotalItems / globalItemsPerPage));
  const globalStartIdx = (globalCurrentPage - 1) * globalItemsPerPage;
  const displayedGlobalWallets = sortedGlobalWallets.slice(
    globalStartIdx,
    globalStartIdx + globalItemsPerPage
  );

  const handleGlobalPageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= globalTotalPages) setGlobalCurrentPage(newPage);
  };

  const handleGlobalPageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1 && value <= globalTotalPages) setGlobalCurrentPage(value);
  };

  useEffect(() => {
    if (showCopyNotification) {
      const timer = setTimeout(() => setShowCopyNotification(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showCopyNotification]);

  const handleCopyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setShowCopyNotification(true);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  return (
    <>
      <div>
        <title>Blacklist</title>
        <meta name="description" content="Blacklist" />
        <link rel="icon" href="/visarynIcon.svg" type="image/svg+xml" />
      </div>
      <PageLayout>
        <PageHeader pageTitle="Blacklist" />
        <div
          style={{
            paddingTop: "28px",
            paddingRight: "64px",
            paddingBottom: "48px",
            paddingLeft: "64px",
          }}
        >
          <div
            style={{
              backgroundColor: "var(--dark-blue)",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "0",
                padding: "24px 24px 0 24px",
                borderBottom: "1px solid var(--input-field-blue)",
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab("org")}
                style={{
                  background: "none",
                  border: "none",
                  borderBottom: activeTab === "org" ? "2px solid var(--blue)" : "2px solid transparent",
                  padding: "0 16px 16px 16px",
                  fontFamily: '"Hero New", sans-serif',
                  fontSize: "14px",
                  fontWeight: 500,
                  color: activeTab === "org" ? "var(--light-blue)" : "var(--textGrey)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Organization Blacklist
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("global")}
                style={{
                  background: "none",
                  border: "none",
                  borderBottom: activeTab === "global" ? "2px solid var(--blue)" : "2px solid transparent",
                  padding: "0 16px 16px 16px",
                  fontFamily: '"Hero New", sans-serif',
                  fontSize: "14px",
                  fontWeight: 500,
                  color: activeTab === "global" ? "var(--light-blue)" : "var(--textGrey)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Visaryn Global Blacklist
              </button>
            </div>

            {activeTab === "org" && <OrganizationBlacklistPanel variant="embedded" />}

            {activeTab === "global" && (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "24px 24px 0 24px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: '"Hero New", sans-serif',
                      fontWeight: 700,
                      fontSize: "18px",
                      color: "var(--textWhite)",
                    }}
                  >
                    Visaryn Global Blacklist
                  </span>
                </div>

                <div
                  className="blacklist-table-scroll"
                  style={{
                    padding: "12px 24px 0 24px",
                    overflowX: "scroll",
                    overflowY: "scroll",
                    maxHeight: "calc(100vh - 340px)",
                    maxWidth: "100%",
                  }}
                >
                  <table style={{ width: "100%", minWidth: "1000px", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--input-field-blue)" }}>
                        {(
                          [
                            ["Wallet Address", "walletAddress"],
                            ["Blockchain", "blockchain"],
                            ["Added", "added"],
                            ["Category", "category"],
                            ["Confidence", "confidence"],
                            ["Risk Impact", "riskImpact"],
                            ["Source", "source"],
                          ] as [string, SortColumn][]
                        ).map(([label, col]) => (
                          <th
                            key={col}
                            style={{ ...thStyle, cursor: "pointer", userSelect: "none" }}
                            onClick={() => handleGlobalSortClick(col)}
                          >
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                              {label}
                              {renderSortArrow(col, globalSortColumn, globalSortCycle)}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {globalLoading ? (
                        <tr>
                          <td colSpan={7} style={{ ...tdStyle, textAlign: "center", padding: "3rem 1rem" }}>
                            Loading...
                          </td>
                        </tr>
                      ) : displayedGlobalWallets.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ ...tdStyle, textAlign: "center", padding: "3rem 1rem" }}>
                            No blacklisted wallets found
                          </td>
                        </tr>
                      ) : (
                        displayedGlobalWallets.map((row, idx) => (
                          <tr
                            key={row.id}
                            onClick={() => navigate(`/blacklist/${row.id}`)}
                            style={{
                              borderBottom:
                                idx === displayedGlobalWallets.length - 1
                                  ? "none"
                                  : "1px solid var(--input-field-blue)",
                              cursor: "pointer",
                            }}
                          >
                            <td style={tdStyle}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{ display: "inline-block", width: "280px" }}>
                                  {truncateAddress(row.walletAddress)}
                                </span>
                                <img
                                  src="/copyBlye.svg"
                                  alt="Copy"
                                  role="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyAddress(row.walletAddress);
                                  }}
                                  style={{ width: "14px", height: "14px", cursor: "pointer", flexShrink: 0 }}
                                />
                              </div>
                            </td>
                            <td style={tdStyle}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                {row.chain === "ETH" ? (
                                  <img src="/ethsmall.svg" alt="ETH" style={{ width: "24px", height: "24px" }} />
                                ) : (
                                  <img src="/btcsmall.svg" alt="BTC" style={{ width: "24px", height: "24px" }} />
                                )}
                                <span>{row.chain}</span>
                              </div>
                            </td>
                            <td style={tdStyle}>{formatDate(row.createdAt)}</td>
                            <td style={tdStyle}>{formatCategory(row.category)}</td>
                            <td style={tdStyle}>
                              <span style={{ color: "var(--text-grey-white)" }}>
                                {formatConfidence(row.confidenceLevel)}
                              </span>
                            </td>
                            <td style={tdStyle}>
                              <img
                                src={
                                  row.confidenceLevel.toUpperCase() === "HIGH"
                                    ? "/blacklistPlus7.svg"
                                    : row.confidenceLevel.toUpperCase() === "MEDIUM"
                                      ? "/blacklistPlus5.svg"
                                      : "/blacklistPlus3.svg"
                                }
                                alt={`Risk ${formatConfidence(row.confidenceLevel)}`}
                                style={{ width: "60px", height: "28px" }}
                              />
                            </td>
                            <td style={{ ...tdStyle, maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {formatCategory(row.source)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div
                    style={{
                      borderTop: "1px solid var(--input-field-blue)",
                      marginLeft: "1rem",
                      marginRight: "1rem",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "1rem 24px",
                    }}
                  >
                    <div style={{ fontFamily: '"Hero New", sans-serif', fontSize: "14px", color: "var(--textWhite)" }}>
                      Showing {displayedGlobalWallets.length} of {globalTotalItems} blacklisted wallets
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <button
                        type="button"
                        onClick={() => handleGlobalPageChange(globalCurrentPage - 1)}
                        disabled={globalCurrentPage === 1}
                        style={{
                          width: "32px",
                          height: "32px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "4px",
                          border: "1px solid var(--input-field-border)",
                          backgroundColor: globalCurrentPage === 1 ? "var(--very-dark-blue)" : "var(--input-field-blue)",
                          color: "var(--textWhite)",
                          cursor: globalCurrentPage === 1 ? "not-allowed" : "pointer",
                          fontFamily: '"Hero New", sans-serif',
                          fontSize: "16px",
                          opacity: globalCurrentPage === 1 ? 0.5 : 1,
                        }}
                      >
                        ◀
                      </button>
                      <input
                        type="number"
                        value={globalCurrentPage}
                        onChange={handleGlobalPageInputChange}
                        min={1}
                        max={globalTotalPages}
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
                      <button
                        type="button"
                        onClick={() => handleGlobalPageChange(globalCurrentPage + 1)}
                        disabled={globalCurrentPage === globalTotalPages}
                        style={{
                          width: "32px",
                          height: "32px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "4px",
                          border: "1px solid var(--input-field-border)",
                          backgroundColor:
                            globalCurrentPage === globalTotalPages
                              ? "var(--very-dark-blue)"
                              : "var(--input-field-blue)",
                          color: "var(--textWhite)",
                          cursor: globalCurrentPage === globalTotalPages ? "not-allowed" : "pointer",
                          fontFamily: '"Hero New", sans-serif',
                          fontSize: "16px",
                          opacity: globalCurrentPage === globalTotalPages ? 0.5 : 1,
                        }}
                      >
                        ▶
                      </button>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontFamily: '"Hero New", sans-serif', fontSize: "14px", color: "var(--textWhite)" }}>
                        Show
                      </span>
                      <select
                        value={globalItemsPerPage}
                        onChange={(e) => {
                          setGlobalItemsPerPage(Number(e.target.value));
                          setGlobalCurrentPage(1);
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
                      <span style={{ fontFamily: '"Hero New", sans-serif', fontSize: "14px", color: "var(--textWhite)" }}>
                        Per Page
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </PageLayout>

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
    </>
  );
}
