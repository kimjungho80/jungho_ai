export type RatioOption = "1:1" | "4:5" | "16:9" | "9:16";
export type ImageSizeOption = "auto" | "1K" | "2K" | "4K";

export type GenerateMode = "prompt_only" | "prompt_and_image";

export type ImageModelOption =
  | "gemini-2.5-flash-image"
  | "gemini-3.1-flash-image-preview"
  | "gemini-3-pro-image-preview";

export type ShotTypeOption =
  | "full"
  | "upper"
  | "lower"
  | "selfie_upper"
  | "neck_crop";

export type CameraDistanceOption =
  | "close"
  | "normal"
  | "far"
  | "very_far";

export type PoseCategoryOption =
  | "recommended"
  | "general"
  | "general_sitting"
  | "general_chair"
  | "selfie"
  | "selfie_sitting"
  | "selfie_chair"
  | "wall_lean"
  | "floor_sitting"
  | "bed"
  | "back_view"
  | "walking"
  | "bag_focus";

export type GarmentKind = "top" | "bottom" | "dress" | "unknown";

export type PromptCard = {
    id: number;
  title: string;
  poseLabel: string;
  poseCategoryLabel: string;
  shotTypeLabel: string;
  distanceLabel: string;
  gaze: string;
  expression: string;
  prompt: string;
  imageDataUrl?: string | null;
  imageError?: string | null;
};

export type RefBucket =
  | "background"
  | "model"
  | "clothing1"
  | "clothing2"
  | "accessory1"
  | "accessory2";

export type RefItem = {
  index: number;
  bucket: RefBucket;
  fileName: string;
  mimeType: string;
  base64: string;
};

export type UserSelections = {
  ratio: RatioOption;
  imageSize: ImageSizeOption;
  imageModel: ImageModelOption;
  generateMode: GenerateMode;

  lighting: string;
  filmTone: string;
  style: string;

  shotType: ShotTypeOption;
  cameraDistance: CameraDistanceOption;
  poseCategories: PoseCategoryOption[];
  poseCount: number;

  gazeOption: string;
  expressionOption: string;
  hairstyle: string;
};

export const LIGHTING_MAP: Record<string, string> = {
  auto: [
    "Match the lighting direction and ambient light quality from the uploaded reference images whenever possible.",
    "If the references are mixed, prioritize commercially appealing fashion lighting with clear outfit visibility.",
  ].join(" "),
  soft_natural: [
    "Soft diffused natural daylight.",
    "No harsh shadow.",
    "Even skin tone rendering.",
    "Clean airy mood.",
    "Window light gently filling the scene.",
    "Avoid dramatic contrast.",
  ].join(" "),
  sunlit_natural: [
    "Bright sunlit natural light with visible sunlight streaks.",
    "Clear directional window light.",
    "Distinct warm highlights on hair, shoulders, and fabric.",
    "Soft but visible shadow shape.",
    "Fresh sunlit atmosphere.",
    "Do not make it flat or overcast.",
  ].join(" "),
  warm_indoor: [
    "Warm indoor ambient lighting.",
    "Golden tungsten tone.",
    "Cozy evening mood.",
    "Soft warm highlights with slightly deeper shadows.",
    "No cool daylight look.",
  ].join(" "),
  hotel_mood: [
    "Luxurious warm hotel-style lighting.",
    "Low contrast but rich golden ambience.",
    "Elegant shadow depth.",
    "Premium evening editorial mood.",
    "Refined interior glow.",
    "Do not make it casual daylight.",
  ].join(" "),
  studio_softbox: [
    "Professional studio softbox lighting.",
    "Balanced frontal illumination.",
    "Clear garment detail visibility.",
    "Controlled clean fashion catalog lighting.",
    "No natural window-light mood.",
  ].join(" "),
  sunset_glow: [
    "Golden sunset light.",
    "Orange-pink warmth on skin and outfit.",
    "Long soft shadows.",
    "Romantic emotional late-afternoon glow.",
    "Do not make it neutral daylight.",
  ].join(" "),
};

