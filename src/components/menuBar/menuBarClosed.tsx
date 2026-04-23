import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../../context/userContext";
import "../../styles/menuBar.css";

interface MenuBarClosedProps {
  onIconClick?: () => void;
}

export default function MenuBarClosed({ onIconClick }: MenuBarClosedProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useUser();

  const isDashboard = location.pathname === "/dashboard" || location.pathname === "/";
  const isWalletSearch =
    location.pathname === "/screenings" || location.pathname.startsWith("/screenings/");
  const isBlacklist = location.pathname === "/blacklist";
  const isApiKeys = location.pathname === "/apiKeys";

  const isAdminOverview = location.pathname === "/admin";
  /** Admin list lives at `/walletScreenings`; admins can also use org `/screenings` + detail under `/screenings/:id`. */
  const isAdminScreenings =
    location.pathname === "/walletScreenings" || isWalletSearch;
  const isAdminBlacklist = location.pathname === "/adminBlacklist";
  const isAdminApiUsage = location.pathname === "/adminApiUsage";
  const isAdminIngestion = location.pathname === "/adminIngestion";
  const isAdminRules = location.pathname === "/adminrules";

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

      {!isAdmin && (
        <>
          <div
            className="dashboardIconContainer"
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
          >
            <img
              src={isDashboard ? "/dashboardIconBlue.svg" : "/dashboardIconGray.svg"}
              alt="Dashboard"
              width={24}
              height={18}
              className="dashboardIcon"
            />
          </div>
          <div className="searchOptionsContainer">
            <div
              className="iconContainer"
              onClick={() => navigate("/screenings")}
              style={{ cursor: "pointer" }}
            >
              <img
                src={isWalletSearch ? "/blueMagnifyingGlass.svg" : "/GreyMagnifyingGlass.svg"}
                alt="Wallet Search"
                width={24}
                height={18}
                className="menuItemIcon"
              />
            </div>
          </div>
          <div
            className="iconContainer blacklistIconContainer"
            onClick={() => navigate("/blacklist")}
            style={{ cursor: "pointer" }}
          >
            <img
              src={isBlacklist ? "/noSymbolBlue.svg" : "/noSymbolGrey.svg"}
              alt="Blacklist"
              width={24}
              height={18}
            />
          </div>
          <div
            className="iconContainer apiKeyIconContainer"
            onClick={() => navigate("/apiKeys")}
            style={{ cursor: "pointer" }}
          >
            <img
              src={isApiKeys ? "/apiKeyIconBlue.svg" : "/apiKeyIconGray.svg"}
              alt="API Keys"
              width={24}
              height={18}
            />
          </div>
        </>
      )}

      {isAdmin && (
        <div className="adminMenuClosedContainer">
          <div
            className="adminMenuItemClosed"
            onClick={() => navigate("/admin")}
            style={{ cursor: "pointer" }}
          >
            <img
              src={isAdminOverview ? "/glassWithStatsBlue.svg" : "/glassWithStatsGrey.svg"}
              alt="Overview"
              width={24}
              height={18}
            />
          </div>
          <div
            className="adminMenuItemClosed"
            onClick={() => navigate("/walletScreenings")}
            style={{ cursor: "pointer" }}
          >
            <img
              src={isAdminScreenings ? "/blueMagnifyingGlass.svg" : "/GreyMagnifyingGlass.svg"}
              alt="Screenings"
              width={24}
              height={18}
            />
          </div>
          <div
            className="adminMenuItemClosed"
            onClick={() => navigate("/adminBlacklist")}
            style={{ cursor: "pointer" }}
          >
            <img
              src={isAdminBlacklist ? "/blueShieldIcon.svg" : "/greyShield.svg"}
              alt="Blacklist"
              width={24}
              height={18}
            />
          </div>
          <div
            className="adminMenuItemClosed"
            onClick={() => navigate("/adminApiUsage")}
            style={{ cursor: "pointer" }}
          >
            <img
              src={isAdminApiUsage ? "/upBarChartBlue.svg" : "/upBarChartGrey.svg"}
              alt="API Usage"
              width={24}
              height={18}
            />
          </div>
          <div
            className="adminMenuItemClosed"
            onClick={() => navigate("/adminIngestion")}
            style={{ cursor: "pointer" }}
          >
            <img
              src={isAdminIngestion ? "/upGraphBlue.svg" : "/upGraphGrey.svg"}
              alt="Ingestion"
              width={24}
              height={18}
            />
          </div>
          <div
            className="adminMenuItemClosed"
            onClick={() => navigate("/adminrules")}
            style={{ cursor: "pointer" }}
          >
            <img
              src={isAdminRules ? "/gearBlue.svg" : "/gearGrey.svg"}
              alt="Rules"
              width={24}
              height={18}
            />
          </div>
        </div>
      )}
    </div>
  );
}
