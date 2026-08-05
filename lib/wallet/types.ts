export type WalletCardData = {
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
   * Per-business PassKit Program + Tier — the pass template the business
   * owner designed in PassKit's own dashboard (see business_settings
   * .passkit_program_id/.passkit_tier_id). null until the owner sets it up;
   * providers should fail clearly rather than guess a template.
   */
  walletTemplate: {
    programId: string | null;
    tierId: string | null;
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
