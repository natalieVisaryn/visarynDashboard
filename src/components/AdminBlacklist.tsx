import PageHeader from "./PageHeader";
import PageLayout from "./PageLayout";
import OrganizationBlacklistPanel from "./OrganizationBlacklistPanel";

export default function AdminBlacklist() {
  return (
    <>
      <div>
        <title>Blacklist</title>
        <meta name="description" content="Blacklisted Wallets" />
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
            }}
          >
            <OrganizationBlacklistPanel variant="admin" />
          </div>
        </div>
      </PageLayout>
    </>
  );
}
