import { useEffect, useState } from "react";
import { API_BASE_URL } from "../utils/auth";
import PageHeader from "./PageHeader";
import PageLayout from "./PageLayout";
import Statistic from "./Statistic";

const cardStyle: React.CSSProperties = {
  backgroundColor: "var(--dark-blue)",
  borderRadius: "12px",
  padding: "24px",
};

const cardHeaderStyle: React.CSSProperties = {
  fontFamily: '"Hero New", sans-serif',
  fontWeight: 700,
  fontSize: "18px",
  lineHeight: "100%",
  color: "var(--textWhite)",
};

type TimeWindow = "MONTH" | "WEEK" | "DAY";

/** Response from GET /backend/adminApiUsage */
interface AdminApiUsageResponse {
  timeWindow: TimeWindow;
  period: { start: string; end: string };
  summary: {
    totalRequests: number;
    successRate: number;
    averageLatencyMs: number;
    totalFailedRequests: number;
  };
  byOrganization: Record<
    string,
    {
      orgName: string;
      readableId: string;
      totalRequestsInPeriod: number;
      successRateInPeriod: number;
      failedInPeriod: number;
      avgLatencyInPeriod: number;
      lastRequestInPeriod: string | null;
    }
  >;
}

function toNumber(v: unknown, fallback = 0): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

/** Map raw JSON into typed shape for stats + table */
function mapAdminApiUsageResponse(raw: Record<string, unknown>): AdminApiUsageResponse | null {
  const tw = raw.timeWindow;
  if (tw !== "MONTH" && tw !== "WEEK" && tw !== "DAY") return null;

  const periodRaw = raw.period;
  if (!periodRaw || typeof periodRaw !== "object") return null;
  const period = periodRaw as Record<string, unknown>;
  if (typeof period.start !== "string" || typeof period.end !== "string") return null;

  const summaryRaw = raw.summary;
  if (!summaryRaw || typeof summaryRaw !== "object") return null;
  const s = summaryRaw as Record<string, unknown>;
  const summary = {
    totalRequests: Math.trunc(toNumber(s.totalRequests)),
    successRate: toNumber(s.successRate),
    averageLatencyMs: toNumber(s.averageLatencyMs),
    totalFailedRequests: Math.trunc(toNumber(s.totalFailedRequests)),
  };

  const byOrganization: AdminApiUsageResponse["byOrganization"] = {};
  const orgRaw = raw.byOrganization;
  if (orgRaw && typeof orgRaw === "object" && !Array.isArray(orgRaw)) {
    for (const [orgId, rowRaw] of Object.entries(orgRaw)) {
      if (!rowRaw || typeof rowRaw !== "object") continue;
      const r = rowRaw as Record<string, unknown>;
      const last = r.lastRequestInPeriod;
      byOrganization[orgId] = {
        orgName: typeof r.orgName === "string" ? r.orgName : String(r.orgName ?? ""),
        readableId:
          typeof r.readableId === "string" ? r.readableId : String(r.readableId ?? ""),
        totalRequestsInPeriod: Math.trunc(toNumber(r.totalRequestsInPeriod)),
        successRateInPeriod: toNumber(r.successRateInPeriod),
        failedInPeriod: Math.trunc(toNumber(r.failedInPeriod)),
        avgLatencyInPeriod: toNumber(r.avgLatencyInPeriod),
        lastRequestInPeriod:
          last === null || last === undefined
            ? null
            : typeof last === "string"
              ? last
              : null,
      };
    }
  }

  return {
    timeWindow: tw,
    period: { start: period.start, end: period.end },
    summary,
    byOrganization,
  };
}

function formatLastRequest(d: Date): string {
  return `${d.toLocaleDateString("en-US")} at ${d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  })}`;
}

const tableHeaderCell: React.CSSProperties = {
  color: "var(--text-grey-white)",
  fontSize: "13px",
  fontWeight: 700,
};

const tableCell: React.CSSProperties = {
  color: "var(--textWhite)",
  fontSize: "14px",
  fontWeight: 500,
};

const tableCellMuted: React.CSSProperties = {
  color: "var(--textGrey)",
  fontSize: "13px",
};

const gridCols =
  "minmax(160px, 1.4fr) minmax(100px, 1fr) minmax(90px, 0.9fr) minmax(72px, 0.7fr) minmax(88px, 0.85fr) minmax(160px, 1.2fr)";

