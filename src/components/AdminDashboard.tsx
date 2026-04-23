import { useEffect, useState } from "react";
import { API_BASE_URL } from "../utils/auth";
import PageHeader from "./PageHeader";
import PageLayout from "./PageLayout";
import Statistic from "./Statistic";

/** Response from GET /backend/getAdminDashboard */
interface AdminDashboardData {
  month: { start: string; end: string };
  api: {
    totalRequests: number;
    avgLatencyMs: number;
    successRate: number;
  };
  organizationCount: number;
  activeOrganizationCount: number;
  walletScoresRiskGte7ThisMonth: number;
  topOrgsByRequests: {
    orgName: string;
    totalRequests: number;
    avgLatencyMs: number;
  }[];
}

const FAKE_BLACKLIST_AND_PIPELINE = {
  blacklistIngestion: [
    { source: "OFAC (US)", added: 3, updated: 8, status: "success" as const },
    { source: "EU Sanctions", added: 3, updated: 8, status: "success" as const },
    { source: "U.K. HMT Financial Sanctions", added: 3, updated: 8, status: "success" as const },
    { source: "DOJ Cryptocurrency Enforcement Actions", added: 0, updated: 0, status: "failed" as const },
  ],
};

/** Placeholder until ingestion metrics are wired to the API */
const INGESTION_SUCCESSFUL = 4;
const INGESTION_FAILED = 1;

function formatApiMonthRange(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const month = start.toLocaleString("default", { month: "long" });
  const year = start.getFullYear();
  return `${month} ${start.getDate()} to ${month} ${end.getDate()}, ${year}`;
}

function formatLastUpdatedAt(): string {
  return new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  });
}

const pageHorizontalPadding = "60px";

const cardStyle: React.CSSProperties = {
  backgroundColor: "var(--dark-blue)",
  borderRadius: "12px",
  padding: "24px",
  width: "100%",
  maxWidth: "100%",
  boxSizing: "border-box",
};

const twoColumnCardStyle: React.CSSProperties = {
  ...cardStyle,
  minWidth: 0,
};

const cardHeaderStyle: React.CSSProperties = {
  fontFamily: '"Hero New", sans-serif',
  fontWeight: 700,
  fontSize: "18px",
  lineHeight: "100%",
  color: "var(--textWhite)",
};

const dateRangeStyle: React.CSSProperties = {
  fontFamily: '"Hero New", sans-serif',
  fontSize: "14px",
  color: "var(--textGrey)",
};

function StatusBadge({ status }: { status: "success" | "failed" }) {
  const isSuccess = status === "success";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 12px",
        borderRadius: "20px",
        fontSize: "13px",
        fontWeight: 500,
        backgroundColor: isSuccess ? "rgba(76, 175, 80, 0.15)" : "rgba(229, 57, 53, 0.15)",
        color: isSuccess ? "#4CAF50" : "#E53935",
      }}
    >
      <span
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          backgroundColor: isSuccess ? "#4CAF50" : "#E53935",
        }}
      />
      {isSuccess ? "Success" : "Failed"}
    </span>
  );
}

