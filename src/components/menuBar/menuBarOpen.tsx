import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/menuBar.css";

interface MenuBarOpenProps {
  onIconClick?: () => void;
}

export default function MenuBarOpen({ onIconClick }: MenuBarOpenProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboard = location.pathname === "/dashboard" || location.pathname === "/";
  const isWalletSearch = location.pathname === "/wallets";
  const isApiKeys = location.pathname === "/apiKeys";

  const handleDashboardClick = () => {
    navigate("/");
  };

  const handleWalletSearchClick = () => {
    navigate("/wallets");
  };

  const handleApiKeysClick = () => {
    navigate("/apiKeys");
  };

  return (
    <div className="menuBarOpenContainer menuBarCommon">
      <div
        className="menuBarLogoContainer"
        onClick={onIconClick}
        style={{ cursor: onIconClick ? "pointer" : "default" }}
      >
        <img
          src="/visarynLogo.svg"
          alt="Visaryn Logo"
          width={200}
          height={50}
          className="menuBarLogo"
        />
      </div>
      <div
        className="dashboardItemContainer"
        onClick={handleDashboardClick}
        style={{ cursor: "pointer" }}
      >
        <div className="menuItemIconContainer">
          <img
            src={
              isDashboard ? "/dashboardIconBlue.svg" : "/dashboardIconGray.svg"
            }
            alt="Dashboard Icon"
            width={24}
            height={18}
            className="menuItemIcon"
          />
        </div>
        <span
          className="menuItemText"
          style={{ color: isDashboard ? "var(--blue)" : "var(--textGrey)" }}
        >
          Dashboard
        </span>
      </div>
      <div
        className="walletsItemContainer"
        onClick={handleWalletSearchClick}
        style={{ cursor: "pointer" }}
      >
        <div 
          className="menuItemIconContainer"
          onClick={handleWalletSearchClick}
        >
          <img
            src={isWalletSearch ? "/walletBlue.svg" : "/walletGrey.svg"}
            alt="Wallet Icon"
            width={24}
            height={18}
            className="menuItemIcon"
            onClick={handleWalletSearchClick}
          />
        </div>
        <span
          className="menuItemText"
          style={{
            color: isWalletSearch ? "var(--blue)" : "var(--textGrey)",
          }}
          onClick={handleWalletSearchClick}
        >
          Wallets
        </span>
      </div>
      <div
        className="apiKeysItemContainer"
        onClick={handleApiKeysClick}
        style={{ cursor: "pointer" }}
      >
        <div className="menuItemIconContainer">
          <img
            src={isApiKeys ? "/apiKeyIconBlue.svg" : "/apiKeyIconGray.svg"}
            alt="API Key Icon"
            width={24}
            height={18}
            className="menuItemIcon"
          />
        </div>
        <span
          className="menuItemText"
          style={{
            color: isApiKeys ? "var(--blue)" : "var(--textGrey)",
          }}
        >
          API Keys
        </span>
      </div>
    </div>
  );
}