export default function AdminApiUsage() {
  const [viewRange, setViewRange] = useState<TimeWindow>("WEEK");
  const [data, setData] = useState<AdminApiUsageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      await Promise.resolve();
      if (cancelled) return;
      setLoading(true);
      setError(null);
      setData(null);

      const params = new URLSearchParams({ timeWindow: viewRange });
      try {
        const res = await fetch(`${API_BASE_URL}/backend/adminApiUsage?${params}`, {
          credentials: "include",
        });
        const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
        if (!res.ok) {
          const msg =
            typeof json.error === "string"
              ? json.error
              : `Failed to load API usage (${res.status})`;
          throw new Error(msg);
        }
        const mapped = mapAdminApiUsageResponse(json);
        if (mapped == null) {
          throw new Error("Invalid API usage response");
        }
        if (!cancelled) {
          setData(mapped);
        }
      } catch (err: unknown) {
        console.error(err);
        if (!cancelled) {
          setData(null);
          setError(err instanceof Error ? err.message : "Failed to load API usage");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [viewRange]);

  const orgEntries = data ? Object.entries(data.byOrganization) : [];
  const n = orgEntries.length;

  const summaryTotal =
    data == null ? "--" : data.summary.totalRequests.toLocaleString();
  const summarySuccess =
    data == null ? "--" : `${(data.summary.successRate * 100).toFixed(1)}%`;
  const summaryLatency =
    data == null ? "--" : `${Math.round(data.summary.averageLatencyMs)}ms`;
  const summaryFailed =
    data == null ? "--" : data.summary.totalFailedRequests.toLocaleString();

  return (
    <>
      <div>
        <title>API Usage</title>
        <meta name="description" content="API Usage" />
        <link rel="icon" href="/visarynIcon.svg" type="image/svg+xml" />
      </div>
      <PageLayout>
        <PageHeader pageTitle="API Usage" />
        <div
          style={{
            paddingTop: "28px",
            paddingRight: "64px",
            paddingBottom: "48px",
            paddingLeft: "64px",
          }}
        >
          {error != null && (
            <div
              style={{
                marginBottom: "16px",
                fontFamily: '"Hero New", sans-serif',
                fontSize: "14px",
                color: "#E53935",
              }}
            >
              {error}
            </div>
          )}

          <div style={{ ...cardStyle, marginBottom: "24px" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                gap: "48px 80px",
                alignItems: "flex-start",
              }}
            >
              <Statistic
                icon="/trendlineUp.svg"
                title="Total Requests"
                value={summaryTotal}
              />
              <Statistic
                icon="/greenCircleWithCheck.svg"
                title="Success Rate"
                value={summarySuccess}
              />
              <Statistic
                icon="/clock.svg"
                title="Avg Latency"
                value={summaryLatency}
              />
              <Statistic
                icon="/redHexX.svg"
                title="Failed Requests"
                value={summaryFailed}
              />
            </div>
          </div>

          <div style={cardStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                flexWrap: "wrap",
                gap: "16px",
              }}
            >
              <div style={cardHeaderStyle}>Customer Breakdown</div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span
                  style={{
                    fontFamily: '"Hero New", sans-serif',
                    fontSize: "14px",
                    color: "var(--textGrey)",
                  }}
                >
                  View
                </span>
                <select
                  value={viewRange}
                  onChange={(e) => setViewRange(e.target.value as TimeWindow)}
                  style={{
                    fontFamily: '"Hero New", sans-serif',
                    fontSize: "14px",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--input-field-blue)",
                    backgroundColor: "var(--very-dark-blue)",
                    color: "var(--textWhite)",
                    cursor: "pointer",
                    minWidth: "140px",
                  }}
                >
                  <option value="WEEK">This Week</option>
                  <option value="MONTH">This Month</option>
                  <option value="DAY">Today</option>
                </select>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: gridCols,
                columnGap: "12px",
                rowGap: "0",
                paddingBottom: "12px",
                borderBottom: "1px solid var(--input-field-blue)",
                marginBottom: "4px",
              }}
            >
              <span style={tableHeaderCell}>Customer</span>
              <span style={tableHeaderCell}>Total Requests</span>
              <span style={tableHeaderCell}>Success Rate</span>
              <span style={tableHeaderCell}>Failed</span>
              <span style={tableHeaderCell}>Avg Latency</span>
              <span style={tableHeaderCell}>Last Request</span>
            </div>

            {loading && data == null && error == null ? (
              <div
                style={{
                  ...tableCellMuted,
                  padding: "20px 0",
                  fontFamily: '"Hero New", sans-serif',
                }}
              >
                Loading…
              </div>
            ) : error != null && data == null ? (
              <div
                style={{
                  ...tableCellMuted,
                  padding: "20px 0",
                  fontFamily: '"Hero New", sans-serif',
                }}
              >
                Unable to load customer breakdown.
              </div>
            ) : orgEntries.length === 0 ? (
              <div
                style={{
                  ...tableCellMuted,
                  padding: "20px 0",
                  fontFamily: '"Hero New", sans-serif',
                }}
              >
                No usage in this period.
              </div>
            ) : (
              orgEntries.map(([orgId, row], i) => (
                <div
                  key={orgId}
                  style={{
                    display: "grid",
                    gridTemplateColumns: gridCols,
                    columnGap: "12px",
                    alignItems: "center",
                    padding: "14px 0",
                    borderBottom:
                      i < orgEntries.length - 1 ? "1px solid var(--input-field-blue)" : "none",
                  }}
                >
                  <div>
                    <div style={{ ...tableCell, marginBottom: "10px" }}>{row.orgName}</div>
                    <div style={tableCellMuted}>{row.readableId}</div>
                  </div>
                  <span style={tableCell}>{row.totalRequestsInPeriod.toLocaleString()}</span>
                  <span style={tableCell}>
                    {(row.successRateInPeriod * 100).toFixed(1)}%
                  </span>
                  <span style={tableCell}>{row.failedInPeriod.toLocaleString()}</span>
                  <span style={tableCell}>{Math.round(row.avgLatencyInPeriod)}ms</span>
                  <span style={{ ...tableCell, fontSize: "13px" }}>
                    {row.lastRequestInPeriod
                      ? formatLastRequest(new Date(row.lastRequestInPeriod))
                      : "—"}
                  </span>
                </div>
              ))
            )}

            <div
              style={{
                marginTop: "16px",
                fontFamily: '"Hero New", sans-serif',
                fontSize: "13px",
                color: "var(--textGrey)",
              }}
            >
              {data == null ? "—" : `Showing ${n} of ${n} customers`}
            </div>
          </div>
        </div>
      </PageLayout>
    </>
  );
}