export const FILM_MAP: Record<string, string> = {
  auto: [
    "Choose the most commercially useful tone for Korean fashion e-commerce.",
    "If references are mixed, keep skin clean and fabric readable.",
  ].join(" "),
  clean_digital: [
    "Clean digital fashion photography.",
    "Sharp detail.",
    "Neutral white balance.",
    "Clear fabric texture.",
    "Minimal color cast.",
    "Commercially polished and realistic.",
  ].join(" "),
  warm_film: [
    "Warm analog film look.",
    "Soft contrast.",
    "Creamy skin rendering.",
    "Gentle highlight roll-off.",
    "Slight nostalgic warmth.",
    "Not digitally crisp.",
  ].join(" "),
  cream_tone: [
    "Soft creamy tonal palette.",
    "Bright but gentle highlights.",
    "Low harshness.",
    "Feminine elegant commercial mood.",
    "Subtle warmth without orange cast.",
  ].join(" "),
  vintage_faded: [
    "Slightly faded vintage film mood.",
    "Muted colors.",
    "Soft blacks.",
    "Low saturation.",
    "Retro editorial softness.",
    "Do not make it modern glossy.",
  ].join(" "),
  magazine_crisp: [
    "High-end fashion magazine tone.",
    "Crisp editorial detail.",
    "Refined contrast.",
    "Luxurious skin finish.",
    "Sharp but elegant garment presentation.",
  ].join(" "),
  iphone_real: [
    "Realistic iPhone photo look.",
    "Natural auto-exposure feel.",
    "Subtle lens realism.",
    "Authentic casual social-media tone.",
    "Not overly cinematic.",
  ].join(" "),
};

export const STYLE_MAP: Record<string, string> = {
  auto: [
    "Choose the most commercially effective Korean fashion output style for the provided garment.",
    "Prioritize realistic wearability and strong detail-page usability.",
  ].join(" "),
  ecommerce: [
    "Commercial Korean fashion e-commerce style.",
    "Clear outfit visibility.",
    "Natural body proportions.",
    "Garment fit and fabric texture must be easy to inspect.",
    "Clean product-focused composition.",
  ].join(" "),
  lookbook: [
    "Premium fashion lookbook style.",
    "Natural model storytelling.",
    "Balanced mood and outfit presentation.",
    "Elegant commercial lifestyle framing.",
  ].join(" "),
  daily_mood: [
    "Natural daily fashion mood.",
    "Casual realistic styling.",
    "Relaxed atmosphere.",
    "Soft lifestyle-oriented composition.",
  ].join(" "),
  editorial: [
    "Luxury editorial fashion magazine style.",
    "High-end styling energy.",
    "Stronger mood direction.",
    "Sophisticated composition and dramatic fashion presence.",
  ].join(" "),
  ugc: [
    "Authentic iPhone UGC content style.",
    "Natural handheld realism.",
    "Casual social-media aesthetic.",
    "Unforced pose and believable lighting.",
  ].join(" "),
  guestlook: [
    "Elegant occasionwear fashion campaign mood.",
    "Refined feminine styling.",
    "Clean luxurious atmosphere.",
    "Graceful posture and polished outfit presentation.",
  ].join(" "),
};

export const HAIR_MAP: Record<string, string> = {
  keep_uploaded: "Preserve the hairstyle from the uploaded model reference images.",
  auto: "Choose the most suitable commercially appealing hairstyle for this outfit while preserving the same face identity.",
  long_straight: "Preserve the same face identity, but change only the hairstyle to long straight hair.",
  c_curl: "Preserve the same face identity, but change only the hairstyle to a natural C-curl style.",
  wave: "Preserve the same face identity, but change only the hairstyle to a soft wave style.",
  low_bun: "Preserve the same face identity, but change only the hairstyle to a low bun.",
  ponytail: "Preserve the same face identity, but change only the hairstyle to a ponytail.",
  half_up: "Preserve the same face identity, but change only the hairstyle to a half-up hairstyle.",
  neat_updo: "Preserve the same face identity, but change only the hairstyle to a neat updo.",
  short_cut: "Preserve the same face identity, but change only the hairstyle to a short cut.",
  behind_ear: "Preserve the same face identity, but change only the hairstyle so it is tucked neatly behind the ear.",
};

