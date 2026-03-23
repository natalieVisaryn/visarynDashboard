import PageHeader from "./PageHeader";
import PageLayout from "./PageLayout";
import Statistic from "./Statistic";

const FAKE_DATA = {
  riskActivity: {
    apiRequests: 409643,
    avgLatency: 244,
    activeCustomers: 5,
    highRiskWallets: 2,
  },
  blacklistIngestion: [
    { source: "OFAC (US)", added: 3, updated: 8, status: "success" as const },
    { source: "EU Sanctions", added: 3, updated: 8, status: "success" as const },
    { source: "U.K. HMT Financial Sanctions", added: 3, updated: 8, status: "success" as const },
    { source: "DOJ Cryptocurrency Enforcement Actions", added: 0, updated: 0, status: "failed" as const },
  ],
  topCustomers: [
    { name: "Binance", avgLatency: 245, requests: 145789 },
    { name: "Coinbase", avgLatency: 245, requests: 98432 },
    { name: "Kraken", avgLatency: 245, requests: 67891 },
    { name: "Gemini", avgLatency: 245, requests: 54321 },
    { name: "BitGo", avgLatency: 245, requests: 43210 },
  ],
  systemHealth: {
    ingestionSuccessful: 3,
    ingestionFailed: 1,
    apiSuccessRate: 99.2,
    avgResponseTime: 244,
  },
  dateRange: "March 1 to March 31",
  lastUpdated: "Feb 26, 2026 - 03:14 UTC",
};

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
  const d = FAKE_DATA;

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
            paddingTop: "28px",
            paddingRight: "64px",
            paddingBottom: "26px",
            paddingLeft: "64px",
          }}
        >
          {/* Risk Activity */}
          <div style={{ ...cardStyle, width: "1072px", marginBottom: "24px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <div style={cardHeaderStyle}>Risk Activity</div>
              <div style={dateRangeStyle}>{d.dateRange}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "row", gap: "80px" }}>
              <Statistic
                icon="/trendlineUp.svg"
                title="API Requests"
                value={d.riskActivity.apiRequests.toLocaleString()}
              />
              <Statistic
                icon="/clock.svg"
                title="Average Latency"
                value={`${d.riskActivity.avgLatency}ms`}
              />
              <Statistic
                icon="/peopleBlue.svg"
                title="Active Customers"
                value={String(d.riskActivity.activeCustomers)}
              />
              <Statistic
                icon="/warningBlue.svg"
                title="High Risk Wallets"
                value={String(d.riskActivity.highRiskWallets)}
              />
            </div>
          </div>

          {/* Two-column: Blacklist Ingestion + Top Customers */}
          <div
            style={{
              display: "flex",
              gap: "24px",
              marginBottom: "24px",
              width: "1072px",
            }}
          >
            {/* Blacklist Ingestion Status */}
            <div style={{ ...cardStyle, flex: 1 }}>
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
            <div style={{ ...cardStyle, flex: 1 }}>
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
              {d.topCustomers.map((customer, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 0",
                    borderBottom:
                      i < d.topCustomers.length - 1
                        ? "1px solid var(--input-field-blue)"
                        : "none",
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
                        {customer.name}
                      </div>
                      <div style={{ color: "var(--textGrey)", fontSize: "13px" }}>
                        Avg: {customer.avgLatency}ms
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
                    {customer.requests.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Health */}
          <div style={{ ...cardStyle, width: "1072px", marginBottom: "24px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <div style={cardHeaderStyle}>System Health</div>
              <div style={dateRangeStyle}>{d.dateRange}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "row", gap: "50px" }}>
              <Statistic
                icon="/pipelineBlue.svg"
                title="Ingestion Pipeline"
                value={
                  <>
                    <span style={{ fontSize: "24px", fontWeight: 700 }}>
                      {d.systemHealth.ingestionSuccessful}
                    </span>{" "}
                    <span style={{ fontSize: "14px", color: "var(--textGrey)" }}>successful</span>
                    {"   "}
                    <span style={{ fontSize: "24px", fontWeight: 700 }}>
                      {d.systemHealth.ingestionFailed}
                    </span>{" "}
                    <span style={{ fontSize: "14px", color: "var(--textGrey)" }}>failed</span>
                  </>
                }
              />
              <Statistic
                icon="/trendlineUp.svg"
                title="API Success Rate"
                value={`${d.systemHealth.apiSuccessRate}%`}
              />
              <Statistic
                icon="/clock.svg"
                title="Avg. Response Time"
                value={
                  <>
                    {d.systemHealth.avgResponseTime}ms{" "}
                    <span style={{ fontSize: "14px", color: "var(--textGrey)" }}>
                      (Target &lt; 1000ms)
                    </span>
                  </>
                }
              />
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div
          style={{
            paddingLeft: "64px",
            paddingRight: "64px",
            paddingBottom: "48px",
          }}
        >
          <div style={{ color: "var(--textGrey)", fontSize: "13px", marginBottom: "8px" }}>
            {d.dateRange}
          </div>
          <div style={{ color: "var(--textGrey)", fontSize: "13px" }}>
            Data Last Updated: {d.lastUpdated}
          </div>
        </div>
      </PageLayout>
    </>
  );
}
