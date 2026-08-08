import type { RewardType } from "@/types/database";

/**
 * Arabic labels for the reward-type picker, and what the value field means
 * for each — the same list drives the <select> and the value field's label,
 * so adding a type only means editing this one place.
 */
export const REWARD_TYPE_LABELS: Record<RewardType, string> = {
  free_item: "صنف مجاني",
  percent_discount: "خصم بنسبة مئوية",
  fixed_discount: "خصم بمبلغ ثابت",
  free_service: "خدمة مجانية",
  custom: "نص مخصص",
};

export const REWARD_VALUE_LABELS: Record<Exclude<RewardType, "custom">, string> = {
  free_item: "اسم الصنف",
  percent_discount: "نسبة الخصم (%)",
  fixed_discount: "مبلغ الخصم (ريال)",
  free_service: "اسم الخدمة",
};

export const REWARD_VALUE_PLACEHOLDERS: Record<Exclude<RewardType, "custom">, string> = {
  free_item: "قهوة",
  percent_discount: "25",
  fixed_discount: "2",
  free_service: "جلسة عناية",
};

const MAX_OFFER_TEXT_LENGTH = 60;

/**
 * Builds the "buy N, get X" sentence printed on the card from the
 * structured fields — never called for reward_type "custom", where the
 * owner writes offer_text directly instead.
 *
 * Kept as a pure function (no React, no server-only imports) so the same
 * logic drives the live preview in the client form and the server-side
 * validation in the action — one wording, not two that can drift apart.
 */
export function generateOfferText(
  threshold: number,
  rewardType: Exclude<RewardType, "custom">,
  rewardValue: string
): string {
  const value = rewardValue.trim();
  if (!value) return "";

  switch (rewardType) {
    case "free_item":
      return `اشترِ ${threshold} واحصل على ${value} مجانًا`;
    case "percent_discount":
      return `اشترِ ${threshold} واحصل على خصم ${value}٪`;
    case "fixed_discount":
      return `اشترِ ${threshold} واحصل على خصم ${value} ريال`;
    case "free_service":
      return `احضر ${threshold} مرات واحصل على ${value} مجانًا`;
  }
}

export function validateOfferText(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return "نص العرض مطلوب.";
  if (trimmed.length > MAX_OFFER_TEXT_LENGTH) {
    return `نص العرض طويل جدًا (الحد الأقصى ${MAX_OFFER_TEXT_LENGTH} حرفًا) — أطول من ذلك لا يُقرأ على البطاقة.`;
  }
  return null;
}
