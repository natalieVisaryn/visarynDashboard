import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";
import WalletScreenBanner from "./WalletScreenBanner";
import BulkWalletScreeningModal from "./BulkWalletScreeningModal";
import {
  type WalletScreenBannerState,
  validateWalletInputForScreen,
  requestWalletScreenId,
} from "./walletScreenFlow";

type WalletSearchProps = {
  /** When true, user reached this via the admin `/walletScreenings` route. */
  adminView?: boolean;
  onBulkScreeningComplete?: (outcome: "success" | "error", screeningIds?: string[]) => void;
};

export default function WalletScreenResultsTable({
  adminView = false,
  onBulkScreeningComplete,
}: WalletSearchProps) {
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState("");
  const [banner, setBanner] = useState<WalletScreenBannerState | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showBulkWalletModal, setShowBulkWalletModal] = useState(false);
  const [bulkModalKey, setBulkModalKey] = useState(0);

  const dismissBanner = () => setBanner(null);

  const handleScreen = async () => {
    setBanner(null);

    const validated = validateWalletInputForScreen(walletAddress);
    if (!validated.ok) {
      setBanner(validated.banner);
      return;
    }

    setSubmitting(true);
    try {
      const result = await requestWalletScreenId(validated.address);
      if (result.ok) {
        navigate(`/screenings/${result.id}`);
        return;
      }
      setBanner(result.banner);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
    <div
      style={{
        width: "100%",
        backgroundColor: "var(--dark-blue)",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        paddingTop: "25px",
        paddingBottom: "25px",
        paddingLeft: "25px",
        paddingRight: "25px",
        borderRadius: "4px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          paddingBottom: "18px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: adminView ? "8px" : "0",
            paddingTop: "10px",
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
            Screen Wallet Addresses
          </div>

        </div>
        <button
          type="button"
          onClick={() => {
            setBulkModalKey((k) => k + 1);
            setShowBulkWalletModal(true);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "18px 26px",
            borderRadius: "4px",
            border: "none",
            backgroundColor: "var(--input-field-blue)",
            color: "var(--blue)",
            cursor: "pointer",
            fontFamily: '"Hero New", sans-serif',
            fontSize: "15px",
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          <img
            src="/uploadFile.svg"
            alt=""
            style={{ width: "12px", height: "16px" }}
          />
          Bulk Wallet Screening
        </button>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <WalletScreenBanner banner={banner} onDismiss={dismissBanner} />

        <label
          htmlFor="wallet-address"
          style={{
            display: "block",
            color: "var(--textGrey)",
            lineHeight: "100%",
            fontFamily: '"Hero New", sans-serif',
            fontSize: "14px",
          }}
        >
          Wallet Address
        </label>
        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              flex: 1,
              minWidth: 0,
            }}
          >
            <img
              src="/GreyMagnifyingGlass.svg"
              alt="Search"
              style={{
                position: "absolute",
                left: "1rem",
                width: "18px",
                height: "18px",
                pointerEvents: "none",
              }}
            />
            <input
              id="wallet-address"
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="Enter wallet address"
              disabled={submitting}
              style={{
                width: "100%",
                height: "54px",
                padding: "0.75rem 2.75rem 0.75rem 2.75rem",
                borderRadius: "4px",
                border: "1px solid var(--input-field-border)",
                backgroundColor: "var(--input-field-blue)",
                color: "var(--textWhite)",
                boxSizing: "border-box",
                fontFamily: '"Hero New", sans-serif',
                fontSize: "14px",
                opacity: submitting ? 0.7 : 1,
              }}
            />
            {walletAddress && !submitting && (
              <img
                src="/xGrey.svg"
                alt="Clear"
                onClick={() => setWalletAddress("")}
                style={{
                  position: "absolute",
                  right: 16,
                  top: 15,
                  width: 16,
                  height: 24,
                  cursor: "pointer",
                }}
              />
            )}
          </div>
          <button
            type="button"
            disabled={submitting}
            style={{
              height: "54px",
              width: "100px",
              flexShrink: 0,
              padding: "0",
              borderRadius: "4px",
              border: "none",
              backgroundColor: "var(--blue)",
              color: "var(--text-dark-blue)",
              cursor: submitting ? "not-allowed" : "pointer",
              fontWeight: 500,
              fontFamily: '"Hero New", sans-serif',
              fontSize: "16px",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: submitting ? 0.7 : 1,
            }}
            onClick={handleScreen}
            aria-busy={submitting}
          >
            {submitting ? <LoadingSpinner size={20} aria-label="Screening wallet" /> : "Screen"}
          </button>
        </div>
      </div>
    </div>

    <BulkWalletScreeningModal
      key={bulkModalKey}
      isOpen={showBulkWalletModal}
      onClose={() => setShowBulkWalletModal(false)}
      onBulkFlowComplete={onBulkScreeningComplete}
    />
    </>
  );
}
