export type WalletCardData = {
  /**
   * The wallet_cards row id. This is the value encoded in the pass's QR
   * barcode, and it is what /employee/scan resolves back to a customer — so
   * a provider that drops it produces a pass that cannot earn points.
   */
  walletCardId: string;
  business: {
    name: string;
    logoUrl: string | null;
    primaryColor: string;
    secondaryColor: string;
  };
  customer: {
    id: string;
    name: string;
    memberId: string;
  };
  loyalty: {
    points: number;
    rewardThreshold: number | null;
  };
  /**
   * The per-business pass template. Each provider names it differently and
   * uses only its own fields:
   *   - PassKit: Program + Tier, created in PassKit's dashboard
   *     (business_settings.passkit_program_id / .passkit_tier_id)
   *   - Google Wallet: a LoyaltyClass id
   *     (business_settings.google_wallet_class_id)
   * All null until the owner sets it up; providers fail with a clear message
   * rather than guessing a template.
   */
  walletTemplate: {
    programId: string | null;
    tierId: string | null;
    googleClassId: string | null;
  };
};

export type WalletCardResult = {
  externalCardId: string;
  walletUrlApple: string | null;
  walletUrlGoogle: string | null;
  platform: "apple" | "google" | "both";
};

export type WalletConnectionStatus = {
  ok: boolean;
  message: string;
};

/**
 * Provider-agnostic interface (06_Wallet_Integration.md section 5). Any
 * wallet pass vendor (PassKit today, another provider tomorrow) implements
 * this — callers in lib/wallet/sync.ts never import a provider directly.
 */
export interface WalletProvider {
  createCard(data: WalletCardData): Promise<WalletCardResult>;
  updateCard(externalCardId: string, data: WalletCardData): Promise<WalletCardResult>;
  deleteCard(externalCardId: string): Promise<void>;
  getStatus(externalCardId: string): Promise<{ active: boolean }>;
  testConnection(): Promise<WalletConnectionStatus>;
}
