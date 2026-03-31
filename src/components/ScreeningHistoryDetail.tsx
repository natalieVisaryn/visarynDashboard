import { useCallback, useEffect, useState } from "react";
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

interface Props {
  screeningId: string;
  onBack: () => void;
}

export default function ScreeningHistoryDetail({ screeningId, onBack }: Props) {
  const [entry, setEntry] = useState<WalletScoreDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoader, setShowLoader] = useState(false);

  const fetchEntry = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        `${API_BASE_URL}/backend/getWalletScoreDetails/${screeningId}`,
        { credentials: "include" },
      );
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

  useEffect(() => {
    if (!loading) {
      setShowLoader(false);
      return;
    }
    const timer = setTimeout(() => setShowLoader(true), 200);
    return () => clearTimeout(timer);
  }, [loading]);

  if (loading) {
    return showLoader ? (
      <div style={{ minHeight: "400px", textAlign: "center", padding: "3rem 1rem", fontSize: "14px", color: "var(--text-grey-white)" }}>
        Loading...
      </div>
    ) : (
      <div style={{ minHeight: "400px" }} />
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "3rem 1rem", fontSize: "14px", color: "#e05252" }}>
        {error}
      </div>
    );
  }

  if (!entry) return null;

  return (
    <>
      <button
        onClick={onBack}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          backgroundColor: "var(--input-field-blue)",
          border: "none",
          borderRadius: "4px",
          padding: "16px 24px",
          color: "var(--blue)",
          fontSize: "15px",
          fontWeight: 500,
          cursor: "pointer",
          marginBottom: "28px",
        }}
      >
        <img src="/backArrowBlue.svg" alt="" style={{ width: "16px", height: "16px" }} />
        Back to Screening History
      </button>

      <div style={{ fontWeight: 700, fontSize: "18px", color: "var(--textWhite)", marginTop: "10px", marginBottom: "35px", lineHeight: 1 }}>
        {formatDate(entry.checkedAt)}
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
        <img
          src={`/${entry.riskScore}score.svg`}
          alt={`Risk Score ${entry.riskScore}`}
          style={{ width: "80px", height: "60px", flexShrink: 0 }}
        />
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
            <div style={{ fontSize: "14px", fontWeight: 400, color: "var(--text-grey-white)" }}>{formatDate(entry.checkedAt)}</div>
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 400, opacity: 0.7, color: "var(--text-grey-white)", marginBottom: "7px" }}>Confidence:</div>
            <div style={{ fontSize: "14px", fontWeight: 400, color: "var(--text-grey-white)" }}>{formatTitle(entry.decisionConfidence)}</div>
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 400, opacity: 0.7, color: "var(--text-grey-white)", marginBottom: "7px" }}>Decision Basis:</div>
            <div style={{ fontSize: "14px", fontWeight: 400, color: "var(--text-grey-white)" }}>{entry.decisionBasis || "N/A"}</div>
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 400, opacity: 0.7, color: "var(--text-grey-white)", marginBottom: "7px" }}>Ruleset:</div>
            <div style={{ fontSize: "14px", fontWeight: 400, color: "var(--text-grey-white)" }}>{entry.rulesetVersion}</div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: "right", fontSize: "12px", color: "var(--textGrey)", marginBottom: "20px" }}>
        Intelligence Sources Updated: Jan 14, 2026
      </div>

      <div style={{ fontWeight: 700, fontSize: "18px", color: "var(--textWhite)", marginBottom: "20px", paddingTop: "20px" }}>
        Decision Rationale
      </div>
      <div style={{ borderTop: "1px solid var(--input-field-border)", marginBottom: "20px" }} />

      <div style={{ fontWeight: 500, fontSize: "15px", color: "var(--text-grey-white)", marginTop: "28px", marginBottom: "15px" }}>
        Blacklist &amp; Sanctions Intelligence
      </div>
      <div style={{ borderTop: "1px solid var(--input-field-blue)" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--input-field-blue)", marginBottom: "10px", padding: "10px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-grey-white)", fontSize: "14px", fontWeight: 400 }}>
          Direct Match with Known Blacklists <InfoIcon />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-grey-white)", fontSize: "13px" }}>
          {directMatchText(entry)}
          <StatusIcon type={directMatchText(entry) === "No direct matches" ? "good" : "bad"} />
        </div>
      </div>

      <div style={{ fontWeight: 500, fontSize: "15px", color: "var(--text-grey-white)", marginTop: "28px", marginBottom: "15px" }}>
        Transactional Patterns
      </div>
      <div style={{ borderTop: "1px solid var(--input-field-blue)" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--input-field-blue)", marginBottom: "10px", padding: "10px 0" }}>
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--input-field-blue)", marginBottom: "10px", padding: "10px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-grey-white)", fontSize: "14px", fontWeight: 400 }}>
          Wallet Age <InfoIcon />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-grey-white)", fontSize: "13px" }}>
          {walletAge(entry.riskFactors)}
          <StatusIcon type={walletAge(entry.riskFactors).includes("more than 7") ? "good" : "warn"} />
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--input-field-blue)", marginBottom: "10px", padding: "10px 0" }}>
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
      <div style={{ fontSize: "13px", color: "var(--text-grey-white)", lineHeight: 1.5, paddingTop: "10px" }}>
        {entry.auditSummary}
      </div>
    </>
  );
}
