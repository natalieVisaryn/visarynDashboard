import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  dedupeAddressesInOrder,
  getAggregatedFirstColumnAddresses,
  validateBulkWalletCsvFiles,
} from "./bulkWalletCsvValidation";
import { requestBulkWalletScores } from "./walletScreenFlow";
import LoadingSpinner from "./LoadingSpinner";

type UiPhase = "editing" | "validating" | "submitting" | "result";

type BulkWalletScreeningModalProps = {
  isOpen: boolean;
  onClose: () => void;
  /** Fired after auto-close (5s) following a bulk API attempt. Not called on manual dismiss during editing/loading. */
  onBulkFlowComplete?: (outcome: "success" | "error", screeningIds?: string[]) => void;
};

const csvAccept = {
  "text/csv": [".csv"],
  "application/vnd.ms-excel": [".csv"],
};

export default function BulkWalletScreeningModal({
  isOpen,
  onClose,
  onBulkFlowComplete,
}: BulkWalletScreeningModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [uiPhase, setUiPhase] = useState<UiPhase>("editing");
  const [resultOutcome, setResultOutcome] = useState<"success" | "error" | null>(null);
  const autoCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastBulkScreeningIdsRef = useRef<string[]>([]);

  const clearAutoClose = useCallback(() => {
    if (autoCloseRef.current != null) {
      clearTimeout(autoCloseRef.current);
      autoCloseRef.current = null;
    }
  }, []);

  const resetInnerState = useCallback(() => {
    setFiles([]);
    setValidationError(null);
    setUiPhase("editing");
    setResultOutcome(null);
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setValidationError(null);
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: csvAccept,
    noClick: true,
    disabled: !isOpen || uiPhase !== "editing",
  });

  useEffect(() => {
    if (!isOpen) clearAutoClose();
  }, [isOpen, clearAutoClose]);

  useEffect(() => () => clearAutoClose(), [clearAutoClose]);

  const handleClose = () => {
    clearAutoClose();
    resetInnerState();
    onClose();
  };

  const removeFile = (index: number) => {
    setValidationError(null);
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const scheduleAutoClose = useCallback(
    (outcome: "success" | "error") => {
      clearAutoClose();
      autoCloseRef.current = setTimeout(() => {
        autoCloseRef.current = null;
        const ids = outcome === "success" ? lastBulkScreeningIdsRef.current : undefined;
        lastBulkScreeningIdsRef.current = [];
        resetInnerState();
        onClose();
        onBulkFlowComplete?.(outcome, ids);
      }, 1500);
    },
    [clearAutoClose, onBulkFlowComplete, onClose, resetInnerState],
  );

  const handleScanWallets = async () => {
    if (files.length === 0 || uiPhase !== "editing") return;
    setValidationError(null);
    setUiPhase("validating");
    try {
      const texts = await Promise.all(files.map((f) => f.text()));
      const err = validateBulkWalletCsvFiles(texts);
      if (err) {
        setValidationError(err);
        setUiPhase("editing");
        return;
      }
      const aggregated = getAggregatedFirstColumnAddresses(texts);
      const deduped = dedupeAddressesInOrder(aggregated);
      if (deduped.length === 0) {
        setResultOutcome("error");
        setUiPhase("result");
        scheduleAutoClose("error");
        return;
      }
      setUiPhase("submitting");
      const apiResult = await requestBulkWalletScores(deduped);
      const outcome = apiResult.ok ? "success" : "error";
      lastBulkScreeningIdsRef.current = apiResult.ok ? apiResult.screeningIds : [];
      setResultOutcome(outcome);
      setUiPhase("result");
      scheduleAutoClose(outcome);
    } catch {
      setValidationError("Could not read one or more files. Please try again.");
      setUiPhase("editing");
    }
  };

  if (!isOpen) return null;

  const busy = uiPhase === "validating" || uiPhase === "submitting";
  const isEditing = uiPhase === "editing";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "var(--dark-blue)",
          borderRadius: "16px",
          width: "560px",
          maxWidth: "90vw",
          maxHeight: "90vh",
          overflowY: "auto",
          paddingTop: "24px",
          paddingLeft: "28px",
          paddingRight: "28px",
          paddingBottom: "32px",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <h2
            style={{
              fontFamily: '"Hero New", sans-serif',
              fontSize: "18px",
              fontWeight: 400,
              color: "var(--text-grey-white)",
              marginTop: "10px",
            }}
          >
            Bulk Wallet Screening
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              lineHeight: 0,
              flexShrink: 0,
            }}
          >
            <img src="/xBlue.svg" alt="" width={14} height={14} />
          </button>
        </div>

        {uiPhase === "result" && resultOutcome ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "20px",
              paddingTop: "32px",
              paddingBottom: "24px",
            }}
          >
            <img
              src={resultOutcome === "success" ? "/greenCircleWithCheck.svg" : "/redCircleWithX.svg"}
              alt=""
              style={{ width: 64, height: 64 }}
            />
            <p
              style={{
                fontFamily: '"Hero New", sans-serif',
                fontSize: "18px",
                fontWeight: 500,
                color: "var(--textWhite)",
                margin: 0,
                textAlign: "center",
              }}
            >
              {resultOutcome === "success" ? "Screening Successful" : "Screening Failed"}
            </p>
          </div>
        ) : busy ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "20px",
              paddingTop: "48px",
              paddingBottom: "48px",
            }}
          >
            <LoadingSpinner
              size={40}
              aria-label={uiPhase === "validating" ? "Validating CSV files" : "Screening wallets"}
            />
            <p
              style={{
                fontFamily: '"Hero New", sans-serif',
                fontSize: "15px",
                color: "var(--text-grey-white)",
                margin: 0,
              }}
            >
              {uiPhase === "validating" ? "Validating CSV files…" : "Screening wallets…"}
            </p>
          </div>
        ) : (
          <>
            <p
              style={{
                fontFamily: '"Hero New", sans-serif',
                fontSize: "15px",
                fontWeight: 400,
                color: "var(--text-grey-white)",
                lineHeight: 1.45,
                marginBottom: "20px",
                marginTop: "20px",
              }}
            >
              Upload the CSV files containing ETH or BTC wallet addresses, then click Scan Wallets.
            </p>

            <div
              {...getRootProps({
                style: {
                  position: "relative",
                  border: "1px dashed var(--input-field-border)",
                  borderRadius: "8px",
                  padding: "36px 24px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  marginBottom: files.length > 0 ? "12px" : "28px",
                  backgroundColor: "var(--input-field-blue)",
                  outline: "none",
                },
              })}
            >
              <input
                {...getInputProps({
                  style: {
                    border: 0,
                    clip: "rect(0, 0, 0, 0)",
                    height: "1px",
                    margin: "-1px",
                    overflow: "hidden",
                    padding: 0,
                    position: "absolute",
                    width: "1px",
                  },
                })}
              />
              {isDragActive && (
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "8px",
                    backgroundColor: "rgba(133, 207, 229, 0.5)",
                    pointerEvents: "none",
                    zIndex: 1,
                  }}
                />
              )}
              <div
                style={{
                  position: "relative",
                  zIndex: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  width: "100%",
                }}
              >
                <img src="/uploadFile.svg" alt="" style={{ width: 24, height: 24 }} />
                <div
                  style={{
                    fontFamily: '"Hero New", sans-serif',
                    fontSize: "15px",
                    color: "var(--textWhite)",
                    textAlign: "center",
                    paddingTop: "10px",
                  }}
                >
                  Drop files here or{" "}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      open();
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      font: "inherit",
                      color: "var(--blue)",
                    }}
                  >
                    Browse
                  </button>
                </div>
                <div
                  style={{
                    fontFamily: '"Hero New", sans-serif',
                    fontSize: "14px",
                    color: "var(--textGrey)",
                  }}
                >
                  csv file format only
                </div>
              </div>
            </div>

            {files.length > 0 && (
              <>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    marginBottom: validationError ? "12px" : "28px",
                  }}
                >
                  {files.map((file, index) => (
                    <div
                      key={`${file.name}-${file.size}-${index}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "12px 14px",
                        borderRadius: "8px",
                        backgroundColor: "var(--input-field-blue)",
                      }}
                    >
                      <img src="/uploadFile.svg" alt="" style={{ width: 20, height: 20, flexShrink: 0 }} />
                      <span
                        style={{
                          flex: 1,
                          minWidth: 0,
                          fontFamily: '"Hero New", sans-serif',
                          fontSize: "15px",
                          color: "var(--textWhite)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={file.name}
                      >
                        {file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        aria-label={`Remove ${file.name}`}
                        style={{
                          background: "none",
                          border: "none",
                          padding: "4px",
                          cursor: "pointer",
                          lineHeight: 0,
                          flexShrink: 0,
                        }}
                      >
                        <img src="/garbageBlue.svg" alt="" width={18} height={18} />
                      </button>
                    </div>
                  ))}
                </div>
                {validationError && (
                  <p
                    role="alert"
                    style={{
                      fontFamily: '"Hero New", sans-serif',
                      fontSize: "14px",
                      fontWeight: 400,
                      color: "var(--red)",
                      lineHeight: 1.45,
                      marginTop: 0,
                      marginBottom: "28px",
                    }}
                  >
                    {validationError}
                  </p>
                )}
              </>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={handleClose}
                style={{
                  fontFamily: '"Hero New", sans-serif',
                  fontSize: "15px",
                  fontWeight: 500,
                  padding: "12px 28px",
                  borderRadius: "4px",
                  border: "1px solid var(--blue)",
                  backgroundColor: "var(--very-dark-blue)",
                  color: "var(--blue)",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={files.length === 0 || !isEditing}
                onClick={() => void handleScanWallets()}
                aria-busy={busy}
                style={{
                  fontFamily: '"Hero New", sans-serif',
                  fontSize: "15px",
                  fontWeight: 500,
                  padding: "12px 28px",
                  borderRadius: "4px",
                  border: "none",
                  backgroundColor: files.length === 0 || !isEditing ? "var(--input-field-blue)" : "var(--blue)",
                  color: files.length === 0 || !isEditing ? "var(--textGrey)" : "var(--text-dark-blue)",
                  cursor: files.length === 0 || !isEditing ? "not-allowed" : "pointer",
                  opacity: files.length === 0 || !isEditing ? 0.85 : 1,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  minWidth: "160px",
                }}
              >
                Scan Wallets
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
