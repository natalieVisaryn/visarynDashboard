import { useState, useEffect, useCallback, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import AddEditOrgBlacklist from "./AddEditOrgBlacklist";
import { API_BASE_URL } from "../utils/auth";
import type { BlacklistTableEntry, SortColumn, SortCycle } from "./orgBlacklistShared";
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

type OrganizationBlacklistPanelProps = {
  variant: "embedded" | "standalone" | "admin";
};

export default function OrganizationBlacklistPanel({
  variant,
}: OrganizationBlacklistPanelProps) {
  const navigate = useNavigate();

  const [wallets, setWallets] = useState<BlacklistTableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const [deleteMessageIsError, setDeleteMessageIsError] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editEntryId, setEditEntryId] = useState<string | null>(null);
  const [orgSortColumn, setOrgSortColumn] = useState<SortColumn | null>(null);
  const [orgSortCycle, setOrgSortCycle] = useState<SortCycle>(1);

  const fetchBlacklist = useCallback(async () => {
    try {
      setLoading(true);
      const path =
        variant === "admin" ? "/backend/getAdminBlacklist" : "/backend/getOrgBlacklist";
      const res = await fetch(`${API_BASE_URL}${path}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data: BlacklistTableEntry[] = await res.json();
      setWallets(data);
    } catch (err) {
      console.error("Failed to fetch org blacklist:", err);
    } finally {
      setLoading(false);
    }
  }, [variant]);

  useEffect(() => {
    fetchBlacklist();
  }, [fetchBlacklist]);

  const handleAddSuccess = () => {
    setShowModal(false);
    setEditEntryId(null);
    fetchBlacklist();
  };

  const handleOrgSortClick = (column: SortColumn) => {
    if (column !== orgSortColumn) {
      setOrgSortColumn(column);
      setOrgSortCycle(1);
    } else {
      setOrgSortCycle(((orgSortCycle % 3) + 1) as SortCycle);
    }
  };

  const sortedOrgWallets = sortEntries(wallets, orgSortColumn, orgSortCycle);
  const totalItems = sortedOrgWallets.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIdx = (currentPage - 1) * itemsPerPage;
  const displayedWallets = sortedOrgWallets.slice(startIdx, startIdx + itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1 && value <= totalPages) setCurrentPage(value);
  };

  useEffect(() => {
    if (showCopyNotification) {
      const timer = setTimeout(() => setShowCopyNotification(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showCopyNotification]);

  useEffect(() => {
    if (!deleteMessage) return;
    if (isDeleting) return;
    const timer = setTimeout(() => setDeleteMessage(null), 2500);
    return () => clearTimeout(timer);
  }, [deleteMessage, isDeleting]);

  const handleCopyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setShowCopyNotification(true);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  const handleRequestDeleteOrgEntry = (id: string) => {
    if (isDeleting) return;
    setDeleteTargetId(id);
    setDeleteMessage(null);
    setDeleteMessageIsError(false);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDeleteOrgEntry = async () => {
    if (!deleteTargetId) return;
    setDeleteConfirmOpen(false);
    setIsDeleting(true);
    setDeleteMessage("Deleting...");
    setDeleteMessageIsError(false);

    try {
      const res = await fetch(`${API_BASE_URL}/backend/updateVisarynBlacklistEntry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: deleteTargetId, deleted: true }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `Request failed (${res.status})`);
      }

      setCurrentPage(1);
      await fetchBlacklist();
      setDeleteMessage("Entry deleted");
      setDeleteMessageIsError(false);
    } catch (err) {
      setDeleteMessage(err instanceof Error ? err.message : "Failed to delete entry");
      setDeleteMessageIsError(true);
    } finally {
      setIsDeleting(false);
      setDeleteTargetId(null);
    }
  };

  const tableMaxHeight =
    variant === "standalone" || variant === "admin"
      ? "calc(100vh - 300px)"
      : "calc(100vh - 340px)";

  const panelTitleStyle: CSSProperties = {
    fontFamily: '"Hero New", sans-serif',
    fontWeight: 700,
    fontSize: "18px",
    color: "var(--textWhite)",
  };

  const panelTitle =
    variant === "embedded" ? "Organization Blacklist" : "Blacklisted Wallets";

  const tableColumns: [string, SortColumn][] = [
    ["Wallet Address", "walletAddress"],
    ["Blockchain", "blockchain"],
    ["Added", "added"],
    ...(variant === "admin" ? ([["Added By", "addedBy"]] as [string, SortColumn][]) : []),
    ["Category", "category"],
    ["Confidence", "confidence"],
    ["Risk Impact", "riskImpact"],
    ["Source", "source"],
  ];
  const dataColumnCount = tableColumns.length;

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "24px 24px 0 24px",
        }}
      >
        <span style={panelTitleStyle}>{panelTitle}</span>
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "var(--blue)",
            border: "none",
            borderRadius: "4px",
            color: "var(--very-dark-blue)",
            fontFamily: '"Hero New", sans-serif',
            fontSize: "15px",
            fontWeight: 500,
            padding: "10px 16px",
            cursor: "pointer",
            whiteSpace: "nowrap",
            flexShrink: 0,
            height: "48px",
          }}
        >
          <img src="/plusDarkBlue.svg" alt="" style={{ width: "24px", height: "16px" }} /> Add Wallet to Blacklist
        </button>
      </div>

      {deleteMessage && (
        <div
          style={{
            padding: "12px 24px 0 24px",
            fontFamily: '"Hero New", sans-serif',
            fontSize: "14px",
            fontWeight: 500,
            color: deleteMessageIsError ? "#e05252" : "var(--light-blue)",
          }}
        >
          {deleteMessage}
        </div>
      )}

      <div
        className="blacklist-table-scroll"
        style={{
          padding: "12px 24px 0 24px",
          overflowX: "scroll",
          overflowY: "scroll",
          maxHeight: tableMaxHeight,
          maxWidth: "100%",
        }}
      >
        <table
          style={{
            width: "100%",
            minWidth: variant === "admin" ? "1120px" : "1000px",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid var(--input-field-blue)" }}>
              {tableColumns.map(([label, col]) => (
                <th
                  key={col}
                  style={{ ...thStyle, cursor: "pointer", userSelect: "none" }}
                  onClick={() => handleOrgSortClick(col)}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    {label}
                    {renderSortArrow(col, orgSortColumn, orgSortCycle)}
                  </span>
                </th>
              ))}
              <th style={{ ...thStyle, width: "70px" }} />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={dataColumnCount + 1}
                  style={{ ...tdStyle, textAlign: "center", padding: "3rem 1rem" }}
                >
                  Loading...
                </td>
              </tr>
            ) : displayedWallets.length === 0 ? (
              <tr>
                <td
                  colSpan={dataColumnCount + 1}
                  style={{ ...tdStyle, textAlign: "center", padding: "3rem 1rem" }}
                >
                  No blacklisted wallets found
                </td>
              </tr>
            ) : (
              displayedWallets.map((row, idx) => (
                <tr
                  key={row.id}
                  onClick={() => navigate(`/blacklist/${row.id}`)}
                  style={{
                    borderBottom:
                      idx === displayedWallets.length - 1 ? "none" : "1px solid var(--input-field-blue)",
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
                  {variant === "admin" && (
                    <td style={{ ...tdStyle, maxWidth: "220px" }}>
                      {row.orgName ?? "—"}
                    </td>
                  )}
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
                  <td style={tdStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <img
                        src="/pencilBlue.svg"
                        alt="Edit"
                        role="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditEntryId(row.id);
                          setShowModal(true);
                        }}
                        style={{ width: "24px", height: "16px", cursor: "pointer" }}
                      />
                      <img
                        src="/garbageBlue.svg"
                        alt="Delete"
                        role="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRequestDeleteOrgEntry(row.id);
                        }}
                        style={{
                          width: "24px",
                          height: "16px",
                          cursor: isDeleting ? "not-allowed" : "pointer",
                          opacity: isDeleting ? 0.5 : 1,
                        }}
                      />
                    </div>
                  </td>
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
            padding: "1rem 24px",
          }}
        >
          <div style={{ fontFamily: '"Hero New", sans-serif', fontSize: "14px", color: "var(--textWhite)" }}>
            Showing {displayedWallets.length} of {totalItems} blacklisted wallets
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
                backgroundColor: currentPage === 1 ? "var(--very-dark-blue)" : "var(--input-field-blue)",
                color: "var(--textWhite)",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                fontFamily: '"Hero New", sans-serif',
                fontSize: "16px",
                opacity: currentPage === 1 ? 0.5 : 1,
              }}
            >
              ◀
            </button>
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
                backgroundColor: currentPage === totalPages ? "var(--very-dark-blue)" : "var(--input-field-blue)",
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
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontFamily: '"Hero New", sans-serif', fontSize: "14px", color: "var(--textWhite)" }}>
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
            <span style={{ fontFamily: '"Hero New", sans-serif', fontSize: "14px", color: "var(--textWhite)" }}>
              Per Page
            </span>
          </div>
        </div>
      </div>

      <AddEditOrgBlacklist
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditEntryId(null);
        }}
        onSuccess={handleAddSuccess}
        editEntryId={editEntryId}
      />

      {deleteConfirmOpen && (
        <div
          onClick={() => {
            if (isDeleting) return;
            setDeleteConfirmOpen(false);
            setDeleteTargetId(null);
          }}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "var(--dark-blue)",
              borderRadius: "12px",
              border: "none",
              width: "560px",
              maxWidth: "90vw",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "32px",
              position: "relative",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
              <h2
                style={{
                  fontFamily: '"Hero New", sans-serif',
                  fontSize: "22px",
                  fontWeight: 400,
                  fontStyle: "regular",
                  color: "var(--textWhite)",
                  margin: 0,
                }}
              >
                Delete blacklist entry
              </h2>
              <button
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setDeleteTargetId(null);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--blue)",
                  fontSize: "24px",
                  cursor: "pointer",
                  padding: "0",
                  lineHeight: 1,
                }}
                disabled={isDeleting}
              >
                ✕
              </button>
            </div>

            <p
              style={{
                margin: 0,
                marginTop: "8px",
                fontFamily: '"Hero New", sans-serif',
                fontSize: "14px",
                color: "var(--text-grey-white)",
                lineHeight: 1.5,
              }}
            >
              Are you sure you want to delete this organization blacklist entry? This action cannot be undone.
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setDeleteTargetId(null);
                }}
                disabled={isDeleting}
                style={{
                  background: "none",
                  border: "1px solid var(--input-field-border)",
                  borderRadius: "6px",
                  padding: "12px 16px",
                  cursor: isDeleting ? "not-allowed" : "pointer",
                  color: "var(--textWhite)",
                  fontFamily: '"Hero New", sans-serif',
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteOrgEntry}
                disabled={isDeleting}
                style={{
                  backgroundColor: "var(--blue)",
                  border: "none",
                  borderRadius: "6px",
                  padding: "12px 16px",
                  cursor: isDeleting ? "not-allowed" : "pointer",
                  color: "var(--very-dark-blue)",
                  fontFamily: '"Hero New", sans-serif',
                  fontSize: "14px",
                  fontWeight: 600,
                  opacity: isDeleting ? 0.7 : 1,
                }}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

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
