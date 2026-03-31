import  { useState } from "react";

export default function WalletScreenResultsTable() {
  const [walletAddress, setWalletAddress] = useState("");

  return (
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
      {/* Title Row */}
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
            fontFamily: '"Hero New", sans-serif',
            fontWeight: 700,
            fontSize: "18px",
            lineHeight: "100%",
            color: "var(--textWhite)",
paddingTop: "10px"               }}
        >
          Screen Wallet Addresses
        </div>
        <button
          type="button"
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

      {/* Input and Button Row */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {/* Label */}
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
        {/* Inputs Row */}
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
              }}
            />
            {walletAddress && (
              <img
                src="/xGrey.svg"
                alt="Clear"
                onClick={() => setWalletAddress("")}
                style={{ position: "absolute", right: 16, top: 15, width: 16, height: 24, cursor: "pointer" }}
              />
            )}
          </div>
          <button
            type="button"
            style={{
              height: "54px",
              width: "100px",
              flexShrink: 0,
              padding: "0",
              borderRadius: "4px",
              border: "none",
              backgroundColor: "var(--blue)",
              color: "var(--text-dark-blue)",
              cursor: "pointer",
              fontWeight: 500,
              fontFamily: '"Hero New", sans-serif',
              fontSize: "16px",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={async () => {
              // try {
              //   const API_URL = process.env.NEXT_PUBLIC_API_URL;
                
              //   if (!API_URL) {
              //     console.error("NEXT_PUBLIC_API_URL is not set");
              //     return;
              //   }
                
              //   console.log("Calling API:", API_URL);
                
              //   const response = await fetch(`${API_URL}/`);
                
              //   if (!response.ok) {
              //     throw new Error(`HTTP error! status: ${response.status}`);
              //   }
                
              //   const data = await response.text();
              //   console.log("API Response:", data);
              // } catch (error) {
              //   console.error("Error fetching:", error);
              // }
            }}
          >
            Screen
          </button>
        </div>
      </div>
    </div>
  );
}