export const GAZE_MAP: Record<string, string> = {
  auto: "Choose the gaze direction that best suits the pose and garment presentation.",
  front: "Looking directly at the camera.",
  slight_side: "Looking slightly to the side of the camera.",
  side: "Looking completely to the side.",
  down: "Looking down softly.",
  far: "Looking toward a distant point.",
  back_turn: "Turning back and glancing over the shoulder.",
  not_camera: "Not looking at the camera at all.",
  mirror: "Mirror-directed gaze suitable for a selfie or reflection shot.",
};

export const EXPRESSION_MAP: Record<string, string> = {
  auto: "Choose the most commercially appealing expression for this outfit and pose.",
  chic: "Calm chic expression with no broad smile.",
  soft_smile: "Soft calm expression with a faint natural smile.",
  bright_smile: "Bright natural smile.",
  calm: "Calm composed expression.",
  dreamy: "Gentle dreamy expression.",
  daily: "Natural relaxed daily-life expression.",
  focused: "Quiet focused expression.",
};

export function canUseImageSize(model: ImageModelOption) {
  return (
    model === "gemini-3.1-flash-image-preview" ||
    model === "gemini-3-pro-image-preview"
  );
}

export function normalizeImageSize(
  model: ImageModelOption,
  imageSize: ImageSizeOption
): ImageSizeOption {
  if (!canUseImageSize(model)) return "auto";
  return imageSize;
}

export function getShotTypeLabel(shotType: ShotTypeOption) {
  switch (shotType) {
    case "full":
      return "전신컷";
    case "upper":
      return "상반신컷";
    case "lower":
      return "하반신컷";
    case "selfie_upper":
      return "상반 셀카";
    case "neck_crop":
      return "목짤컷";
    default:
      return "전신컷";
  }
}

export function getCameraDistanceLabel(distance: CameraDistanceOption) {
  switch (distance) {
    case "close":
      return "가까움";
    case "normal":
      return "보통";
    case "far":
      return "멀게";
    case "very_far":
      return "아주 멀게";
    default:
      return "보통";
  }
}

export function getPoseCategoryLabel(pose: PoseCategoryOption) {
  switch (pose) {
    case "recommended":
      return "추천컷";
    case "general":
      return "일반컷";
    case "general_sitting":
      return "일반앉은컷";
    case "general_chair":
      return "일반의자컷";
    case "selfie":
      return "셀카컷";
    case "selfie_sitting":
      return "셀카앉은컷";
    case "selfie_chair":
      return "셀카의자컷";
    case "wall_lean":
      return "벽기댐컷";
    case "floor_sitting":
      return "바닥앉은컷";
    case "bed":
      return "침대컷";
    case "back_view":
      return "뒤돌아보는컷";
    case "walking":
      return "워킹컷";
    case "bag_focus":
      return "가방/소품 강조컷";
    default:
      return "추천컷";
  }
}

