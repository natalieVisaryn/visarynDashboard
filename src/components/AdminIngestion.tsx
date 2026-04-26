import { useId, useState } from "react";
import PageHeader from "./PageHeader";
import PageLayout from "./PageLayout";
import Statistic from "./Statistic";

const cardStyle: React.CSSProperties = {
  backgroundColor: "var(--dark-blue)",
  borderRadius: "4px",
  padding: "24px",
};

const cardHeaderStyle: React.CSSProperties = {
  fontFamily: '"Hero New", sans-serif',
  fontWeight: 700,
  fontSize: "18px",
  lineHeight: "100%",
  color: "var(--textWhite)",
};

const tableHeaderCell: React.CSSProperties = {
  color: "var(--text-grey-white)",
  fontSize: "13px",
  fontWeight: 700,
};

const tableCell: React.CSSProperties = {
  color: "var(--textWhite)",
  fontSize: "14px",
  fontWeight: 400,
};

const tableCellMuted: React.CSSProperties = {
  color: "var(--textGrey)",
  fontSize: "13px",
};

const activityGridCols =
  "minmax(140px, 1.5fr) minmax(100px, 1.1fr) minmax(88px, 0.75fr) minmax(64px, 0.55fr) minmax(168px, 1.15fr) minmax(56px, 0.5fr) minmax(48px, 0.45fr)";

const CONFIGURED_SOURCES = [
  {
    name: "EU Consolidated Sanctions",
    ok: true,
    lastRun: "3/15/2026, 1:00:00 AM",
  },
  {
    name: "U.K. HMT Financial Sanctions",
    ok: true,
    lastRun: "3/15/2026, 1:00:00 AM",
  },
  {
    name: "DOJ Enforcement Actions",
    ok: false,
    lastRun: "3/15/2026, 1:00:00 AM",
  },
  {
    name: "OFAC SDN (US)",
    ok: true,
    lastRun: "3/15/2026, 1:00:00 AM",
  },
  {
    name: "OFAC Non SDN (US)",
    ok: true,
    lastRun: "3/15/2026, 1:00:00 AM",
  },
] as const;

type ActivityStatus = "success" | "in_progress" | "failed";

const RECENT_ACTIVITY: {
  source: string;
  status: ActivityStatus;
  processed: number;
  added: number;
  started: string;
  duration: string;
  showDetails: boolean;
}[] = [
  {
    source: "EU Consolidated Sanctions",
    status: "success",
    processed: 1247,
    added: 3,
    started: "3/15/2026 at 1:00:00 AM",
    duration: "135s",
    showDetails: false,
  },
  {
    source: "OFAC SDN (US)",
    status: "in_progress",
    processed: 890,
    added: 0,
    started: "3/15/2026 at 1:15:00 AM",
    duration: "—",
    showDetails: false,
  },
  {
    source: "DOJ Enforcement Actions",
    status: "failed",
    processed: 0,
    added: 0,
    started: "3/15/2026 at 12:30:00 AM",
    duration: "42s",
    showDetails: true,
  },
  {
    source: "U.K. HMT Financial Sanctions",
    status: "success",
    processed: 2103,
    added: 2,
    started: "3/14/2026 at 6:00:00 AM",
    duration: "98s",
    showDetails: false,
  },
  {
    source: "OFAC Non SDN (US)",
    status: "success",
    processed: 456,
    added: 4,
    started: "3/14/2026 at 6:00:00 AM",
    duration: "112s",
    showDetails: false,
  },
];

function SuccessPill() {
  return (
    <img
      src="/successPill.svg"
      alt="Success"
      style={{ height: "24px", width: "auto", display: "block" }}
    />
  );
}

function FailedPill() {
  return (
    <img
      src="/failedPill.svg"
      alt="Failed"
      style={{ height: "24px", width: "auto", display: "block" }}
    />
  );
}

function StatusCell({ status }: { status: ActivityStatus }) {
  if (status === "success") return <SuccessPill />;
  if (status === "failed") return <FailedPill />;
  return (
    <img
      src="/inProgressPill.svg"
      alt="In Progress"
      style={{ height: "24px", width: "auto", display: "block" }}
    />
  );
}

const SCHEDULE_BODY =
  "Sources are refreshed automatically 2-4 times per week. OFAC SDN List: Monday & Thursday at 06:00 UTC. EU & UK Sanctions: Tuesday & Friday at 06:00 UTC. DOJ Enforcement Actions: Weekly on Wednesday at 06:00 UTC.";

const WARNING_TOOLTIP_LINE1 = "HTTP 503: Service temporarily";
const WARNING_TOOLTIP_LINE2 = "unavailable. Will retry in lorem ipsum ...";

const warningIconTooltip: React.CSSProperties = {
  position: "absolute",
  left: "50%",
  transform: "translateX(-50%)",
  bottom: "100%",
  marginBottom: 0,
  zIndex: 20,
  width: "300px",
  height: "72px",
  padding: "12px 14px",
  borderRadius: 6,
  backgroundColor: "#7B0000",
  color: "#FFFFFF",
  fontFamily: '"Hero New", sans-serif',
  fontSize: "13px",
  fontWeight: 500,
  lineHeight: 1.45,
  textAlign: "left",
  boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  boxSizing: "border-box",
};