function RankCircle({ rank }: { rank: number }) {
  return (
    <div
      style={{
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        backgroundColor: "var(--input-field-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--textWhite)",
        fontSize: "14px",
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      {rank}
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const d = FAKE_BLACKLIST_AND_PIPELINE;

  useEffect(() => {
    fetch(`${API_BASE_URL}/backend/getAdminDashboard`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch admin dashboard data");
        return res.json();
      })
      .then((json: AdminDashboardData) => {
        setData(json);
        setLastUpdated(formatLastUpdatedAt());
      })
      .catch((err) => console.error(err));
  }, []);

  const dateRangeLabel =
    data != null ? formatApiMonthRange(data.month.start, data.month.end) : "--";

  const api = data?.api;

  return (
    <>
      <div>
        <title>Admin Dashboard</title>
        <meta name="description" content="Admin Dashboard" />
        <link rel="icon" href="/visarynIcon.svg" type="image/svg+xml" />
      </div>
      <PageLayout>
        <PageHeader pageTitle="Admin Dashboard" />
        <div
          style={{
            boxSizing: "border-box",
            width: "100%",
            maxWidth: "100%",
            paddingTop: "28px",
            paddingRight: pageHorizontalPadding,
            paddingBottom: "6px",
            paddingLeft: pageHorizontalPadding,
          }}
        >
          {/* Risk Activity */}
          <div style={{ ...cardStyle, marginBottom: "24px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <div style={cardHeaderStyle}>Risk Activity</div>
              <div style={dateRangeStyle}>{dateRangeLabel}</div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                gap: "80px",
              }}
            >
              <Statistic
                icon="/trendlineUp.svg"
                title="Customer API Requests"
                value={api != null ? api.totalRequests.toLocaleString() : "--"}
              />
              <Statistic
                icon="/clock.svg"
                title="Average Latency"
                value={api != null ? `${Math.round(api.avgLatencyMs)}ms` : "--"}
              />
              <Statistic
                icon="/peopleBlue.svg"
                title="Active Customers"
                value={data != null ? String(data.activeOrganizationCount) : "--"}
              />
              <Statistic
                icon="/warningBlue.svg"
                title="High Risk Wallets"
                value={data != null ? String(data.walletScoresRiskGte7ThisMonth) : "--"}
              />
            </div>
          </div>

          {/* Two-column: Blacklist Ingestion + Top Customers */}
          <div
            style={{
              display: "flex",
              gap: "24px",
              marginBottom: "24px",
              width: "100%",
              maxWidth: "100%",
              boxSizing: "border-box",
            }}
          >
            {/* Blacklist Ingestion Status */}
            <div style={{ ...twoColumnCardStyle, flex: 1 }}>
              <div style={{ ...cardHeaderStyle, marginBottom: "24px" }}>
                Blacklist Ingestion Status
              </div>

              {/* Table Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingBottom: "12px",
                  borderBottom: "1px solid var(--input-field-blue)",
                  marginBottom: "4px",
                }}
              >
                <span style={{ color: "var(--text-grey-white)", fontSize: "13px", fontWeight: 700 }}>
                  Source
                </span>
                <span style={{ color: "var(--text-grey-white)", fontSize: "13px", fontWeight: 700 }}>
                  Status
                </span>
              </div>

              {/* Table Rows */}
              {d.blacklistIngestion.map((row, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "14px 0",
                    borderBottom:
                      i < d.blacklistIngestion.length - 1
                        ? "1px solid var(--input-field-blue)"
                        : "none",
                  }}
                >
                  <div>
                    <div
                      style={{
                        color: "var(--textWhite)",
                        fontSize: "14px",
                        fontWeight: 500,
                        marginBottom: "4px",
                      }}
                    >
                      {row.source}
                    </div>
                    <div style={{ color: "var(--textGrey)", fontSize: "13px" }}>
                      {row.added} added, {row.updated} updated
                    </div>
                  </div>
                  <StatusBadge status={row.status} />
                </div>
              ))}
            </div>

            {/* Top 5 Customers by API Usage */}
            <div style={{ ...twoColumnCardStyle, flex: 1 }}>
              <div style={{ ...cardHeaderStyle, marginBottom: "24px" }}>
                Top 5 Customers by API Usage
              </div>

              {/* Table Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingBottom: "12px",
                  borderBottom: "1px solid var(--input-field-blue)",
                  marginBottom: "4px",
                }}
              >
                <span style={{ color: "var(--text-grey-white)", fontSize: "13px", fontWeight: 700 }}>
                  Customer
                </span>
                <span style={{ color: "var(--text-grey-white)", fontSize: "13px", fontWeight: 700 }}>
                  Requests
                </span>
              </div>

              {/* Customer Rows */}
              {(data?.topOrgsByRequests ?? []).map((org, i, arr) => (
                <div
                  key={`${org.orgName}-${i}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 0",
                    borderBottom: i < arr.length - 1 ? "1px solid var(--input-field-blue)" : "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <RankCircle rank={i + 1} />
                    <div>
                      <div
                        style={{
                          color: "var(--textWhite)",
                          fontSize: "14px",
                          fontWeight: 500,
                          marginBottom: "2px",
                        }}
                      >
                        {org.orgName}
                      </div>
                      <div style={{ color: "var(--textGrey)", fontSize: "13px" }}>
                        Avg: {Math.round(org.avgLatencyMs)}ms
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      color: "var(--textWhite)",
                      fontSize: "14px",
                      fontWeight: 500,
                    }}
                  >
                    {org.totalRequests.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Health */}
          <div style={{ ...cardStyle, marginBottom: "24px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <div style={cardHeaderStyle}>System Health</div>
              <div style={dateRangeStyle}>{dateRangeLabel}</div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "32px 48px",
              }}
            >
              {[
                {
                  icon: "/greenCircleWithCheck.svg",
                  label: "Successful Ingestion",
                  value: String(INGESTION_SUCCESSFUL),
                },
                {
                  icon: "/redCircleWithX.svg",
                  label: "Failed Ingestion",
                  value: String(INGESTION_FAILED),
                },
                {
                  icon: "/trendlineUp.svg",
                  label: "API Success Rate",
                  value: api != null ? `${(api.successRate * 100).toFixed(1)}%` : "--",
                },
              ].map((col) => (
                <div
                  key={col.label}
                  style={{
                    flex: "1 1 180px",
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <img
                      src={col.icon}
                      alt=""
                      style={{ width: "22px", height: "22px", flexShrink: 0 }}
                    />
                    <span
                      style={{
                        color: "var(--textWhite)",
                        fontFamily: '"Hero New", sans-serif',
                        fontSize: "15px",
                        fontWeight: 500,
                        lineHeight: "120%",
                      }}
                    >
                      {col.label}
                    </span>
                  </div>
                  <div
                    style={{
                      color: "var(--textWhite)",
                      fontFamily: '"Hero New", sans-serif',
                      fontSize: "28px",
                      fontWeight: 700,
                      lineHeight: "110%",
                    }}
                  >
                    {col.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div
          style={{
            boxSizing: "border-box",
            width: "100%",
            maxWidth: "100%",
            paddingLeft: pageHorizontalPadding,
            paddingRight: pageHorizontalPadding,
            paddingBottom: "48px",
          }}
        >

          <div style={{ color: "var(--textGrey)", fontSize: "13px" }}>
            Data Last Updated: {lastUpdated || "--"}
          </div>
        </div>
      </PageLayout>
    </>
  );
}
