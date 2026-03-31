import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../../context/userContext";
import "../../styles/menuBar.css";

interface MenuBarOpenProps {
  onIconClick?: () => void;
}

export default function MenuBarOpen({ onIconClick }: MenuBarOpenProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useUser();

  const isDashboard = location.pathname === "/dashboard" || location.pathname === "/";
  const isWalletSearch = location.pathname === "/screenings";
  const isBlacklist = location.pathname === "/blacklist";
  const isApiKeys = location.pathname === "/apiKeys";

  const isAdminOverview = location.pathname === "/admin";
  const isAdminScreenings = location.pathname === "/admin/screenings";
  const isAdminBlacklist = location.pathname === "/admin/blacklist";
  const isAdminApiUsage = location.pathname === "/admin/api-usage";
  const isAdminIngestion = location.pathname === "/admin/ingestion";
  const isAdminRule = location.pathname === "/admin/rule";

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

      {!isAdmin && (
        <>
          <div
            className="dashboardItemContainer"
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
          >
            <div className="menuItemIconContainer">
              <img
                src={isDashboard ? "/dashboardIconBlue.svg" : "/dashboardIconGray.svg"}
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
            onClick={() => navigate("/screenings")}
            style={{ cursor: "pointer" }}
          >
            <div className="menuItemIconContainer">
              <img
                src={isWalletSearch ? "/blueMagnifyingGlass.svg" : "/GreyMagnifyingGlass.svg"}
                alt="Wallet Icon"
                width={24}
                height={18}
                className="menuItemIcon"
              />
            </div>
            <span
              className="menuItemText"
              style={{ color: isWalletSearch ? "var(--blue)" : "var(--textGrey)" }}
            >
              Screening
            </span>
          </div>
          <div
            className="blacklistItemContainer"
            onClick={() => navigate("/blacklist")}
            style={{ cursor: "pointer" }}
          >
            <div className="menuItemIconContainer">
              <img
                src={isBlacklist ? "/noSymbolBlue.svg" : "/noSymbolGrey.svg"}
                alt="Blacklist Icon"
                width={24}
                height={18}
                className="menuItemIcon"
              />
            </div>
            <span
              className="menuItemText"
              style={{ color: isBlacklist ? "var(--blue)" : "var(--textGrey)" }}
            >
              Blacklist
            </span>
          </div>
          <div
            className="apiKeysItemContainer"
            onClick={() => navigate("/apiKeys")}
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
              style={{ color: isApiKeys ? "var(--blue)" : "var(--textGrey)" }}
            >
              API Keys
            </span>
          </div>
        </>
      )}

      {isAdmin && (
        <div className="adminMenuOpenContainer">
          <div
            className="adminMenuItemOpen"
            onClick={() => navigate("/admin")}
            style={{ cursor: "pointer" }}
          >
            <div className="menuItemIconContainer">
              <img
                src={isAdminOverview ? "/upBarChartBlue.svg" : "/upBarChartGrey.svg"}
                alt="Overview Icon"
                width={24}
                height={18}
                className="menuItemIcon"
              />
            </div>
            <span
              className="menuItemText"
              style={{ color: isAdminOverview ? "var(--blue)" : "var(--textGrey)" }}
            >
              Overview
            </span>
          </div>
          <div
            className="adminMenuItemOpen"
            onClick={() => navigate("/admin/screenings")}
            style={{ cursor: "pointer" }}
          >
            <div className="menuItemIconContainer">
              <img
                src={isAdminScreenings ? "/blueMagnifyingGlass.svg" : "/GreyMagnifyingGlass.svg"}
                alt="Screenings Icon"
                width={24}
                height={18}
                className="menuItemIcon"
              />
            </div>
            <span
              className="menuItemText"
              style={{ color: isAdminScreenings ? "var(--blue)" : "var(--textGrey)" }}
            >
              Screenings
            </span>
          </div>
          <div
            className="adminMenuItemOpen"
            onClick={() => navigate("/admin/blacklist")}
            style={{ cursor: "pointer" }}
          >
            <div className="menuItemIconContainer">
              <img
                src={isAdminBlacklist ? "/blueShieldIcon.svg" : "/greyShield.svg"}
                alt="Blacklist Icon"
                width={24}
                height={18}
                className="menuItemIcon"
              />
            </div>
            <span
              className="menuItemText"
              style={{ color: isAdminBlacklist ? "var(--blue)" : "var(--textGrey)" }}
            >
              Blacklist
            </span>
          </div>
          <div
            className="adminMenuItemOpen"
            onClick={() => navigate("/admin/api-usage")}
            style={{ cursor: "pointer" }}
          >
            <div className="menuItemIconContainer">
              <img
                src={isAdminApiUsage ? "/upBarChartBlue.svg" : "/upBarChartGrey.svg"}
                alt="API Usage Icon"
                width={24}
                height={18}
                className="menuItemIcon"
              />
            </div>
            <span
              className="menuItemText"
              style={{ color: isAdminApiUsage ? "var(--blue)" : "var(--textGrey)" }}
            >
              API Usage
            </span>
          </div>
          <div
            className="adminMenuItemOpen"
            onClick={() => navigate("/admin/ingestion")}
            style={{ cursor: "pointer" }}
          >
            <div className="menuItemIconContainer">
              <img
                src={isAdminIngestion ? "/upGraphBlue.svg" : "/upGraphGrey.svg"}
                alt="Ingestion Icon"
                width={24}
                height={18}
                className="menuItemIcon"
              />
            </div>
            <span
              className="menuItemText"
              style={{ color: isAdminIngestion ? "var(--blue)" : "var(--textGrey)" }}
            >
              Ingestion
            </span>
          </div>
          <div
            className="adminMenuItemOpen"
            onClick={() => navigate("/admin/rule")}
            style={{ cursor: "pointer" }}
          >
            <div className="menuItemIconContainer">
              <img
                src="/gearGrey.svg"
                alt="Rule Icon"
                width={24}
                height={18}
                className="menuItemIcon"
              />
            </div>
            <span
              className="menuItemText"
              style={{ color: isAdminRule ? "var(--blue)" : "var(--textGrey)" }}
            >
              Rule
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
