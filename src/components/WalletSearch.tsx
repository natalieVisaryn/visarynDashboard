import React, { useState } from "react";
import { useMenuBar } from "./menuBar/useMenuBar";

export default function WalletScreenResultsTable() {
  const [walletAddress, setWalletAddress] = useState("");
  const [blockchain, setBlockchain] = useState("ETH");
  const { isMenuOpen } = useMenuBar();
  const menuBarWidth = isMenuOpen ? 240 : 90;
  const width = `calc(90vw - ${menuBarWidth}px)`;

  return (
    <div
      style={{
        width: width,
        height: "179px",
        backgroundColor: "var(--dark-blue)",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        paddingTop: "25px",
        paddingBottom: "25px",
        paddingLeft: "20px",
        paddingRight: "20px",
        borderRadius: "4px",
      }}
    >
      {/* Title */}
      <div
        style={{
          fontFamily: '"Hero New", sans-serif',
          fontWeight: 700,
          fontSize: "18px",
          lineHeight: "100%",
          color: "var(--textWhite)",
          marginBottom: "25px",
        }}
      >
        Screen Wallet Addresses
      </div>

      {/* Input and Button Row */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {/* Labels Row */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "flex-start",
          }}
        >
          <label
            htmlFor="wallet-address"
            style={{
              width: "764px",
              display: "block",
              color: "var(--textGrey)",
              lineHeight: "100%",
              fontFamily: '"Hero New", sans-serif',
              fontSize: "14px",
            }}
          >
            Wallet Addresses
          </label>
          <label
            htmlFor="blockchain"
            style={{
              width: "300px",
              display: "block",
              color: "var(--textGrey)",
              lineHeight: "100%",
              fontFamily: '"Hero New", sans-serif',
              fontSize: "14px",
            }}
          >
            Blockchain
          </label>
        </div>
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
                width: "764px",
                height: "54px",
                padding: "0.75rem 0.75rem 0.75rem 2.75rem",
                borderRadius: "4px",
                border: "1px solid var(--input-field-border)",
                backgroundColor: "var(--input-field-blue)",
                color: "var(--textWhite)",
                boxSizing: "border-box",
                fontFamily: '"Hero New", sans-serif',
                fontSize: "14px",
              }}
            />
          </div>
          <select
            id="blockchain"
            value={blockchain}
            onChange={(e) => setBlockchain(e.target.value)}
            style={{
              width: "300px",
              height: "54px",
              padding: "0.75rem",
              borderRadius: "4px",
              border: "1px solid var(--input-field-border)",
              backgroundColor: "var(--input-field-blue)",
              color: "var(--textWhite)",
              boxSizing: "border-box",
              fontFamily: '"Hero New", sans-serif',
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            <option value="ETH">Ethereum (ETH)</option>
            <option value="BTC">Bitcoin (BTC)</option>
          </select>
          <button
            type="button"
            style={{
              height: "54px",
              width: "100px",
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
