import { useState, useEffect } from "react";
import PageHeader from "./PageHeader";
import PageLayout from "./PageLayout";
import { API_BASE_URL } from "../utils/auth";

const MASKED_API_KEY = "••••••••••••••••";

type OrgApiKey = {
  id: string;
  key: string;
  orgId: string;
  expiryDate: string;
  requestLimit: string;
  requestsInTimePeriod: string;
  createdAt?: string | null;
  lastUsed?: string | null;
};

function formatDate(isoString: string | null | undefined): string {
  if (!isoString) return "";
  const d = new Date(isoString);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString();
}

function isKeyActive(expiryDate: string): boolean {
  return new Date(expiryDate) > new Date();
}

export default function ApiKeys() {
  const [apiKeys, setApiKeys] = useState<OrgApiKey[]>([]);
  const [visibleKeyId, setVisibleKeyId] = useState<string | null>(null);
  const [showCopyNotification, setShowCopyNotification] = useState(false);

  useEffect(() => {
    const url = `${API_BASE_URL}/backend/getOrgApiKeys`;
    fetch(url, {
      method: "POST",
      credentials: "include",
    })
      .then(async (res) => {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          console.log("getOrgApiKeys response:", data);
          setApiKeys(Array.isArray(data) ? data : []);
        } catch {
          console.error("getOrgApiKeys returned non-JSON:", text.slice(0, 200));
        }
      })
      .catch((err) => console.error("getOrgApiKeys network error:", err));
  }, []);

  useEffect(() => {
    if (showCopyNotification) {
      const timer = setTimeout(() => setShowCopyNotification(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showCopyNotification]);

  const handleCopyApiKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setShowCopyNotification(true);
    } catch (err) {
      console.error("Failed to copy API key:", err);
    }
  };

  return (
    <>
      <div>
        <title>API Keys</title>
        <meta name="description" content="API Keys" />
        <link rel="icon" href="/visarynIcon.svg" type="image/svg+xml" />
      </div>
      <PageLayout>
        <PageHeader pageTitle="API Keys" />
        <div
          style={{
            paddingTop: "40px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            gap: "20px",
          }}
        >
          <div
            style={{
              width: "92%",
              minHeight: "76px",
              backgroundColor: "var(--light-blue)",
              color: "var(--very-dark-blue)",
              display: "flex",
              alignItems: "center",
              paddingLeft: "10px",
              paddingRight: "16px",
              borderRadius: "38px",
              fontSize: "13px",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                minWidth: "60px",
                minHeight: "60px",
                borderRadius: "50%",
                backgroundColor: "var(--blue)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src="/apiKeyIconBlack.svg"
                alt=""
                style={{ width: "24px", height: "18px" }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
              <span style={{ fontWeight: "bold", color: "var(--very-dark-blue)", fontSize: "16px" }}>
                API Authentication
              </span>
              <span style={{ fontSize: "14px" }}>
                Include your API key in the request header as{" "}
                <span
                  style={{
                    backgroundColor: "var(--blue)",
                    padding: "2px 6px",
                    borderRadius: "4px",
                  }}
                >
                  Authorization: Bearer YOUR_API_KEY
                </span>
                . Keep your keys secure and never expose them in client-side
                code.
              </span>
            </div>
          </div>
          <div
            style={{
              width: "92%",
              backgroundColor: "var(--dark-blue)",
              borderRadius: "4px",
              overflow: "hidden",
              marginTop: "10px",
            }}
          >
            <div
              style={{
                paddingTop: "40px",
                paddingLeft: "20px",
                paddingRight: "20px",
              }}
            >
              <span
                style={{
                  fontWeight: "bold",
                  color: "var(--text-grey-white)",
                  fontSize: "18px",
                }}
              >
                Your API keys
              </span>
            </div>
            <div
              style={{
                paddingLeft: "20px",
                paddingRight: "20px",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid var(--input-field-blue)",
                    }}
                  >
                    <th
                      style={{
                        padding: "calc(1rem + 20px) 1rem 1rem 1rem",
                        textAlign: "left",
                        fontFamily: '"Hero New", sans-serif',
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "var(--textWhite)",
                        borderTopLeftRadius: "4px",
                      }}
                    >
                      Name
                    </th>
                    <th
                      style={{
                        padding: "calc(1rem + 20px) 1rem 1rem 1rem",
                        textAlign: "left",
                        fontFamily: '"Hero New", sans-serif',
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "var(--textWhite)",
                      }}
                    >
                      API Key
                    </th>
                    <th
                      style={{
                        padding: "calc(1rem + 20px) 1rem 1rem 1rem",
                        textAlign: "left",
                        fontFamily: '"Hero New", sans-serif',
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "var(--textWhite)",
                      }}
                    >
                      Created
                    </th>
                    <th
                      style={{
                        padding: "calc(1rem + 20px) 1rem 1rem 1rem",
                        textAlign: "left",
                        fontFamily: '"Hero New", sans-serif',
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "var(--textWhite)",
                      }}
                    >
                      Last Used
                    </th>
                    <th
                      style={{
                        padding: "calc(1rem + 20px) 1rem 1rem 1rem",
                        textAlign: "left",
                        fontFamily: '"Hero New", sans-serif',
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "var(--textWhite)",
                      }}
                    >
                      Requests per Billing Period
                    </th>
                    <th
                      style={{
                        padding: "calc(1rem + 20px) 1rem 1rem 1rem",
                        textAlign: "left",
                        fontFamily: '"Hero New", sans-serif',
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "var(--textWhite)",
                        borderTopRightRadius: "4px",
                      }}
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {apiKeys.map((row) => {
                    const isVisible = visibleKeyId === row.id;
                    return (
                      <tr key={row.id}>
                        <td
                          style={{
                            padding: "1rem",
                            fontFamily: '"Hero New", sans-serif',
                            fontSize: "14px",
                            color: "var(--textWhite)",
                          }}
                        >
                          Org API
                        </td>
                        <td
                          style={{
                            padding: "1rem",
                            fontFamily: '"Hero New", sans-serif',
                            fontSize: "14px",
                            color: "var(--textWhite)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <span>{isVisible ? row.key : MASKED_API_KEY}</span>
                            <img
                              src="/eyeIconBlue.svg"
                              alt={isVisible ? "Hide" : "Reveal"}
                              onClick={() =>
                                setVisibleKeyId((id) => (id === row.id ? null : row.id))
                              }
                              role="button"
                              style={{
                                width: "16px",
                                height: "16px",
                                cursor: "pointer",
                                marginLeft: "60px",
                              }}
                            />
                            <img
                              src="/copyBlye.svg"
                              alt="Copy"
                              onClick={() => handleCopyApiKey(row.key)}
                              role="button"
                              style={{
                                width: "16px",
                                height: "16px",
                                cursor: "pointer",
                                marginLeft: "8px",
                              }}
                            />
                          </div>
                        </td>
                        <td
                          style={{
                            padding: "1rem",
                            fontFamily: '"Hero New", sans-serif',
                            fontSize: "14px",
                            color: "var(--textWhite)",
                          }}
                        >
                          {formatDate(row.createdAt)}
                        </td>
                        <td
                          style={{
                            padding: "1rem",
                            fontFamily: '"Hero New", sans-serif',
                            fontSize: "14px",
                            color: "var(--textWhite)",
                          }}
                        >
                          {formatDate(row.lastUsed)}
                        </td>
                        <td
                          style={{
                            padding: "1rem",
                            fontFamily: '"Hero New", sans-serif',
                            fontSize: "14px",
                            color: "var(--textWhite)",
                          }}
                        >
                          {row.requestsInTimePeriod}
                        </td>
                        <td
                          style={{
                            padding: "1rem",
                            fontFamily: '"Hero New", sans-serif',
                            fontSize: "14px",
                            color: "var(--textWhite)",
                          }}
                        >
                          {isKeyActive(row.expiryDate) ? (
                            <img
                              src="/apiKeyActive.svg"
                              alt="Active"
                              style={{ display: "block" }}
                            />
                          ) : (
                            " "
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div
              style={{
                borderTop: "1px solid var(--input-field-blue)",
                marginLeft: "20px",
                marginRight: "20px",
                padding: "1rem",
              }}
            >
              <div
                style={{
                  fontFamily: '"Hero New", sans-serif',
                  fontSize: "14px",
                  color: "var(--textGrey)",
                  textAlign: "left",
                }}
              >
                Showing {apiKeys.length} of {apiKeys.length} API Keys
              </div>
            </div>
          </div>
          <div
            style={{
              width: "92%",
              backgroundColor: "var(--dark-blue)",
              borderRadius: "4px",
              padding: "2rem",
              marginBottom: "3rem",
              marginTop: "1.7rem",

            }}
          >
            <div
              style={{
                fontFamily: '"Hero New", sans-serif',
                fontSize: "18px",
                fontWeight: "bold",
                color: "var(--textWhite)",
                paddingBottom: "10px",
              }}
            >
              Quick Start
            </div>
            <div
              style={{
                fontFamily: '"Hero New", sans-serif',
                fontSize: "16px",
                fontWeight: "bold",
                color: "var(--textWhite)",
                paddingTop: "2rem",
                paddingBottom: "0.7rem",

              }}
            >
              Example Request
            </div>
            <div
              style={{
                width: "100%",
                backgroundColor: "var(--very-dark-blue)",
                marginTop: "1rem",
                padding: "1rem",
                borderRadius: "4px",
                overflow: "auto",
              }}
            >
              <pre
                style={{
                  margin: 0,
                  fontFamily: "ui-monospace, monospace",
                  fontSize: "14px",
                  color: "var(--textWhite)",
                  whiteSpace: "pre",
                }}
              >
                {`curl -X POST https://api.visaryn.com/v1/screen \\ 
     -H "Authorization: Bearer YOUR_API_KEY" \\ 
     -H "Content-Type: application/json" \\ 
     -d '{ 
          "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", 
          "chain": "ETH" 
     }'`}
              </pre>
            </div>
            <div
              style={{
                fontFamily: '"Hero New", sans-serif',
                fontSize: "16px",
                fontWeight: "bold",
                color: "var(--textWhite)",
                paddingTop: "2rem",
                paddingBottom: "0.7rem",              }}
            >
              Response Format
            </div>
            <div
              style={{
                width: "100%",
                backgroundColor: "var(--very-dark-blue)",
                marginTop: "1rem",
                padding: "1rem",
                borderRadius: "4px",
                overflow: "auto",
              }}
            >
              <pre
                style={{
                  margin: 0,
                  fontFamily: "ui-monospace, monospace",
                  fontSize: "14px",
                  color: "var(--textWhite)",
                  whiteSpace: "pre",
                }}
              >
                {`{ 
     "risk_score": 8, 
     "risk_level": "High", 
     "recommended_action": "Escalate", 
     "decision_confidence": "High", 
     "risk_factors": [...], 
     "audit_summary": "...", 
     "last_updated": "2026-01-14T12:00:00Z", 
     "ruleset_version": "v1.0" 
}`}
              </pre>
            </div>
          </div>
        </div>
      </PageLayout>

      {showCopyNotification && (
        <div
          style={{
            position: "fixed",
            bottom: "2rem",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "var(--dark-blue)",
            color: "var(--textWhite)",
            padding: "0.75rem 1.5rem",
            borderRadius: "4px",
            border: "1px solid var(--blue)",
            fontFamily: '"Hero New", sans-serif',
            fontSize: "14px",
            fontWeight: 500,
            zIndex: 9999,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          }}
        >
          API key copied to clipboard
        </div>
      )}
    </>
  );
}