export function getShotFramingInstruction(shotType: ShotTypeOption) {
  switch (shotType) {
    case "full":
      return [
        "Full-body shot.",
        "Entire body from head to toe must be visible.",
        "Do not crop feet, legs, knees, ankles, or head.",
        "Keep the full outfit clearly readable.",
      ].join(" ");
    case "upper":
      return [
        "Upper-body shot.",
        "Frame from head to waist.",
        "Focus on face, neckline, shoulders, sleeves, and upper outfit details.",
      ].join(" ");
    case "lower":
      return [
        "Lower-body focused shot.",
        "Frame from waist to shoes.",
        "Clearly show skirt, pants, hemline, fit, and footwear balance.",
      ].join(" ");
    case "selfie_upper":
      return [
        "Upper-body selfie shot.",
        "Slight high-angle selfie perspective.",
        "Camera held by the subject.",
        "Frame from chest to head, and partial face crop is acceptable if natural.",
        "Focus on upper outfit fit, neckline, body line, and natural Korean SNS selfie composition.",
      ].join(" ");
    case "neck_crop":
      return [
        "Neck crop shot.",
        "Frame from lips or nose-bottom level down to the chest or upper torso.",
        "Do not show the full face.",
        "Focus on neckline, collarbone area, upper garment fit, and detail presentation.",
      ].join(" ");
    default:
      return "Full-body shot. Entire body from head to toe must be visible.";
  }
}

export function getCameraDistanceInstruction(distance: CameraDistanceOption) {
  switch (distance) {
    case "close":
      return [
        "Subject appears relatively large in frame.",
        "Tighter composition.",
        "Less empty space around the model.",
      ].join(" ");
    case "normal":
      return [
        "Balanced fashion composition.",
        "Natural amount of space around the model.",
        "Commercial standard framing.",
      ].join(" ");
    case "far":
      return [
        "Camera is positioned farther from the subject.",
        "Show more space around the model.",
        "The subject should appear smaller within the frame.",
        "Leave comfortable breathing room above the head and below the feet.",
        "Do not frame the subject too tightly.",
      ].join(" ");
    case "very_far":
      return [
        "Camera is positioned much farther away from the subject.",
        "The model must occupy a clearly smaller portion of the frame.",
        "Show generous surrounding space and room ambience.",
        "Leave large visible margin above the head, beside the arms, and below the feet.",
        "Avoid a tight full-body composition.",
        "Do not zoom in.",
        "The subject should appear at a distance, with the background clearly visible.",
        "The model should not fill most of the frame.",
        "Keep strong negative space around the subject.",
      ].join(" ");
    default:
      return "Balanced fashion composition with natural space around the model.";
  }
}

function bucketLabel(bucket: RefBucket) {
  switch (bucket) {
    case "background":
      return "background reference";
    case "model":
      return "model reference";
    case "clothing1":
      return "primary clothing reference";
    case "clothing2":
      return "secondary clothing reference";
    case "accessory1":
      return "primary accessory reference";
    case "accessory2":
      return "secondary accessory reference";
    default:
      return "reference";
  }
}

function groupRefsByBucket(items: RefItem[]) {
  return {
    background: items.filter((v) => v.bucket === "background"),
    model: items.filter((v) => v.bucket === "model"),
    clothing1: items.filter((v) => v.bucket === "clothing1"),
    clothing2: items.filter((v) => v.bucket === "clothing2"),
    accessory1: items.filter((v) => v.bucket === "accessory1"),
    accessory2: items.filter((v) => v.bucket === "accessory2"),
  };
}

function joinImageIndexes(items: RefItem[]) {
  if (!items.length) return "";
  if (items.length === 1) return `Image ${items[0].index}`;
  return `Images ${items.map((v) => v.index).join(", ")}`;
}

export function buildReferenceMapText(items: RefItem[]) {
  if (!items.length) return "No reference images uploaded.";

  return items
    .map(
      (item) =>
        `Image ${item.index}: ${bucketLabel(item.bucket)} (${item.fileName})`
    )
    .join("\n");
}

