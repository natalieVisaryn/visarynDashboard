import WAValidator from "multicoin-address-validator";

export const BULK_CSV_ERROR_MAX_WALLETS =
  "A maximum of 1000 wallets can be scanned in one batch. Please reduce the number of wallets you are trying to scan.";

export const BULK_CSV_ERROR_EMPTY_FIRST_COLUMN =
  "The first column of every populated row must contain a BTC or ETH wallet address.";

export const BULK_CSV_ERROR_HEADER_ROW =
  "One or more of your csvs has a column header row. Please remove it.";

export const BULK_CSV_ERROR_INVALID_ADDRESS = "One or more wallet addresses you provided are invalid.";

const KNOWN_HEADER_LABELS = new Set(
  [
    "address",
    "wallet",
    "wallet address",
    "wallet_address",
    "walletaddress",
    "eth",
    "btc",
    "ethereum",
    "bitcoin",
    "eth address",
    "btc address",
    "eth_address",
    "btc_address",
    "public address",
    "public_address",
    "coin",
    "token",
  ].map((s) => normalizeHeaderKey(s)),
);

function normalizeHeaderKey(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Reads the first CSV field, respecting double-quoted fields and escaped `""`. */
export function parseFirstCsvField(line: string): string {
  const s = line.replace(/\r$/, "");
  let i = 0;
  while (i < s.length && s[i] === " ") i++;
  if (i >= s.length) return "";
  if (s[i] === '"') {
    i++;
    let out = "";
    while (i < s.length) {
      if (s[i] === '"') {
        if (s[i + 1] === '"') {
          out += '"';
          i += 2;
          continue;
        }
        i++;
        break;
      }
      out += s[i++];
    }
    return out.trim();
  }
  const comma = s.indexOf(",", i);
  const field = comma === -1 ? s.slice(i) : s.slice(i, comma);
  return field.trim();
}

/** First-column value for each non-blank line (UTF-8 BOM stripped). */
export function parseFirstColumnRows(fileText: string): string[] {
  const text = fileText.replace(/^\uFEFF/, "");
  const lines = text.split(/\r?\n/);
  const rows: string[] = [];
  for (const line of lines) {
    if (line.trim() === "") continue;
    rows.push(parseFirstCsvField(line));
  }
  return rows;
}

/** All first-column values in file order, then line order within each file. */
export function getAggregatedFirstColumnAddresses(fileTexts: string[]): string[] {
  return fileTexts.flatMap(parseFirstColumnRows);
}

/** First occurrence wins; exact string match after CSV parse trim. */
export function dedupeAddressesInOrder(addresses: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const a of addresses) {
    if (seen.has(a)) continue;
    seen.add(a);
    out.push(a);
  }
  return out;
}

export function isValidEthOrBtcAddress(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  try {
    if (WAValidator.validate(v, "ETH")) return true;
    if (WAValidator.validate(v, "BTC")) return true;
  } catch {
    return false;
  }
  return false;
}

function resemblesAddressAttempt(s: string): boolean {
  const t = s.trim();
  if (/^0x[0-9a-f]*$/i.test(t)) return true;
  if (/^(bc1|tb1|bc1p)/i.test(t)) return true;
  if (/^[13][a-km-zA-HJ-NP-Z1-9]{10,}$/.test(t)) return true;
  return false;
}

export function isProbableHeaderRow(cell: string): boolean {
  const raw = cell.trim();
  if (raw === "") return false;
  if (resemblesAddressAttempt(raw)) return false;

  const normalized = normalizeHeaderKey(raw);
  const underscored = normalizeHeaderKey(raw.replace(/_/g, " "));
  if (KNOWN_HEADER_LABELS.has(normalized) || KNOWN_HEADER_LABELS.has(underscored)) return true;

  if (normalized.length > 48) return false;
  return /^[a-z][a-z0-9 _-]*$/i.test(raw);
}

/**
 * Validates concatenated first-column values from one or more CSV file bodies (in order).
 * Returns the first error message by priority, or null if all checks pass.
 */
export function validateBulkWalletCsvFiles(fileTexts: string[]): string | null {
  const perFileRows = fileTexts.map(parseFirstColumnRows);
  const aggregated = getAggregatedFirstColumnAddresses(fileTexts);

  if (aggregated.length > 1000) return BULK_CSV_ERROR_MAX_WALLETS;
  if (aggregated.some((c) => c.trim() === "")) return BULK_CSV_ERROR_EMPTY_FIRST_COLUMN;

  for (const rows of perFileRows) {
    if (rows.length === 0) continue;
    const first = rows[0];
    if (!isValidEthOrBtcAddress(first) && isProbableHeaderRow(first)) {
      return BULK_CSV_ERROR_HEADER_ROW;
    }
  }

  if (aggregated.some((c) => !isValidEthOrBtcAddress(c))) return BULK_CSV_ERROR_INVALID_ADDRESS;

  return null;
}
