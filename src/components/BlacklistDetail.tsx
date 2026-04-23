import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageHeader from "./PageHeader";
import PageLayout from "./PageLayout";
import AddEditOrgBlacklist from "./AddEditOrgBlacklist";
import { API_BASE_URL } from "../utils/auth";
import { useUser } from "../context/userContext";

type BlacklistEntry = {
  id: string;
  walletAddress: string;
  chain: "BTC" | "ETH";
  category: string;
  confidenceLevel: string;
  source: string | null;
  notes: string | null;
  caseReferenceId: string | null;
  createdAt: string;
  updatedAt: string;
  addedBy: { name: string };
  orgId: string | null;
  isAdminListed: boolean;
  mostRecentWalletScore?: string;
};

function formatEnum(val: string | null | undefined): string {
  if (!val) return "None";
  return val
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

function formatDate(iso: string): string {
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

function getRiskBadge(confidenceLevel: string): string {
  switch (confidenceLevel.toUpperCase()) {
    case "HIGH":
      return "/blacklistPlus7.svg";
    case "MEDIUM":
      return "/blacklistPlus5.svg";
    default:
      return "/blacklistPlus3.svg";
  }
}

function truncateAddress(addr: string): string {
  if (addr.length <= 12) return addr;
  return addr.slice(0, 4) + "..." + addr.slice(-4);
}

const sectionTitle: React.CSSProperties = {
  fontFamily: '"Hero New", sans-serif',
  fontWeight: 700,
  fontSize: "18px",
  color: "var(--textWhite)",
  marginBottom: "20px",
};

const fieldLabel: React.CSSProperties = {
  fontFamily: '"Hero New", sans-serif',
  fontSize: "14px",
  fontWeight: 400,
  color: "var(--textGrey)",
  marginBottom: "12px",
};

const fieldValue: React.CSSProperties = {
  fontFamily: '"Hero New", sans-serif',
  fontSize: "14px",
  fontWeight: 400,
  color: "var(--text-grey-white)",
};

export default function BlacklistDetail() {
  const { isAdmin } = useUser();
  const { blacklistEntryId } = useParams<{ blacklistEntryId: string }>();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<BlacklistEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const [deleteMessageIsError, setDeleteMessageIsError] = useState(false);

  const fetchEntry = useCallback(async () => {
    if (!blacklistEntryId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        `${API_BASE_URL}/backend/getBlacklistEntryById/${blacklistEntryId}`,
        { credentials: "include" }
      );
      if (!res.ok) {
        if (res.status === 404) throw new Error("Blacklist entry not found");
        throw new Error("Failed to fetch blacklist entry");
      }
      const data: BlacklistEntry = await res.json();
      setEntry(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch blacklist entry");
    } finally {
      setLoading(false);
    }
  }, [blacklistEntryId]);

  useEffect(() => {
    fetchEntry();
  }, [fetchEntry]);

  const handleEditSuccess = () => {
    setShowEditModal(false);
    fetchEntry();
  };

  const handleConfirmDelete = async () => {
    if (!blacklistEntryId) return;
    setDeleteConfirmOpen(false);
    setIsDeleting(true);
    setDeleteMessage("Deleting...");
    setDeleteMessageIsError(false);

    try {
      const res = await fetch(`${API_BASE_URL}/backend/updateVisarynBlacklistEntry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: blacklistEntryId, deleted: true }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `Request failed (${res.status})`);
      }

      navigate(isAdmin ? "/adminBlacklist" : "/blacklist");
    } catch (err) {
      setDeleteMessage(err instanceof Error ? err.message : "Failed to delete entry");
      setDeleteMessageIsError(true);
      setIsDeleting(false);
    }
  };

  const handleCopy = async () => {
    if (!entry) return;
    try {
      await navigator.clipboard.writeText(entry.walletAddress);
      setShowCopyNotification(true);
      setTimeout(() => setShowCopyNotification(false), 3000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <>
      <div>
        <title>Blacklist</title>
        <meta name="description" content="Blacklist Entry Detail" />
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
              paddingTop: "32px",
              paddingRight: "32px",
              paddingLeft: "32px",
              paddingBottom: "55px",
            }}
          >
            {/* Back button */}
            <button
              onClick={() => navigate(isAdmin ? "/adminBlacklist" : "/blacklist")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "var(--input-field-blue)",
                border: "none",
                borderRadius: "4px",
                padding: "12px 18px",
                color: "var(--blue)",
                fontFamily: '"Hero New", sans-serif',
                fontSize: "15px",
                fontWeight: 500,
                cursor: "pointer",
                marginBottom: "28px",
                boxShadow: "none",
              }}
            >
              <img src="/backArrowBlue.svg" alt="" style={{ width: "16px", height: "16px" }} />{" "}
              {isAdmin || (entry && entry.isAdminListed)
                ? "Back to Blacklist"
                : "Back to Organization Blacklist"}
            </button>

            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem 1rem",
                  fontFamily: '"Hero New", sans-serif',
                  fontSize: "14px",
                  color: "var(--text-grey-white)",
                }}
              >
                Loading...
              </div>
            ) : error ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem 1rem",
                  fontFamily: '"Hero New", sans-serif',
                  fontSize: "14px",
                  color: "#e05252",
                }}
              >
                {error}
              </div>
            ) : entry ? (
              <>
                {/* Wallet header row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "24px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                    {/* Chain icon */}
                    <img
                      src={entry.chain === "BTC" ? "/btcsmall.svg" : "/ethsmall.svg"}
                      alt={entry.chain}
                      style={{ width: "120px", height: "120px", flexShrink: 0 }}
                    />

                    {/* Address info */}
                    <div>
                      <div
                        style={{
                          fontFamily: '"Hero New", sans-serif',
                          fontWeight: 500,
                          fontSize: "28px",
                          color: "var(--textWhite)",
                          marginBottom: "18px",
                        }}
                      >
                        {truncateAddress(entry.walletAddress)}
                      </div>
                      <div
                        style={{
                          fontFamily: '"Hero New", sans-serif',
                          fontSize: "12px",
                          color: "var(--textGrey)",
                          marginBottom: "6px",
                        }}
                      >
                        {entry.chain === "BTC" ? "Bitcoin" : "Ethereum"} Address
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: '"Hero New", sans-serif',
                            fontSize: "13px",
                            fontWeight: 300,
                            color: "var(--textWhite)",
                          }}
                        >
                          {entry.walletAddress}
                        </span>
                        <img
                          src="/copyBlye.svg"
                          alt="Copy"
                          role="button"
                          onClick={handleCopy}
                          style={{
                            width: "14px",
                            height: "14px",
                            cursor: "pointer",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Org users: org-scoped non-admin rows. Admins: any row (API enforces). */}
                  {(isAdmin || (entry.orgId && !entry.isAdminListed)) && (
                  <div style={{ display: "flex", gap: "12px" }}>
                    <button
                      onClick={() => setShowEditModal(true)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        backgroundColor: "var(--input-field-blue)",
                        border: "none",
                        borderRadius: "4px",
                        padding: "14px 20px",
                        color: "var(--blue)",
                        fontFamily: '"Hero New", sans-serif',
                        fontSize: "15px",
                        fontWeight: 500,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <img
                        src="/pencilBlue.svg"
                        alt=""
                        style={{ width: "24px", height: "16px" }}
                      />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (isDeleting) return;
                        setDeleteMessage(null);
                        setDeleteMessageIsError(false);
                        setDeleteConfirmOpen(true);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        backgroundColor: "var(--input-field-blue)",
                        border: "none",
                        borderRadius: "4px",
                        padding: "14px 20px",
                        color: "var(--blue)",
                        fontFamily: '"Hero New", sans-serif',
                        fontSize: "15px",
                        fontWeight: 500,
                        cursor: isDeleting ? "not-allowed" : "pointer",
                        whiteSpace: "nowrap",
                        opacity: isDeleting ? 0.5 : 1,
                      }}
                    >
                      <img
                        src="/noSymbolBlue.svg"
                        alt=""
                        style={{ width: "24px", height: "16px" }}
                      />
                      Remove from Blacklist
                    </button>
                  </div>
                  )}
                </div>

                {/* Screening banner */}
                {entry.mostRecentWalletScore && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: "var(--teal)",
                      borderRadius: "4px",
                      padding: "16px 24px",
                      marginBottom: "28px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <img
                        src="/infoIconBlueFilled.svg"
                        alt=""
                        style={{ width: "32px", height: "28px", flexShrink: 0 }}
                      />
                      <div>
                        <div
                          style={{
                            fontFamily: '"Hero New", sans-serif',
                            fontWeight: 700,
                            fontSize: "14px",
                            color: "var(--text-grey-white)",
                            marginBottom: "10px",
                          }}
                        >
                          This wallet has been screened
                        </div>
                        <div
                          style={{
                            fontFamily: '"Hero New", sans-serif',
                            fontWeight: 400,
                            fontSize: "13px",
                            color: "var(--text-grey-white)",
                          }}
                        >
                          Click Go to Wallet to see this wallet's risk score and decision rationale.
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/screenings/${entry.mostRecentWalletScore}`)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        backgroundColor: "var(--very-dark-blue)",
                        border: "1px solid var(--blue)",
                        borderRadius: "4px",
                        padding: "10px 18px",
                        color: "var(--blue)",
                        fontFamily: '"Hero New", sans-serif',
                        fontSize: "14px",
                        fontWeight: 500,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Go to Wallet
                      <img
                        src="/forwardArrowBlue.svg"
                        alt=""
                        style={{ width: "24px", height: "16px" }}
                      />
                    </button>
                  </div>
                )}

                {/* Risk Classification */}
                <div style={sectionTitle}>Risk Classification</div>
                <div
                  style={{
                    borderTop: "1px solid var(--input-field-blue)",
                    marginBottom: "24px",
                  }}
                />

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr",
                    gap: "24px",
                    marginBottom: "18px",
                  }}
                >
                  <div>
                    <div style={fieldLabel}>Category:</div>
                    <div style={fieldValue}>{formatEnum(entry.category)}</div>
                  </div>
                  <div>
                    <div style={fieldLabel}>Confidence Level:</div>
                    <div style={fieldValue}>{formatEnum(entry.confidenceLevel)}</div>
                  </div>
                  <div>
                    <div style={fieldLabel}>Risk Impact:</div>
                    <img
                      src={getRiskBadge(entry.confidenceLevel)}
                      alt={`Risk ${formatEnum(entry.confidenceLevel)}`}
                      style={{ width: "60px", height: "28px" }}
                    />
                  </div>
                  <div>
                    <div style={fieldLabel}>Source:</div>
                    <div style={fieldValue}>{formatEnum(entry.source)}</div>
                  </div>
                </div>

                {/* Notes + Case Reference */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr",
                    gap: "24px",
                    marginBottom: "40px",
                  }}
                >
                  <div style={{ gridColumn: "1 / 4" }}>
                    <div style={fieldLabel}>Notes:</div>
                    <div
                      style={{
                        ...fieldValue,
                        lineHeight: "1.6",
                      }}
                    >
                      {entry.notes || "None"}
                    </div>
                  </div>
                  <div>
                    <div style={fieldLabel}>Case Reference ID:</div>
                    <div style={fieldValue}>{entry.caseReferenceId || "None"}</div>
                  </div>
                </div>

                {/* Other Details */}
                <div style={sectionTitle}>Other Details</div>
                <div
                  style={{
                    borderTop: "1px solid var(--input-field-blue)",
                    marginBottom: "24px",
                  }}
                />

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "24px",
                  }}
                >
                  <div>
                    <div style={fieldLabel}>Date Added:</div>
                    <div style={fieldValue}>{formatDate(entry.createdAt)}</div>
                  </div>
                  <div>
                    <div style={fieldLabel}>Added By:</div>
                    <div style={fieldValue}>{entry.addedBy.name}</div>
                  </div>
                  <div>
                    <div style={fieldLabel}>Last Updated:</div>
                    <div style={fieldValue}>{formatDate(entry.updatedAt)}</div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </PageLayout>

      <AddEditOrgBlacklist
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleEditSuccess}
        editEntryId={blacklistEntryId ?? null}
      />

      {deleteConfirmOpen && (
        <div
          onClick={() => {
            if (isDeleting) return;
            setDeleteConfirmOpen(false);
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
                  color: "var(--textWhite)",
                  margin: 0,
                }}
              >
                Delete blacklist entry
              </h2>
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                disabled={isDeleting}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--blue)",
                  fontSize: "24px",
                  cursor: "pointer",
                  padding: "0",
                  lineHeight: 1,
                }}
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
              Are you sure you want to delete this blacklist entry? This action cannot be undone.
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
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
                onClick={handleConfirmDelete}
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

      {deleteMessage && !deleteConfirmOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "2rem",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "var(--dark-blue)",
            color: deleteMessageIsError ? "#e05252" : "var(--textWhite)",
            padding: "0.75rem 1.5rem",
            borderRadius: "4px",
            border: deleteMessageIsError ? "1px solid #e05252" : "1px solid var(--blue)",
            fontFamily: '"Hero New", sans-serif',
            fontSize: "14px",
            fontWeight: 500,
            zIndex: 9999,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          }}
        >
          {deleteMessage}
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
