import React, { useState, useEffect } from "react";
import { useMenuBar } from "./menuBar/useMenuBar";
import { API_BASE_URL } from "../utils/auth";

interface WalletScore {
  walletAddress: string;
  riskScore: number;
  recommendedAction: string;
  checkedAt: string;
}

interface TableRow {
  walletAddress: string;
  blockchain: "ETH" | "BTC";
  riskScore: number;
  recommendedAction: string;
  timestamp: string;
}

function detectBlockchain(address: string): "ETH" | "BTC" {
  return address.startsWith("0x") ? "ETH" : "BTC";
}

export default function WalletSearchResultTable() {
  const { isMenuOpen } = useMenuBar();
  const menuBarWidth = isMenuOpen ? 240 : 90;
  const width = `calc(90vw - ${menuBarWidth}px)`;
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const riskScoreMap = [
    {
      riskScore: 8,
      icon: "/8score.svg",
    },
    {
      riskScore: 1,
      icon: "/1score.svg",
    },
    {
      riskScore: 5,
      icon: "/5score.svg",
    },
  ];

  useEffect(() => {
    const fetchWalletScores = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/backend/getAllWalletScores?page=${currentPage - 1}&pageSize=${itemsPerPage}`,
          { credentials: "include" },
        );
        if (!res.ok) throw new Error("Failed to fetch wallet scores");
        const json = await res.json();
        const rows: TableRow[] = json.data.map((score: WalletScore) => ({
          walletAddress: score.walletAddress,
          blockchain: detectBlockchain(score.walletAddress),
          riskScore: score.riskScore,
          recommendedAction: score.recommendedAction,
          timestamp: score.checkedAt,
        }));
        setTableData(rows);
        setTotalItems(json.totalEntries);
        setTotalPages(json.totalPages);
      } catch (err) {
        console.error("Error fetching wallet scores:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWalletScores();
  }, [currentPage, itemsPerPage]);

  const displayedData = tableData;
  const displayedCount = tableData.length;

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
        width: width,
        backgroundColor: "transparent",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        paddingTop: "2rem",
        paddingBottom: "2rem",
      }}
    >
      {/* Header Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
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
              placeholder="Filter Wallets"
              style={{
                height: "54px",
                padding: "1rem 1rem 1rem 2.75rem",
                borderRadius: "4px",
                border: "1px solid var(--input-field-border)",
                backgroundColor: "var(--input-field-blue)",
                color: "var(--textWhite)",
                boxSizing: "border-box",
                fontFamily: '"Hero New", sans-serif',
                fontSize: "14px",
                minWidth: "200px",
              }}
            />
          </div>
          <button
            type="button"
            style={{
              height: "54px",
              padding: "0 1.5rem",
              borderRadius: "4px",
              border: "1px solid var(--blue)",
              backgroundColor: "var(--very-dark-blue)",
              color: "var(--blue)",
              cursor: "pointer",
              fontWeight: 500,
              fontFamily: '"Hero New", sans-serif',
              fontSize: "16px",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <img
              src="/blueExport.svg"
              alt="Export"
              style={{ width: "12px", height: "17px" }}
            />
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          backgroundColor: "var(--dark-blue)",
          borderRadius: "4px",
          overflow: "hidden",
          paddingLeft: "20px",
          paddingRight: "20px",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: "1px solid var(--input-field-border)",
              }}
            >
              <th
                style={{
                  padding: "calc(1rem + 20px) 1rem 1rem 1rem",
                  textAlign: "left",
                  fontFamily: '"Hero New", sans-serif',
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--textWhite)",
                  borderTopLeftRadius: "4px",
                }}
              >
                Wallet Address
              </th>
              <th
                style={{
                  padding: "calc(1rem + 20px) 1rem 1rem 1rem",
                  textAlign: "left",
                  fontFamily: '"Hero New", sans-serif',
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--textWhite)",
                }}
              >
                Block Chain
              </th>
              <th
                style={{
                  padding: "calc(1rem + 20px) 1rem 1rem 1rem",
                  textAlign: "left",
                  fontFamily: '"Hero New", sans-serif',
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--textWhite)",
                }}
              >
                Risk Score
              </th>
              <th
                style={{
                  padding: "calc(1rem + 20px) 1rem 1rem 1rem",
                  textAlign: "left",
                  fontFamily: '"Hero New", sans-serif',
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--textWhite)",
                }}
              >
                Recommended Action
              </th>
              <th
                style={{
                  padding: "calc(1rem + 20px) 1rem 1rem 1rem",
                  textAlign: "left",
                  fontFamily: '"Hero New", sans-serif',
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--textWhite)",
                  borderTopRightRadius: "4px",
                }}
              >
                Timestamp
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={5}
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
                  colSpan={5}
                  style={{
                    padding: "3rem 1rem",
                    textAlign: "center",
                    fontFamily: '"Hero New", sans-serif',
                    fontSize: "14px",
                    color: "var(--text-grey-white)",
                  }}
                >
                  No results found
                </td>
              </tr>
            ) : null}
            {displayedData.map((row, index) => {
              const isLastRow = index === displayedData.length - 1;
              return (
                <tr
                  key={index}
                  style={{
                    borderBottom: isLastRow
                      ? "none"
                      : "1px solid var(--input-field-border)",
                  }}
                >
                  <td
                    style={{
                      padding: "1rem",
                      fontFamily: '"Hero New", sans-serif',
                      fontSize: "13px",
                      color: "var(--text-grey-white)",
                      ...(isLastRow && { borderBottomLeftRadius: "4px" }),
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
                        onClick={() => handleCopyAddress(row.walletAddress)}
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
                      fontFamily: '"Hero New", sans-serif',
                      fontSize: "14px",
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
                      fontFamily: '"Hero New", sans-serif',
                      fontSize: "14px",
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
                      {(() => {
                        const matchedItem = riskScoreMap.find(
                          (item) => item.riskScore === row.riskScore,
                        );
                        return matchedItem ? (
                          <img
                            src={matchedItem.icon}
                            alt={`Risk Score ${row.riskScore}`}
                            style={{ width: "40px", height: "40px" }}
                          />
                        ) : null;
                      })()}
                      <span>{row.riskScore}</span>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "1rem",
                      fontFamily: '"Hero New", sans-serif',
                      fontSize: "14px",
                      color: "var(--textWhite)",
                      display: "flex",
                    }}
                  >
                    {row.recommendedAction === "Allow" ? (
                      <img
                        src="/allow.svg"
                        alt="Allow"
                        style={{ width: "76px", height: "24px" }}
                      />
                    ) : row.recommendedAction === "Review" ? (
                      <img
                        src="/review.svg"
                        alt="Review"
                        style={{ width: "94px", height: "24px" }}
                      />
                    ) : row.recommendedAction === "Escalate" ? (
                      <img
                        src="/escalate.svg"
                        alt="Escalate"
                        style={{ width: "94px", height: "24px" }}
                      />
                    ) : (
                      row.recommendedAction
                    )}
                  </td>
                  <td
                    style={{
                      padding: "1rem",
                      fontFamily: '"Hero New", sans-serif',
                      fontSize: "14px",
                      color: "var(--textWhite)",
                      ...(isLastRow && { borderBottomRightRadius: "4px" }),
                    }}
                  >
                    {row.timestamp}
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