export function buildReferenceBlocks(items: RefItem[]) {
  const byBucket = groupRefsByBucket(items);
  const lines: string[] = [];

  lines.push("[REFERENCE MAPPING]");

  if (byBucket.background.length) {
    lines.push(
      `- ${joinImageIndexes(byBucket.background)}: background reference`
    );
  }
  if (byBucket.model.length) {
    lines.push(`- ${joinImageIndexes(byBucket.model)}: model reference`);
  }
  if (byBucket.clothing1.length) {
    lines.push(
      `- ${joinImageIndexes(byBucket.clothing1)}: primary clothing reference`
    );
  }
  if (byBucket.clothing2.length) {
    lines.push(
      `- ${joinImageIndexes(byBucket.clothing2)}: secondary clothing reference`
    );
  }
  if (byBucket.accessory1.length) {
    lines.push(
      `- ${joinImageIndexes(byBucket.accessory1)}: primary accessory reference`
    );
  }
  if (byBucket.accessory2.length) {
    lines.push(
      `- ${joinImageIndexes(byBucket.accessory2)}: secondary accessory reference`
    );
  }

  lines.push("");
  lines.push("[BACKGROUND LOCK]");
  if (byBucket.background.length) {
    lines.push(
      `Use ${joinImageIndexes(
        byBucket.background
      )} as the background reference. Preserve composition, lighting direction, mood, and interior or exterior styling.`
    );
  } else {
    lines.push(
      "Create a commercially appealing fashion background that matches the selected style."
    );
  }

  lines.push("");
  lines.push("[MODEL LOCK]");
  if (byBucket.model.length) {
    lines.push(
      `Use ${joinImageIndexes(
        byBucket.model
      )} as the primary model reference. Preserve the same facial identity, proportions, body balance, skin tone, and overall Korean beauty style.`
    );
  } else {
    lines.push(
      "Use a natural Korean fashion model with realistic body proportions and a commercially appealing presence."
    );
  }

  lines.push("");
  lines.push("[UPLOADED GARMENT REFERENCES]");
  if (byBucket.clothing1.length) {
    lines.push(
      `Use ${joinImageIndexes(
        byBucket.clothing1
      )} as uploaded clothing reference group 1. Preserve silhouette, neckline, sleeve shape, fit, length, seam lines, design points, and fabric texture exactly.`
    );
  }
  if (byBucket.clothing2.length) {
    lines.push(
      `Use ${joinImageIndexes(
        byBucket.clothing2
      )} as uploaded clothing reference group 2. Preserve silhouette, fit, length, seam lines, design points, and fabric texture exactly.`
    );
  }
  if (!byBucket.clothing1.length && !byBucket.clothing2.length) {
    lines.push("No clothing reference image was uploaded.");
  }

  lines.push("");
  lines.push("[ACCESSORY REFERENCES]");
  if (byBucket.accessory1.length) {
    lines.push(
      `Use ${joinImageIndexes(
        byBucket.accessory1
      )} as the primary accessory reference.`
    );
  }
  if (byBucket.accessory2.length) {
    lines.push(
      `Use ${joinImageIndexes(
        byBucket.accessory2
      )} as the secondary accessory reference.`
    );
  }
  if (!byBucket.accessory1.length && !byBucket.accessory2.length) {
    lines.push("No accessory reference image was uploaded.");
  }

  return lines.join("\n");
}

