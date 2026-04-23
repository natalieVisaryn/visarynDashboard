import { API_BASE_URL } from "../utils/auth";

export type WalletScreenBannerState = {
  variant: "amber" | "red";
  title: string;
  body: string;
};

export function splitAddressCandidates(raw: string): string[] {
  return raw
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function readWalletScoreErrorMessage(res: Response): Promise<string> {
  const text = await res.text();
  if (!text.trim()) return "error scoring wallet.";
  try {
    const data = JSON.parse(text) as { error?: unknown };
    if (typeof data.error === "string" && data.error.trim()) return data.error.trim();
  } catch {
    /* ignore */
  }
  return "error scoring wallet.";
}

const genericErrorBanner = (): WalletScreenBannerState => ({
  variant: "red",
  title: "Error",
  body: "Error scoring wallet.",
});

export type ValidateWalletScreenResult =
  | { ok: true; address: string }
  | { ok: false; banner: WalletScreenBannerState };

export function validateWalletInputForScreen(raw: string): ValidateWalletScreenResult {
  const trimmedAll = raw.trim();
  if (trimmedAll === "") {
    return {
      ok: false,
      banner: {
        variant: "amber",
        title: "No Wallet Address Provided",
        body: "Please enter a valid BTC or ETH wallet address",
      },
    };
  }

  const candidates = splitAddressCandidates(raw);
  if (candidates.length > 1) {
    return {
      ok: false,
      banner: {
        variant: "amber",
        title: "Single Address Only",
        body: "You can only enter one address at a time. If you want to screen multiple addresses, please use the bulk address screening function.",
      },
    };
  }

  return { ok: true, address: candidates[0] ?? trimmedAll };
}

export type RequestWalletScreenResult =
  | { ok: true; id: string }
  | { ok: false; banner: WalletScreenBannerState };

export async function requestWalletScreenId(address: string): Promise<RequestWalletScreenResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/backend/getWalletScore`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ addresses: [address] }),
    });

    if (res.status === 200) {
      let data: unknown;
      try {
        data = await res.json();
      } catch {
        return { ok: false, banner: genericErrorBanner() };
      }
      if (!Array.isArray(data) || data.length === 0) {
        return { ok: false, banner: genericErrorBanner() };
      }
      const id = (data[0] as { id?: unknown })?.id;
      if (typeof id !== "string" || !id) {
        return { ok: false, banner: genericErrorBanner() };
      }
      return { ok: true, id };
    }

    const body = await readWalletScoreErrorMessage(res);
    return {
      ok: false,
      banner: { variant: "red", title: "Error", body },
    };
  } catch {
    return { ok: false, banner: genericErrorBanner() };
  }
}

export type RequestBulkWalletScoresResult =
  | { ok: true; screeningIds: string[] }
  | { ok: false };

export async function requestBulkWalletScores(addresses: string[]): Promise<RequestBulkWalletScoresResult> {
  if (addresses.length === 0) return { ok: false };
  try {
    const res = await fetch(`${API_BASE_URL}/backend/getWalletScore`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ addresses }),
    });

    if (res.status !== 200) {
      await readWalletScoreErrorMessage(res);
      return { ok: false };
    }

    let data: unknown;
    try {
      data = await res.json();
    } catch {
      return { ok: false };
    }
    if (!Array.isArray(data) || data.length !== addresses.length) {
      return { ok: false };
    }
    const screeningIds: string[] = [];
    for (const item of data) {
      const id = (item as { id?: unknown })?.id;
      if (typeof id !== "string" || !id.trim()) return { ok: false };
      screeningIds.push(id.trim());
    }
    return { ok: true, screeningIds };
  } catch {
    return { ok: false };
  }
}
