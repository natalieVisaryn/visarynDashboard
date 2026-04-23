import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL } from "../utils/auth";
import DecisionRationale from "./DecisionRationale";
import {
  type WalletScoreDetail,
  riskScoreColors,
  formatDate,
  formatRiskLevelLabel,
  formatTitle,
  getComputedDecisionBasis,
} from "./screeningUtils";
import { useUser } from "../context/userContext";

interface Props {
  screeningId: string;
  onBack: () => void;
}

export default function ScreeningHistoryDetail({ screeningId, onBack }: Props) {
  const { isAdmin, isLoading: userAuthLoading } = useUser();
  const [entry, setEntry] = useState<WalletScoreDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoader, setShowLoader] = useState(false);

  const fetchEntry = useCallback(async () => {
    if (userAuthLoading) return;
    const detailPath = isAdmin
      ? `/backend/getAdminWalletScoreDetails/${screeningId}`
      : `/backend/getWalletScoreDetails/${screeningId}`;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}${detailPath}`, {
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
  }, [screeningId, isAdmin, userAuthLoading]);

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

      {isAdmin && (
        <div style={{ paddingBottom: "20px" }}>
          <div
            style={{
              fontSize: "12px",
              color: "var(--textGrey)",
              marginBottom: "6px",
            }}
          >
            Screened by
          </div>
          <span style={{ fontSize: "13px", fontWeight: 300, color: "var(--textWhite)"}}>
            {entry.orgName ?? "—"}
          </span>
        </div>
      )}

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
            {formatRiskLevelLabel(entry.riskScore, entry.riskLevel)} Risk detected
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
            <div style={{ fontSize: "14px", fontWeight: 400, color: "var(--text-grey-white)" }}>{getComputedDecisionBasis(entry.riskFactors, entry.decisionConfidence)}</div>
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

      <DecisionRationale riskFactors={entry.riskFactors} />

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
