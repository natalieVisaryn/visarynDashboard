import { useCallback, useState } from "react";
import PageHeader from "./PageHeader";
import PageLayout from "./PageLayout";
import WalletSearch from "./WalletSearch";
import WalletSearchResultTable from "./WalletSearchResultTable";

type WalletsProps = {
  /** When true (e.g. `/walletScreenings`), show all orgs’ screenings and admin table columns. */
  adminView?: boolean;
};

export default function Wallets({ adminView = false }: WalletsProps) {
  const [screeningsRefreshKey, setScreeningsRefreshKey] = useState(0);
  const [bulkHighlightIds, setBulkHighlightIds] = useState<string[]>([]);
  const clearBulkHighlight = useCallback(() => setBulkHighlightIds([]), []);

  return (
    <>
      <div>
        <title>
          {adminView ? "Wallet screenings — all organizations" : "Wallets"}
        </title>
        <meta
          name="description"
          content={
            adminView
              ? "Wallet screenings across all organizations"
              : "API Keys"
          }
        />
        <link rel="icon" href="/visarynIcon.svg" type="image/svg+xml" />
      </div>
      <PageLayout>
        <PageHeader pageTitle={adminView ? "Wallet screenings" : "Wallets"} />
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
          <WalletSearch
            adminView={adminView}
            onBulkScreeningComplete={(outcome, screeningIds) => {
              if (outcome === "success") {
                setScreeningsRefreshKey((k) => k + 1);
                if (screeningIds?.length) setBulkHighlightIds(screeningIds);
              }
            }}
          />
          <WalletSearchResultTable
            adminView={adminView}
            refreshKey={screeningsRefreshKey}
            bulkHighlightIds={bulkHighlightIds}
            onBulkHighlightConsumed={clearBulkHighlight}
          />
        </div>
      </PageLayout>
    </>
  );
}
