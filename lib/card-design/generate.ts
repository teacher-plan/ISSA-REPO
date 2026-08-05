import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { cardThemeSchema, sanitizeTheme, type CardTheme } from "./theme";
import { BUSINESS_KIND_LABELS, type BusinessKind } from "./kinds";

export { BUSINESS_KIND_LABELS };
export type { BusinessKind };

export type GenerateInput = {
  businessName: string;
  kind: BusinessKind;
  /** The owner's brand colour, if they have one. Free-form hex. */
  brandColor?: string | null;
  /** Anything the owner wants to steer with, in their own words. */
  notes?: string | null;
};

export type GenerateResult =
  | { ok: true; theme: CardTheme; warnings: string[] }
  | { ok: false; error: string };

const SYSTEM = `أنت مصمم هوية بصرية متخصص في بطاقات الولاء الرقمية لسوق الخليج.

تُعطى معلومات محل، وتُخرج هوية لون للبطاقة.

قواعد:
- البطاقة تعرض رصيد نقاط كبير وصف نقاط عليها، فالخلفية يجب أن تُبقيها مقروءة بوضوح.
- التدرّج بين اللونين يجب أن يكون واضحًا لكن ضمن نفس العائلة اللونية — لا تدرّجات صاخبة بين ألوان متضادة.
- اختر ألوانًا تناسب نوع النشاط: المقاهي دافئة وترابية، الصيدليات هادئة وطبية، النوادي الرياضية حيوية، المغاسل نظيفة وباردة.
- إن أعطاك صاحب المحل لونًا، اجعله أساس التدرّج ولا تتجاهله.
- الشعار (tagline) بالعربية الفصحى المبسّطة، أربع كلمات كحد أقصى، بلا رموز تعبيرية وبلا علامات تعجب.`;

/**
 * Generates a card identity for one business.
 *
 * Uses structured outputs so the response is schema-valid by construction —
 * the alternative is parsing prose for hex codes, which fails in ways that only
 * show up on a customer's card. The returned theme is still passed through
 * sanitizeTheme(): a schema guarantees the *shape*, not that the colours are
 * readable.
 */
export async function generateCardTheme(
  input: GenerateInput
): Promise<GenerateResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      ok: false,
      error: "لم يتم ضبط مفتاح ANTHROPIC_API_KEY على الخادم.",
    };
  }

  const client = new Anthropic();

  const brief = [
    `اسم المحل: ${input.businessName}`,
    `نوع النشاط: ${BUSINESS_KIND_LABELS[input.kind]}`,
    input.brandColor ? `لون العلامة: ${input.brandColor}` : "لا يوجد لون علامة محدد",
    input.notes ? `ملاحظات صاحب المحل: ${input.notes}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const response = await client.messages.parse({
      model: "claude-opus-5",
      max_tokens: 2048,
      system: SYSTEM,
      output_config: { format: zodOutputFormat(cardThemeSchema) },
      messages: [{ role: "user", content: brief }],
    });

    // A safety refusal returns HTTP 200 with stop_reason "refusal" and no
    // parsed output — check it before reading, or this throws on `.backgroundFrom`.
    if (response.stop_reason === "refusal") {
      return { ok: false, error: "تعذّر توليد تصميم لهذا الطلب. جرّب وصفًا مختلفًا." };
    }
    if (!response.parsed_output) {
      return { ok: false, error: "لم يُرجع النموذج تصميمًا صالحًا. أعد المحاولة." };
    }

    const { theme, warnings } = sanitizeTheme(response.parsed_output);
    return { ok: true, theme, warnings };
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return { ok: false, error: "الخدمة مزدحمة حاليًا. أعد المحاولة بعد قليل." };
    }
    if (err instanceof Anthropic.AuthenticationError) {
      return { ok: false, error: "مفتاح ANTHROPIC_API_KEY غير صالح." };
    }
    if (err instanceof Anthropic.APIError) {
      return { ok: false, error: `تعذّر توليد التصميم (${err.status}).` };
    }
    return { ok: false, error: "تعذّر الاتصال بخدمة التصميم." };
  }
}
