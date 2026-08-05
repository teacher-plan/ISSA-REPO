import "server-only";
import { createHmac } from "node:crypto";
import type {
  WalletCardData,
  WalletCardResult,
  WalletConnectionStatus,
  WalletProvider,
} from "../types";

/**
 * PassKit REST API adapter (docs.passkit.io — Members API).
 *
 * Verified against PassKit's published OpenAPI spec and help-center code
 * samples. Two things are NOT contractually documented and should be
 * confirmed against a real sandbox account before relying on them in
 * production:
 *   1. The exact Authorization header format for a self-signed JWT (this
 *      uses the no-"Bearer"-prefix form from PassKit's own Apps Script
 *      example; their separate long-lived-token flow does use "Bearer ").
 *   2. The pass install URL is not returned by any API response — it's
 *      constructed client-side per PassKit's docs as
 *      https://pub{1|2}.pskt.io/{memberId}[.pkpass|.gpay].
 *
 * Each business owner creates their own Program + Tier (+ pass template)
 * in PassKit's dashboard — this adapter never designs a pass, only enrolls
 * members into an existing template (business_settings.passkit_program_id /
 * .passkit_tier_id).
 */

const BASE_URL = "https://api.pub1.passkit.io"; // EU region; pub2 = US
const PASS_URL_HOST = "pub1.pskt.io";

function base64url(input: Buffer): string {
  return input
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export class PassKitProvider implements WalletProvider {
  constructor(
    private readonly apiKey: string,
    private readonly apiSecret: string
  ) {}

  private signToken(): string {
    const now = Math.floor(Date.now() / 1000);
    const header = base64url(Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })));
    const payload = base64url(
      Buffer.from(JSON.stringify({ uid: this.apiKey, iat: now, exp: now + 3600 }))
    );
    const signature = base64url(
      createHmac("sha256", this.apiSecret).update(`${header}.${payload}`).digest()
    );
    return `${header}.${payload}.${signature}`;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: this.signToken(),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`PassKit API error ${res.status}: ${text || res.statusText}`);
    }

    return (await res.json()) as T;
  }

  private buildUrls(memberId: string): {
    apple: string;
    google: string;
  } {
    return {
      apple: `https://${PASS_URL_HOST}/${memberId}.pkpass`,
      google: `https://${PASS_URL_HOST}/${memberId}.gpay`,
    };
  }

  async createCard(data: WalletCardData): Promise<WalletCardResult> {
    const { programId, tierId } = data.walletTemplate;
    if (!programId || !tierId) {
      throw new Error("لم يتم إعداد قالب PassKit لهذا المحل (Program/Tier ID مفقود).");
    }

    const result = await this.request<{ id: string }>("POST", "/members/member", {
      externalId: data.customer.id,
      programId,
      tierId,
      person: { displayName: data.customer.name },
      points: data.loyalty.points,
    });

    const urls = this.buildUrls(result.id);
    return {
      externalCardId: result.id,
      walletUrlApple: urls.apple,
      walletUrlGoogle: urls.google,
      platform: "both",
    };
  }

  async updateCard(
    externalCardId: string,
    data: WalletCardData
  ): Promise<WalletCardResult> {
    await this.request("PUT", "/members/member/points/set", {
      id: externalCardId,
      points: data.loyalty.points,
    });

    const urls = this.buildUrls(externalCardId);
    return {
      externalCardId,
      walletUrlApple: urls.apple,
      walletUrlGoogle: urls.google,
      platform: "both",
    };
  }

  async deleteCard(externalCardId: string): Promise<void> {
    await this.request("PUT", "/members/member", {
      id: externalCardId,
      status: "DELETED",
      operation: "PATCH",
    });
  }

  async getStatus(externalCardId: string): Promise<{ active: boolean }> {
    const member = await this.request<{ status?: string }>(
      "GET",
      `/members/member/id/${externalCardId}`
    );
    return { active: member.status === "ACTIVE" || member.status === "ENROLLED" };
  }

  async testConnection(): Promise<WalletConnectionStatus> {
    try {
      await this.request("GET", "/user/profile");
      return { ok: true, message: "الاتصال ناجح." };
    } catch (err) {
      return {
        ok: false,
        message: err instanceof Error ? err.message : "فشل الاتصال بـ PassKit.",
      };
    }
  }
}
