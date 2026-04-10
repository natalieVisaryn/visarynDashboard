import type { CSSProperties } from "react";
import type { WalletScreenBannerState } from "./walletScreenFlow";

const okButtonStyle: CSSProperties = {
  flexShrink: 0,
  padding: "10px 22px",
  borderRadius: "4px",
  border: "1px solid var(--blue)",
  backgroundColor: "#121212",
  color: "var(--blue)",
  cursor: "pointer",
  fontFamily: '"Hero New", sans-serif',
  fontSize: "14px",
  fontWeight: 500,
};

type Props = {
  banner: WalletScreenBannerState | null;
  onDismiss: () => void;
};

export default function WalletScreenBanner({ banner, onDismiss }: Props) {
  if (!banner) return null;

  return (
    <div
      role="alert"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "16px 20px",
        borderRadius: "4px",
        backgroundColor: banner.variant === "amber" ? "var(--amber)" :"var(--red)" ,
      }}
    >
      <img
        src={banner.variant === "amber" ? "/alertOrange.svg" : "/redHexForbidden.svg"}
        alt=""
        style={{ width: 32, height: 28, flexShrink: 0 }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: '"Hero New", sans-serif',
            fontSize: "16px",
            fontWeight: 600,
            color: "var(--textWhite)",
            marginBottom: "6px",
          }}
        >
          {banner.title}
        </div>
        <div
          style={{
            fontFamily: '"Hero New", sans-serif',
            fontSize: "15px",
            fontWeight: 400,
            color: "var(--text-grey-white)",
            lineHeight: 1.5,
          }}
        >
          {banner.body}
        </div>
      </div>
      <button type="button" onClick={onDismiss} style={okButtonStyle}>
        Ok
      </button>
    </div>
  );
}
