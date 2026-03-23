import { useEffect, useState } from "react";
import { API_BASE_URL } from "../utils/auth";
import BarChart from "./BarChart";
import PageHeader from "./PageHeader";
import PageLayout from "./PageLayout";
import Statistic from "./Statistic";

interface DashboardData {
  apiMetrics: {
    totalApiRequests: number;
    successRate: number;
    avgLatency: number;
    apiReqLastSevenDays: { date: string; numReq: number }[];
  };
  walletMetrics: {
    totalWalletScores: number;
    totalAllow: number;
    totalReview: number;
    totalEscalate: number;
    numUniqueWallets: number;
    directSanctionsMatches: number;
    directEnforcementMatches: number;
  };
}

function formatNumber(n: number): string {
  return n.toLocaleString();
}

function pct(part: number, total: number): number {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

function getMonthRange(): string {
  const now = new Date();
  const month = now.toLocaleString("default", { month: "long" });
  const year = now.getFullYear();
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
  return `${month} 1 to ${month} ${lastDay}`;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/backend/dashboard`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        return res.json();
      })
      .then(setData)
      .catch((err) => console.error(err));
  }, []);

  const api = data?.apiMetrics;
  const wallet = data?.walletMetrics;
  const monthRange = getMonthRange();

  const allowPct = wallet ? pct(wallet.totalAllow, wallet.totalWalletScores) : 0;
  const reviewPct = wallet ? pct(wallet.totalReview, wallet.totalWalletScores) : 0;
  const escalatePct = wallet ? pct(wallet.totalEscalate, wallet.totalWalletScores) : 0;

  return (
    <>
      <div>
        <title>Dashboard</title>
        <meta name="description" content="Dashboard" />
        <link rel="icon" href="/visarynIcon.svg" type="image/svg+xml" />
      </div>
      <PageLayout>
        <PageHeader pageTitle="Dashboard" />
        <div
          style={{
            paddingTop: "28px",
            paddingRight: "64px",
            paddingBottom: "26px",
            paddingLeft: "64px",
          }}
        >
          {/* Risk Activity */}
          <div
            style={{
              backgroundColor: "var(--dark-blue)",
              borderRadius: "4px",
              padding: "24px 26px",
              marginBottom: "24px",
              height:"168px"
            }}
          >
            {/* Header row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "40px",
              }}
            >
              <div
                style={{
                  fontFamily: '"Hero New", sans-serif',
                  fontWeight: 700,
                  fontSize: "18px",
                  lineHeight: "100%",
                  color: "var(--textWhite)",
                }}
              >
                Risk Activity
              </div>
              <div
                style={{
                  fontFamily: '"Hero New", sans-serif',
                  fontSize: "14px",
                  color: "var(--textGrey)",
                }}
              >
                {monthRange}
              </div>
            </div>

            {/* Stats row */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Statistic
                icon="/walletBlue.svg"
                title="Unique Wallets Screened"
                value={wallet ? formatNumber(wallet.numUniqueWallets) : "--"}
              />
              <Statistic
                icon="/blueFlagIcon.svg"
                title="Direct Sanctions Matches"
                value={wallet ? formatNumber(wallet.directSanctionsMatches) : "--"}
              />
              <Statistic
                icon="/blueShieldIcon.svg"
                title="Direct Enforcement Matches"
                value={wallet ? formatNumber(wallet.directEnforcementMatches) : "--"}
              />
            </div>
          </div>

          {/* Decision Outcomes */}
          <div
            style={{
              backgroundColor: "var(--dark-blue)",
              borderRadius: "4px",
              padding: "24px 26px",
              marginBottom: "24px",
              height:"252px"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "40px",
              }}
            >
              <div
                style={{
                  fontFamily: '"Hero New", sans-serif',
                  fontWeight: 700,
                  fontSize: "18px",
                  lineHeight: "100%",
                  letterSpacing: "0%",
                  color: "var(--textWhite)",
                }}
              >
                Decision Outcomes
              </div>
              <div
                style={{
                  fontFamily: '"Hero New", sans-serif',
                  fontSize: "14px",
                  color: "var(--textGrey)",
                }}
              >
                {monthRange}
              </div>
            </div>

            {/* Segmented Bar */}
            <div
              style={{
                display: "flex",
                width: "100%",
                height: "32px",
                borderRadius: "4px",
                overflow: "hidden",
                gap: "2px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  width: `${allowPct}%`,
                  backgroundColor: "#4CAF50",
                  height: "100%",
                  borderRadius: "4px",
                }}
              />
              <div
                style={{
                  width: `${reviewPct}%`,
                  backgroundColor: "#F0C846",
                  height: "100%",
                  borderRadius: "4px",
                }}
              />
              <div
                style={{
                  width: `${escalatePct}%`,
                  backgroundColor: "#E57373",
                  height: "100%",
                  borderRadius: "4px",
                }}
              />
            </div>

            {/* Statistics Row */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Statistic
                icon="/allowIcon.svg"
                title="Allow"
                value={wallet ? <>{formatNumber(wallet.totalAllow)} <span style={{ fontSize: "18px" }}>({allowPct}%)</span></> : "--"}
              />
              <Statistic
                icon="/reviewIcon.svg"
                title="Review"
                value={wallet ? <>{formatNumber(wallet.totalReview)} <span style={{ fontSize: "18px" }}>({reviewPct}%)</span></> : "--"}
              />
              <Statistic
                icon="/escalateIcon.svg"
                title="Escalate"
                value={wallet ? <>{formatNumber(wallet.totalEscalate)} <span style={{ fontSize: "18px" }}>({escalatePct}%)</span></> : "--"}
              />
            </div>
          </div>

          <div
            style={{
              backgroundColor: "var(--dark-blue)",
              borderRadius: "4px",
              padding: "24px 26px",
              height:"168px"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "40px",
              }}
            >
              <div
                style={{
                  fontFamily: '"Hero New", sans-serif',
                  fontWeight: 700,
                  fontSize: "18px",
                  lineHeight: "100%",
                  letterSpacing: "0%",
                  color: "var(--textWhite)",
                }}
              >
                System Health
              </div>
              <div
                style={{
                  fontFamily: '"Hero New", sans-serif',
                  fontSize: "14px",
                  color: "var(--textGrey)",
                }}
              >
                {monthRange}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
          <Statistic
            icon="/trendlineUp.svg"
            title="API Requests"
            value={api ? formatNumber(api.totalApiRequests) : "--"} iconWidth="24px"
            iconHeight="18px"
          />
          <Statistic
            icon="/blueCheck.svg"
            title="Success Rate"
            value={api ? `${(api.successRate * 100).toFixed(1)}%` : "--"}
            iconWidth="24px"
            iconHeight="18px"
          />
          <Statistic
            icon="/clock.svg"
            title="Avg. Latency"
            value={api ? `${Math.round(api.avgLatency)}ms` : "--"} iconWidth="24px"
            iconHeight="18px"
          />
            </div>
          </div>
        </div>
        <div
          style={{
            paddingLeft: "64px",
            paddingRight: "64px",
            paddingBottom: "48px",
          }}
        >
          <BarChart
            data={
              api
                ? api.apiReqLastSevenDays.map((d) => ({
                    key: d.date,
                    value: d.numReq,
                  }))
                : []
            }
            title="API Requests - Last 7 Days"
          />

        </div>
      </PageLayout>
    </>
  );
}