function WarningMessageWithTooltip() {
  const [visible, setVisible] = useState(false);
  const tooltipId = useId();
  return (
    <span
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        paddingTop: 6,
        marginTop: -6,
        cursor: "default",
      }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <img
        src="/warningMessage.svg"
        alt="Error details"
        width={18}
        height={18}
        style={{ display: "block" }}
        aria-describedby={visible ? tooltipId : undefined}
      />
      {visible ? (
        <div id={tooltipId} role="tooltip" style={warningIconTooltip}>
          <div>{WARNING_TOOLTIP_LINE1}</div>
          <div>{WARNING_TOOLTIP_LINE2}</div>
        </div>
      ) : null}
    </span>
  );
}

export default function AdminIngestion() {
  const n = RECENT_ACTIVITY.length;

  return (
    <>
      <div>
        <title>Ingestion</title>
        <meta name="description" content="Ingestion" />
        <link rel="icon" href="/visarynIcon.svg" type="image/svg+xml" />
      </div>
      <PageLayout>
        <PageHeader pageTitle="Ingestion" />
        <div
          style={{
            paddingTop: "28px",
            paddingRight: "64px",
            paddingBottom: "48px",
            paddingLeft: "64px",
          }}
        >
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
              <Statistic icon="/blueCircleWithCheck.svg" title="Successful" value={3} />
              <Statistic icon="/redCircleWithX.svg" title="Failed" value={1} />
              <Statistic icon="/clock.svg" title="In Progress" value={1} />
              <Statistic icon="/reload.svg" title="Total Records Added" value={9} />
            </div>
          </div>

          <div style={{ ...cardStyle, marginBottom: "24px" }}>
            <div style={{ ...cardHeaderStyle, marginBottom: "40px" }}>Configured Sources</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "40px 20px",
              }}
            >
              {CONFIGURED_SOURCES.map((s) => (
                <div
                  key={s.name}
                  style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "flex-start",
                    minWidth: 0,
                  }}
                >
                  <img
                    src={s.ok ? "/lightGreenCircleWithCheck.svg" : "/redCircleWithX.svg"}
                    alt=""
                    width={22}
                    height={22}
                    style={{ flexShrink: 0, marginTop: "2px" }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ ...tableCell, marginBottom: "8px" }}>{s.name}</div>
                    <div style={tableCellMuted}>Last run {s.lastRun}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...cardStyle, marginBottom: "24px" }}>
            <div style={{ ...cardHeaderStyle, marginBottom: "42px" }}>
              Recent Ingestion Activity
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: activityGridCols,
                columnGap: "12px",
                rowGap: "0",
                paddingBottom: "12px",
                borderBottom: "1px solid var(--input-field-blue)",
                marginBottom: "4px",
              }}
            >
              <span style={tableHeaderCell}>Source</span>
              <span style={tableHeaderCell}>Status</span>
              <span style={tableHeaderCell}>Processed</span>
              <span style={tableHeaderCell}>Added</span>
              <span style={tableHeaderCell}>Started</span>
              <span style={tableHeaderCell}>Duration</span>
              <span style={tableHeaderCell}>Details</span>
            </div>

            {RECENT_ACTIVITY.map((row, i) => (
              <div
                key={`${row.source}-${row.started}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: activityGridCols,
                  columnGap: "12px",
                  alignItems: "center",
                  padding: "14px 0",
                  borderBottom:
                    i < RECENT_ACTIVITY.length - 1 ? "1px solid var(--input-field-blue)" : "none",
                }}
              >
                <span style={tableCell}>{row.source}</span>
                <div>
                  <StatusCell status={row.status} />
                </div>
                <span style={tableCell}>{row.processed.toLocaleString()}</span>
                <span style={tableCell}>{row.added}</span>
                <span style={{ ...tableCell, fontSize: "13px" }}>{row.started}</span>
                <span style={tableCell}>{row.duration}</span>
                <div>
                  {row.showDetails ? <WarningMessageWithTooltip /> : null}
                </div>
              </div>
            ))}

            <div
              style={{
                marginTop: "16px",
                fontFamily: '"Hero New", sans-serif',
                fontSize: "13px",
                color: "var(--textGrey)",
              }}
            >
              Showing {n} of {n} sources
            </div>
          </div>

          <div
            style={{
              padding: "20px 20px",
              borderRadius: "4px",
              backgroundColor: "var(--teal)",
              display: "flex",
              gap: "16px",
              alignItems: "flex-start",
            }}
          >
            <img
              src="/clock.svg"
              alt=""
              width={28}
              height={28}
              style={{ flexShrink: 0, filter: "brightness(1.2)" }}
            />
            <div>
              <div
                style={{
                  fontFamily: '"Hero New", sans-serif',
                  fontWeight: 600,
                  fontSize: "16px",
                  color: "var(--textWhite)",
                  marginBottom: "8px",
                }}
              >
                Automatic Refresh Schedule
              </div>
              <div
                style={{
                  fontFamily: '"Hero New", sans-serif',
                  fontSize: "15px",
                  lineHeight: "150%",
                  color: "var(--text-grey-white)",
                }}
              >
                {SCHEDULE_BODY}
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    </>
  );
}