export function buildGarmentRuleBlock(args: {
  hasTopReference: boolean;
  hasBottomReference: boolean;
  hasDressReference: boolean;
  recommendedTop?: string;
  recommendedBottom?: string;
}) {
  const {
    hasTopReference,
    hasBottomReference,
    hasDressReference,
    recommendedTop,
    recommendedBottom,
  } = args;

  const lines: string[] = [];
  lines.push("[GARMENT RULES]");

  if (hasDressReference) {
    lines.push(
      "The uploaded clothing includes a dress or one-piece. Preserve the uploaded dress exactly."
    );
    lines.push(
      "Do not add a separate top or bottom."
    );
    lines.push(
      "Do not layer an extra blouse, skirt, or pants unless explicitly requested."
    );
    lines.push(
      "Keep the dress as the main standalone garment."
    );
    return lines.join("\n");
  }

  if (hasTopReference && hasBottomReference) {
    lines.push(
      "Both top and bottom are uploaded. Preserve both uploaded garments exactly."
    );
    lines.push(
      "Do not replace either garment with a newly invented alternative."
    );
    lines.push(
      "Do not recommend a new top or a new bottom."
    );
    return lines.join("\n");
  }

  if (hasTopReference && !hasBottomReference) {
    lines.push(
      "A top reference is uploaded. Preserve the uploaded top exactly."
    );
    lines.push(
      "Do not alter or replace the uploaded top."
    );
    lines.push(
      recommendedBottom
        ? `Recommend only a matching bottom for styling: ${recommendedBottom}`
        : "Recommend only a matching commercially appealing bottom."
    );
    return lines.join("\n");
  }

  if (!hasTopReference && hasBottomReference) {
    lines.push(
      "A bottom reference is uploaded. Preserve the uploaded bottom exactly."
    );
    lines.push(
      "Do not alter or replace the uploaded bottom."
    );
    lines.push(
      recommendedTop
        ? `Recommend only a matching top for styling: ${recommendedTop}`
        : "Recommend only a matching commercially appealing top."
    );
    return lines.join("\n");
  }

  lines.push(
    "If clothing references are unclear, stay faithful to the uploaded clothing references and avoid inventing replacement garments."
  );
  if (recommendedTop) {
    lines.push(`Optional recommended top: ${recommendedTop}`);
  }
  if (recommendedBottom) {
    lines.push(`Optional recommended bottom: ${recommendedBottom}`);
  }

  return lines.join("\n");
}

export function buildBasePrompt(args: {
  refBlocks: string;
  analysisSummary: string;
  garmentRuleBlock: string;
  hairInstruction: string;
  lightingInstruction: string;
  filmInstruction: string;
  styleInstruction: string;
  shotFramingInstruction: string;
  cameraDistanceInstruction: string;
  ratio: RatioOption;
}) {
  const {
    refBlocks,
    analysisSummary,
    garmentRuleBlock,
    hairInstruction,
    lightingInstruction,
    filmInstruction,
    styleInstruction,
    shotFramingInstruction,
    cameraDistanceInstruction,
    ratio,
  } = args;

  return [
    "Use the uploaded images as explicit visual references.",
    "",
    refBlocks,
    "",
    "[ANALYSIS / STYLING NOTES]",
    analysisSummary || "Use the uploaded references faithfully.",
    "",
    garmentRuleBlock,
    "",
    "[SHOT FRAMING]",
    shotFramingInstruction,
    "",
    "[CAMERA DISTANCE]",
    cameraDistanceInstruction,
    "",
    "[HAIR]",
    hairInstruction,
    "",
    "[LIGHTING]",
    lightingInstruction,
    "",
    "[FILM / TONE]",
    filmInstruction,
    "",
    "[STYLE]",
    styleInstruction,
    "",
    "[QUALITY RULES]",
    "Preserve realistic fabric texture and garment construction details.",
    "Preserve natural body proportions.",
    "Do not distort face identity when model references are provided.",
    "Do not replace uploaded garments with newly invented alternatives.",
    "Keep the clothing commercially appealing and realistic for Korean fashion e-commerce or lookbook usage.",
    "",
    "[OUTPUT]",
    `Aspect ratio: ${ratio}.`,
    "High resolution, high detail, realistic Korean fashion photography.",
  ].join("\n");
}

export function combinePrompt(
  basePrompt: string,
  pose: string,
  gaze: string,
  expression: string
) {
  return [
    basePrompt,
    "",
    "[POSE]",
    pose,
    "",
    "[GAZE]",
    gaze,
    "",
    "[EXPRESSION]",
    expression,
  ].join("\n");
}

export function buildAllPromptsText(cards: PromptCard[]) {
  return cards
    .map(
      (card) =>
        `===== ${card.title} | ${card.poseCategoryLabel} | ${card.shotTypeLabel} | ${card.distanceLabel} =====\n${card.prompt}`
    )
    .join("\n\n");
}