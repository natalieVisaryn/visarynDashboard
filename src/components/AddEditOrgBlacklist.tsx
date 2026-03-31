import { useState, useEffect } from "react";
import { API_BASE_URL } from "../utils/auth";

type AddEditOrgBlacklistProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editEntryId?: string | null;
  initialAddress?: string;
  initialChain?: string;
};

const labelStyle: React.CSSProperties = {
  fontFamily: '"Hero New", sans-serif',
  fontSize: "14px",
  fontWeight: 400,
  color: "var(--textGrey)",
  marginBottom: "8px",
  display: "flex",
  alignItems: "center",
  gap: "4px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "6px",
  border: "1px solid var(--input-field-border)",
  backgroundColor: "var(--input-field-blue)",
  color: "var(--textWhite)",
  fontFamily: '"Hero New", sans-serif',
  fontSize: "14px",
  outline: "none",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23a9b1c0' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 16px center",
  paddingRight: "40px",
  cursor: "pointer",
};

const requiredDot: React.CSSProperties = {
  color: "#e05252",
  fontSize: "14px",
  fontWeight: 700,
};

export default function AddEditOrgBlacklist({ isOpen, onClose, onSuccess, editEntryId, initialAddress = "", initialChain = "ETH" }: AddEditOrgBlacklistProps) {
  const [address, setAddress] = useState(initialAddress);
  const [chain, setChain] = useState(initialChain);
  const [confidence, setConfidence] = useState("");

  const chainOptions = ["ETH", "BTC"];

  const confidenceOptions = ["HIGH", "MEDIUM", "LOW"];

  const categoryOptions = [
    "KNOWN_SCAM_FRAUD",
    "STOLEN_FUNDS",
    "MIXER_OBFUSCATION",
    "TERRORIST_FINANCING",
    "RANSOMWARE",
    "SANCTIONS_EXPOSURE",
    "OTHER",
  ];

  const CATEGORY_DISPLAY: Record<string, string> = {
    KNOWN_SCAM_FRAUD: "Known Scam/Fraud",
  };

  const formatCategory = (val: string) =>
    CATEGORY_DISPLAY[val] ??
    val
      .split("_")
      .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
      .join(" ");

  const formatConfidence = (val: string) =>
    val.charAt(0) + val.slice(1).toLowerCase();

  const sourceOptions = [
    "VISARYN_RESEARCH",
    "CUSTOMER_INVESTIGATION",
    "LAW_ENFORCEMENT",
    "BLOCKCHAIN_ANALYTICS_PROVIDER",
    "USER_SUBMITTED",
    "OTHER",
  ];

  const [category, setCategory] = useState("");
  const [source, setSource] = useState("");
  const [caseReferenceId, setCaseReferenceId] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingEntry, setLoadingEntry] = useState(false);

  const isEditing = !!editEntryId;

  useEffect(() => {
    if (!isOpen || !editEntryId) return;

    const fetchEntry = async () => {
      setLoadingEntry(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/backend/getBlacklistEntryById/${editEntryId}`, {
          credentials: "include",
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || `Failed to load entry (${res.status})`);
        }
        const entry = await res.json();
        setAddress(entry.walletAddress ?? "");
        setChain(entry.chain ?? "ETH");
        setConfidence(entry.confidenceLevel ?? "MEDIUM");
        setCategory(entry.category ?? "KNOWN_SCAM_FRAUD");
        setSource(entry.source ?? "");
        setCaseReferenceId(entry.caseReferenceId ?? "");
        setNotes(entry.notes ?? "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load blacklist entry");
      } finally {
        setLoadingEntry(false);
      }
    };

    fetchEntry();
  }, [isOpen, editEntryId]);

  useEffect(() => {
    if (isOpen && !editEntryId) {
      setAddress(initialAddress);
      setChain(initialChain);
    }
  }, [isOpen, editEntryId, initialAddress, initialChain]);

  const resetForm = () => {
    setAddress(initialAddress);
    setChain(initialChain);
    setConfidence("");
    setCategory("");
    setSource("");
    setCaseReferenceId("");
    setNotes("");
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    setError(null);

    if (!category) {
      setError("You must select a category");
      return;
    }
    if (!confidence) {
      setError("You must select a confidence level");
      return;
    }

    setSubmitting(true);

    try {
      let res: Response;

      if (isEditing) {
        const body: Record<string, string | null> = {
          id: editEntryId!,
          category,
          notes,
          confidenceLevel: confidence,
          source: source || null,
        };
        if (caseReferenceId.trim()) {
          body.caseReferenceId = caseReferenceId.trim();
        }

        res = await fetch(`${API_BASE_URL}/backend/updateVisarynBlacklistEntry`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        });
      } else {
        const body: Record<string, string | null> = {
          walletAddress: address.trim(),
          chain,
          category,
          notes,
          confidenceLevel: confidence,
          source: source || null,
        };
        if (caseReferenceId.trim()) {
          body.caseReferenceId = caseReferenceId.trim();
        }

        res = await fetch(`${API_BASE_URL}/backend/createVisarynBlacklist`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        });
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `Request failed (${res.status})`);
      }

      resetForm();
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={handleClose}
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
          borderRadius: "16px",
          border: "none",
          width: "560px",
          maxWidth: "90vw",
          maxHeight: "90vh",
          overflowY: "auto",
          paddingBottom: "32px",
          paddingLeft: "28px",
          paddingRight: "28px",
          paddingTop: "24px",
          position: "relative",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
          <h2
            style={{
              fontFamily: '"Hero New", sans-serif',
              fontSize: "16px",
              fontWeight: 400,
              fontStyle: "regular",
              color: "var(--textWhite)",
              marginBottom: "18px",
            }}
          >
            {isEditing ? "Edit Blacklist Entry" : "Add Wallet to Blacklist"}
          </h2>
          <button
            onClick={handleClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0",
              lineHeight: 0,
            }}
          >
            <img src="/xBlue.svg" alt="Close" style={{ width: "14px", height: "14px" }} />
          </button>
        </div>
        {loadingEntry && (
          <div
            style={{
              textAlign: "center",
              padding: "2rem 0",
              fontFamily: '"Hero New", sans-serif',
              fontSize: "14px",
              color: "var(--textGrey)",
            }}
          >
            Loading entry...
          </div>
        )}

        {!loadingEntry && (<>
        {/* Warning banner */}
        <div
          style={{
            backgroundColor: "var(--brown)",
            borderRadius: "8px",
            padding: "16px 20px",
            marginBottom: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <img src="/alertOrange.svg" alt="Warning" style={{ width: "24px", height: "24px", flexShrink: 0 }} />
            <div
              style={{
                fontFamily: '"Hero New", sans-serif',
                fontSize: "15px",
                fontWeight: 700,
                color: "var(--textWhite)",
              }}
            >
              Important
            </div>
          </div>
          <div
            style={{
              fontFamily: '"Hero New", sans-serif',
              fontSize: "13px",
              color: "var(--text-grey-white)",
              lineHeight: 1.5,
            }}
          >
            This entry will affect future screenings for your organization. Previously screened wallets are not retroactively rescored.
          </div>
        </div>

        {/* Wallet Address + Chain row */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
          <div style={{ flex: 2 }}>
            <label style={labelStyle}>
              Wallet Address <span style={requiredDot}>•</span>
            </label>
            <input
              type="text"
              placeholder="Enter address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              readOnly={isEditing}
              style={{
                ...inputStyle,
                ...(isEditing ? { opacity: 0.5, cursor: "not-allowed" } : {}),
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>
              Chain <span style={requiredDot}>•</span>
            </label>
            <select
              value={chain}
              onChange={(e) => setChain(e.target.value)}
              disabled={isEditing}
              style={{
                ...selectStyle,
                ...(isEditing ? { opacity: 0.5, cursor: "not-allowed" } : {}),
              }}
            >
              {chainOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category + Confidence row */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>
              Category <span style={requiredDot}>•</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                ...selectStyle,
                ...(!category ? { color: "var(--textGrey)" } : {}),
              }}
            >
              <option value="" disabled>Choose category</option>
              {categoryOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {formatCategory(opt)}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>
              Confidence Level <span style={requiredDot}>•</span>
            </label>
            <select
              value={confidence}
              onChange={(e) => setConfidence(e.target.value)}
              style={{
                ...selectStyle,
                ...(!confidence ? { color: "var(--textGrey)" } : {}),
              }}
            >
              <option value="" disabled>Choose confidence level</option>
              {confidenceOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {formatConfidence(opt)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Source + Case Reference ID row */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Source</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              style={{
                ...selectStyle,
                ...(!source ? { color: "var(--textGrey)" } : {}),
              }}
            >
              <option value="">Choose source</option>
              {sourceOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {formatCategory(opt)}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Case Reference ID</label>
            <input
              type="text"
              placeholder="Enter reference ID"
              value={caseReferenceId}
              onChange={(e) => setCaseReferenceId(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Notes */}
        <div style={{ marginBottom: "28px" }}>
          <label style={labelStyle}>
            Notes
          </label>
          <textarea
            className="notes-textarea"
            placeholder="Optionally enter any relevant notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={1}
            style={{
              ...inputStyle,
              resize: "both",
              height: "48px",
              boxSizing: "border-box",
            }}
          />
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "rgba(224, 82, 82, 0.15)",
              border: "1px solid #e05252",
              borderRadius: "6px",
              padding: "12px 16px",
              marginBottom: "20px",
              fontFamily: '"Hero New", sans-serif',
              fontSize: "13px",
              color: "#e05252",
            }}
          >
            {error}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
          <button
            onClick={handleClose}
            disabled={submitting}
            style={{
              fontFamily: '"Hero New", sans-serif',
              fontSize: "15px",
              fontWeight: 500,
              width: "83px",
              height: "54px",
              padding: "0",
              borderRadius: "4px",
              border: "1px solid var(--blue)",
              backgroundColor: "var(--very-dark-blue)",
              color: "var(--blue)",
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.6 : 1,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              fontFamily: '"Hero New", sans-serif',
              fontSize: "15px",
              fontWeight: 500,
              width: isEditing ? "116px" : "202px",
              height: "54px",
              padding: "0",
              borderRadius: "4px",
              border: "none",
              backgroundColor: "var(--blue)",
              color: "var(--very-dark-blue)",
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.6 : 1,
            }}
          >
            {submitting ? (isEditing ? "Updating..." : "Adding...") : (isEditing ? "Update Wallet" : "Add Wallet to Blacklist")}
          </button>
        </div>
        </>)}
      </div>
    </div>
  );
}
