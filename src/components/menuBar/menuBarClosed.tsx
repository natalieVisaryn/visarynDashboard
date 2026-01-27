import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/menuBar.css";

interface MenuBarClosedProps {
  onIconClick?: () => void;
}

export default function MenuBarClosed({ onIconClick }: MenuBarClosedProps) {
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
    <div className="menuBarClosedContainer menuBarCommon">
      <div
        className="menuBarIconContainer"
        onClick={onIconClick}
        style={{ cursor: onIconClick ? "pointer" : "default" }}
      >
        <img
          src="/visarynIcon.svg"
          alt="Visaryn Icon"
          width={50}
          height={50}
          className="menuBarIcon"
        />
      </div>
      <div
        className="dashboardIconContainer"
        onClick={handleDashboardClick}
        style={{ cursor: "pointer" }}
      >
        <img
          src={
            isDashboard ? "/dashboardIconBlue.svg" : "/dashboardIconGray.svg"
          }
          alt="Dashboard"
          width={24}
          height={18}
          className="dashboardIcon"
        />
      </div>
      <div className="searchOptionsContainer">
        <div
          className="iconContainer"
          onClick={handleWalletSearchClick}
          style={{ cursor: "pointer" }}
        >
          <img
            src={isWalletSearch ? "/walletBlue.svg" : "/walletGrey.svg"}
            alt="Wallet Search"
            width={24}
            height={18}
            className="dashboardIcon"
            onClick={handleWalletSearchClick}
          />
        </div>
      </div>
      <div
        className="iconContainer apiKeyIconContainer"
        onClick={handleApiKeysClick}
        style={{ cursor: "pointer" }}
      >
        <img
          src={isApiKeys ? "/apiKeyIconBlue.svg" : "/apiKeyIconGray.svg"}
          alt="API Keys"
          width={24}
          height={18}
        />
      </div>
    </div>
  );
}
