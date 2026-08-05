import "server-only";
import { createSign } from "node:crypto";
import type {
  WalletCardData,
  WalletCardResult,
  WalletConnectionStatus,
  WalletProvider,
} from "../types";

/**
 * Google Wallet adapter (Loyalty passes).
 *
 * Unlike Apple, Google issues no per-developer signing certificate and
 * charges no annual fee — a service account plus an Issuer ID from the
 * Google Pay & Wallet Console is the whole setup, which is why this is the
 * provider we can ship without waiting on anything.
 *
 * Two ids matter and are easy to confuse:
 *   - LoyaltyClass  — the template, one per business. The owner's
 *     business_settings.google_wallet_class_id.
 *   - LoyaltyObject — one card per customer, derived from the wallet_cards
 *     row id so a re-sync updates the same object instead of minting a new
 *     one.
 *
 * The object carries a QR barcode whose value is the wallet_cards id — the
 * exact string /employee/scan expects. That is the whole point of the pass:
 * without it the card is decorative.
 */

const WALLET_API = "https://walletobjects.googleapis.com/walletobjects/v1";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SAVE_URL = "https://pay.google.com/gp/v/save";
const SCOPE = "https://www.googleapis.com/auth/wallet_object.issuer";

type ServiceAccount = {
  client_email: string;
  private_key: string;
};

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function signRs256(payload: object, sa: ServiceAccount): string {
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const body = base64url(JSON.stringify(payload));
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${body}`);
  // Service-account keys arrive as JSON, where the PEM newlines are escaped.
  // Left as literal "\n" the key parses as garbage and signing throws.
  const key = sa.private_key.replace(/\\n/g, "\n");
  return `${header}.${body}.${base64url(signer.sign(key))}`;
}

export class GoogleWalletProvider implements WalletProvider {
  private readonly serviceAccount: ServiceAccount;
  private accessToken: { value: string; expiresAt: number } | null = null;

  /**
   * @param issuerId          Issuer ID from the Google Pay & Wallet Console.
   * @param serviceAccountJson The downloaded service-account key, as JSON.
   */
  constructor(
    private readonly issuerId: string,
    serviceAccountJson: string
  ) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(serviceAccountJson);
    } catch {
      throw new Error("ملف حساب الخدمة (Service Account) ليس JSON صالحًا.");
    }

    const sa = parsed as Partial<ServiceAccount>;
    if (!sa.client_email || !sa.private_key) {
      throw new Error(
        "ملف حساب الخدمة ناقص — يجب أن يحتوي على client_email و private_key."
      );
    }

    this.serviceAccount = { client_email: sa.client_email, private_key: sa.private_key };
  }

  /** Exchanges the service-account key for an OAuth token, cached until it nears expiry. */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.accessToken.expiresAt) {
      return this.accessToken.value;
    }

    const now = Math.floor(Date.now() / 1000);
    const assertion = signRs256(
      {
        iss: this.serviceAccount.client_email,
        scope: SCOPE,
        aud: TOKEN_URL,
        iat: now,
        exp: now + 3600,
      },
      this.serviceAccount
    );

    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion,
      }),
    });

    if (!res.ok) {
      throw new Error(`فشل مصادقة Google Wallet (${res.status}): ${await res.text()}`);
    }

    const json = (await res.json()) as { access_token: string; expires_in: number };
    this.accessToken = {
      value: json.access_token,
      // 60s of slack so a token never expires mid-request.
      expiresAt: Date.now() + (json.expires_in - 60) * 1000,
    };
    return json.access_token;
  }

  private async api<T>(method: string, path: string, body?: object): Promise<T> {
    const token = await this.getAccessToken();
    const res = await fetch(`${WALLET_API}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      throw new Error(`Google Wallet API ${method} ${path} → ${res.status}: ${await res.text()}`);
    }
    return (await res.json()) as T;
  }

  /** Object ids may only contain alphanumerics, '.', '_' and '-'. */
  private objectId(walletCardId: string): string {
    return `${this.issuerId}.${walletCardId.replace(/[^a-zA-Z0-9._-]/g, "")}`;
  }

  private buildObject(data: WalletCardData) {
    const classId = data.walletTemplate.googleClassId;
    if (!classId) {
      throw new Error(
        "لم يتم ربط قالب Google Wallet لهذا المحل بعد. أدخل Class ID في إعدادات المحل."
      );
    }

    return {
      id: this.objectId(data.walletCardId),
      classId,
      state: "ACTIVE",
      accountId: data.customer.memberId,
      accountName: data.customer.name,
      loyaltyPoints: {
        label: "النقاط",
        balance: { int: data.loyalty.points },
      },
      // The scannable code. Its value is the wallet_cards id, which
      // /employee/scan resolves via resolve_wallet_card().
      barcode: {
        type: "QR_CODE",
        value: data.walletCardId,
        alternateText: data.customer.name,
      },
      hexBackgroundColor: data.business.primaryColor,
      ...(data.business.logoUrl
        ? {
            heroImage: {
              sourceUri: { uri: data.business.logoUrl },
            },
          }
        : {}),
    };
  }

  /**
   * The "Save to Google Wallet" link. It is a JWT signed by the same service
   * account, not an API response — the object must already exist, and this
   * only points the user's phone at it.
   */
  private saveUrl(objectId: string, classId: string): string {
    const jwt = signRs256(
      {
        iss: this.serviceAccount.client_email,
        aud: "google",
        typ: "savetowallet",
        iat: Math.floor(Date.now() / 1000),
        payload: { loyaltyObjects: [{ id: objectId, classId }] },
      },
      this.serviceAccount
    );
    return `${SAVE_URL}/${jwt}`;
  }

  async createCard(data: WalletCardData): Promise<WalletCardResult> {
    const object = this.buildObject(data);

    try {
      await this.api("POST", "/loyaltyObject", object);
    } catch (err) {
      // A re-sync of a card Google already knows about must update, not fail.
      if (err instanceof Error && err.message.includes("409")) {
        return this.updateCard(object.id, data);
      }
      throw err;
    }

    return {
      externalCardId: object.id,
      walletUrlApple: null,
      walletUrlGoogle: this.saveUrl(object.id, object.classId),
      platform: "google",
    };
  }

  async updateCard(externalCardId: string, data: WalletCardData): Promise<WalletCardResult> {
    const object = this.buildObject(data);
    await this.api("PATCH", `/loyaltyObject/${encodeURIComponent(externalCardId)}`, object);

    return {
      externalCardId,
      walletUrlApple: null,
      walletUrlGoogle: this.saveUrl(externalCardId, object.classId),
      platform: "google",
    };
  }

  /**
   * Google has no hard delete for a pass already on someone's phone — the
   * documented way to retire one is to expire it, which removes it from the
   * active list without breaking passes already installed.
   */
  async deleteCard(externalCardId: string): Promise<void> {
    await this.api("PATCH", `/loyaltyObject/${encodeURIComponent(externalCardId)}`, {
      id: externalCardId,
      state: "EXPIRED",
    });
  }

  async getStatus(externalCardId: string): Promise<{ active: boolean }> {
    const obj = await this.api<{ state: string }>(
      "GET",
      `/loyaltyObject/${encodeURIComponent(externalCardId)}`
    );
    return { active: obj.state === "ACTIVE" };
  }

  async testConnection(): Promise<WalletConnectionStatus> {
    try {
      // Listing the issuer's classes is the cheapest call that exercises both
      // the service-account key and the issuer id.
      await this.api("GET", `/loyaltyClass?issuerId=${encodeURIComponent(this.issuerId)}`);
      return { ok: true, message: "تم الاتصال بـ Google Wallet بنجاح." };
    } catch (err) {
      return {
        ok: false,
        message: err instanceof Error ? err.message : "فشل الاتصال بـ Google Wallet.",
      };
    }
  }
}
