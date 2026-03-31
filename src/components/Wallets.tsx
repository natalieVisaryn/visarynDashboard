import PageHeader from "./PageHeader";
import PageLayout from "./PageLayout";
import WalletSearch from "./WalletSearch";
import WalletSearchResultTable from "./WalletSearchResultTable";

export default function Wallets() {
  return (
    <>
      <div>
        <title>Wallets</title>
        <meta name="description" content="API Keys" />
        <link rel="icon" href="/visarynIcon.svg" type="image/svg+xml" />
      </div>
      <PageLayout>
        <PageHeader pageTitle="Wallets" />
        <div
          style={{
            paddingTop: "40px",
            display: "flex",
            flexDirection: "column",
            width: "100%",
            gap: "20px",
            paddingLeft: "55px",
            paddingRight: "55px",
            boxSizing: "border-box",
          }}
        >
          <WalletSearch />
          <WalletSearchResultTable />
        </div>
      </PageLayout>
    </>
  );
}
