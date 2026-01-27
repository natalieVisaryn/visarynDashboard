import BarChart from "./BarChart";
import Blurb from "./Blurb";
import PageHeader from "./PageHeader";
import PageLayout from "./PageLayout";
import Statistic from "./Statistic";


export default function Dashboard() {
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
            display: "flex",
            flexDirection: "row",
            paddingTop: "64px",
            paddingRight: "64px",
            paddingBottom: "48px",
            paddingLeft: "64px",
            gap: "50px",
          }}
        >
          <Statistic
            icon="/pulse.svg"
            title="Total API Requests"
            value="12,458"
            subtext={
              <div style={{ display: "flex", flexDirection: "row" }}>
                <div style={{ color: "green", paddingRight: "0.25em" }}>
                  +12.5%
                </div>{" "}
                vs prior month
              </div>
            }
          />
          <Statistic
            icon="/trendline.svg"
            title="Requests this Month"
            value="3,421"
            subtext="+12.5% vs prior month"
          />
          <Statistic
            icon="/blueCheck.svg"
            title="Success Rate"
            value="99.2%"
            subtext="+12.5% vs prior month"
          />
          <Statistic
            icon="/clock.svg"
            title="Avg. Latency"
            value="245ms"
            subtext="+12.5% vs prior month"
          />
        </div>
        <div
          style={{
            paddingLeft: "64px",
            paddingRight: "64px",
            paddingBottom: "48px",
          }}
        >
          <BarChart
            data={[
              { key: "JAN 1", value: 300 },
              { key: "JAN 2", value: 500 },
              { key: "JAN 3", value: 650 },
              { key: "JAN 4", value: 450 },
              { key: "JAN 5", value: 400 },
              { key: "JAN 6", value: 475 },
            ]}
            title="API Requests - Last 7 Days"
          />
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              width: "1072px",
              justifyContent: "space-between",
              paddingTop: "20px",
            }}
          >
            <Blurb
              title="API Requests - Last 7 Days"
              paragraph="Currently monitoring 6 authoritative sources: OFAC, FinCEN, EU, UN, UK HMT, and DOJ enforcement actions."
              subtext="Data refreshed 2-4x per week for maximum accuracy"
            />
            <Blurb
              title="Supported Networks"
              paragraph="Bitcoin (BTC) and Ethereum (ETH) networks with <1s average screening time."
              subtext="Additional chains coming in future phases"
            />
          </div>
        </div>
      </PageLayout>
    </>
  );
}
