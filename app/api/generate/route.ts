import { GoogleGenAI } from "@google/genai";
import {
  buildBasePrompt,
  buildGarmentRuleBlock,
  buildReferenceBlocks,
  buildReferenceMapText,
  canUseImageSize,
  CameraDistanceOption,
  combinePrompt,
  EXPRESSION_MAP,
  FILM_MAP,
  GarmentKind,
  GAZE_MAP,
  getCameraDistanceInstruction,
  getCameraDistanceLabel,
  getPoseCategoryLabel,
  getShotFramingInstruction,
  getShotTypeLabel,
  HAIR_MAP,
  LIGHTING_MAP,
  normalizeImageSize,
  PoseCategoryOption,
  PromptCard,
  RefItem,
  ShotTypeOption,
  STYLE_MAP,
  UserSelections,
} from "@/lib/fitbuilder";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

type AnalysisPoseSuggestion = {
  poseCategory: PoseCategoryOption;
  poseLabel: string;
  posePrompt: string;
  suggestedGaze: string;
  suggestedExpression: string;
};

type AnalysisResult = {
  clothingSummary: string;
  overallMood: string;
  hairSummary: string;

  hasTopReference: boolean;
  hasBottomReference: boolean;
  hasDressReference: boolean;

  primaryGarmentKind: GarmentKind;
  secondaryGarmentKind: GarmentKind;

  recommendedTop: string;
  recommendedBottom: string;

  poseSuggestions: AnalysisPoseSuggestion[];
};

type NotesInput = {
  backgroundNote: string;
  modelNote: string;
  clothing1Note: string;
  clothing2Note: string;
  accessory1Note: string;
  accessory2Note: string;
  extraInstructions: string;
};

function safeJsonParse<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    const cleaned = text
      .replace(/^```json/i, "")
      .replace(/^```/i, "")
      .replace(/```$/i, "")
      .trim();

    try {
      return JSON.parse(cleaned) as T;
    } catch {
      return fallback;
    }
  }
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function parseNotes(formData: FormData): NotesInput {
  return {
    backgroundNote: getString(formData, "backgroundNote"),
    modelNote: getString(formData, "modelNote"),
    clothing1Note: getString(formData, "clothing1Note"),
    clothing2Note: getString(formData, "clothing2Note"),
    accessory1Note: getString(formData, "accessory1Note"),
    accessory2Note: getString(formData, "accessory2Note"),
    extraInstructions: getString(formData, "extraInstructions"),
  };
}

async function fileToRefItem(
  file: File,
  bucket: RefItem["bucket"],
  index: number
): Promise<RefItem> {
  const buffer = Buffer.from(await file.arrayBuffer());

  return {
    index,
    bucket,
    fileName: file.name,
    mimeType: file.type || "image/jpeg",
    base64: buffer.toString("base64"),
  };
}

async function collectReferenceItems(formData: FormData): Promise<RefItem[]> {
  let currentIndex = 1;
  const refs: RefItem[] = [];

  const backgroundFiles = formData.getAll("backgroundImages") as File[];
  const modelFiles = formData.getAll("modelImages") as File[];
  const clothing1Files = formData.getAll("clothing1Images") as File[];
  const clothing2Files = formData.getAll("clothing2Images") as File[];
  const accessory1Files = formData.getAll("accessory1Images") as File[];
  const accessory2Files = formData.getAll("accessory2Images") as File[];

  for (const file of backgroundFiles) {
    if (file && file.size > 0) {
      refs.push(await fileToRefItem(file, "background", currentIndex++));
    }
  }
  for (const file of modelFiles) {
    if (file && file.size > 0) {
      refs.push(await fileToRefItem(file, "model", currentIndex++));
    }
  }
  for (const file of clothing1Files) {
    if (file && file.size > 0) {
      refs.push(await fileToRefItem(file, "clothing1", currentIndex++));
    }
  }
  for (const file of clothing2Files) {
    if (file && file.size > 0) {
      refs.push(await fileToRefItem(file, "clothing2", currentIndex++));
    }
  }
  for (const file of accessory1Files) {
    if (file && file.size > 0) {
      refs.push(await fileToRefItem(file, "accessory1", currentIndex++));
    }
  }
  for (const file of accessory2Files) {
    if (file && file.size > 0) {
      refs.push(await fileToRefItem(file, "accessory2", currentIndex++));
    }
  }

  return refs;
}

function parsePoseCategories(raw: string): PoseCategoryOption[] {
  const parsed = safeJsonParse<string[]>(raw || "[]", []);
  const allowed: PoseCategoryOption[] = [
    "recommended",
    "general",
    "general_sitting",
    "general_chair",
    "selfie",
    "selfie_sitting",
    "selfie_chair",
    "wall_lean",
    "floor_sitting",
    "bed",
    "back_view",
    "walking",
    "bag_focus",
  ];

  const filtered = parsed.filter((v): v is PoseCategoryOption =>
    allowed.includes(v as PoseCategoryOption)
  );

  return filtered.length ? filtered : ["recommended"];
}

function parseSelections(formData: FormData): UserSelections {
  const poseCountRaw = Number(getString(formData, "poseCount") || "1");
  const poseCount = [1, 3, 5, 10, 20].includes(poseCountRaw) ? poseCountRaw : 1;

  const shotType = (getString(formData, "shotType") as ShotTypeOption) || "full";
  const cameraDistance =
    (getString(formData, "cameraDistance") as CameraDistanceOption) || "far";

  return {
    ratio: (formData.get("ratio") as UserSelections["ratio"]) || "4:5",
    imageSize: (formData.get("imageSize") as UserSelections["imageSize"]) || "1K",
    imageModel:
      (formData.get("imageModel") as UserSelections["imageModel"]) ||
      "gemini-3.1-flash-image-preview",
    generateMode:
      (formData.get("generateMode") as UserSelections["generateMode"]) ||
      "prompt_only",

    lighting: getString(formData, "lighting") || "auto",
    filmTone: getString(formData, "filmTone") || "auto",
    style: getString(formData, "style") || "ecommerce",

    shotType,
    cameraDistance,
    poseCategories: parsePoseCategories(getString(formData, "poseCategories")),
    poseCount,

    gazeOption: getString(formData, "gazeOption") || "auto",
    expressionOption: getString(formData, "expressionOption") || "auto",
    hairstyle: getString(formData, "hairstyle") || "keep_uploaded",
  };
}

function buildNotesText(notes: NotesInput) {
  const sections = [
    notes.backgroundNote ? `- Background note: ${notes.backgroundNote}` : "",
    notes.modelNote ? `- Model note: ${notes.modelNote}` : "",
    notes.clothing1Note ? `- Clothing 1 note: ${notes.clothing1Note}` : "",
    notes.clothing2Note ? `- Clothing 2 note: ${notes.clothing2Note}` : "",
    notes.accessory1Note ? `- Accessory 1 note: ${notes.accessory1Note}` : "",
    notes.accessory2Note ? `- Accessory 2 note: ${notes.accessory2Note}` : "",
    notes.extraInstructions ? `- Extra instructions: ${notes.extraInstructions}` : "",
  ].filter(Boolean);

  return sections.length > 0
    ? sections.join("\n")
    : "No extra text notes were provided.";
}

function distributePoseCategories(
  categories: PoseCategoryOption[],
  count: number
): PoseCategoryOption[] {
  const list = categories.length ? categories : ["recommended"];
  return Array.from({ length: count }, (_, i) => list[i % list.length]);
}

function getFallbackPosePrompt(
  poseCategory: PoseCategoryOption,
  index: number,
  shotType: ShotTypeOption
): AnalysisPoseSuggestion {
  const n = index + 1;

  switch (poseCategory) {
    case "recommended":
      return {
        poseCategory,
        poseLabel: `추천컷 ${n}`,
        posePrompt:
          "Use a commercially appealing recommended pose that best suits the uploaded outfit, background, and styling mood. Examples may include leaning on a wall, sitting naturally on the floor, light bed pose, or a relaxed fashion posture, but only one pose in this image.",
        suggestedGaze: "Looking slightly to the side of the camera.",
        suggestedExpression: "Calm composed expression.",
      };
    case "general":
      return {
        poseCategory,
        poseLabel: `일반컷 ${n}`,
        posePrompt:
          "Standing naturally facing the camera or slightly angled, clear commercially useful fashion pose with outfit visibility.",
        suggestedGaze: "Looking directly at the camera.",
        suggestedExpression: "Soft calm expression with a faint natural smile.",
      };
    case "general_sitting":
      return {
        poseCategory,
        poseLabel: `일반앉은컷 ${n}`,
        posePrompt:
          "Natural sitting pose on the floor or low surface, relaxed posture, outfit silhouette clearly visible.",
        suggestedGaze: "Looking slightly to the side of the camera.",
        suggestedExpression: "Calm composed expression.",
      };
    case "general_chair":
      return {
        poseCategory,
        poseLabel: `일반의자컷 ${n}`,
        posePrompt:
          "Seated naturally on a chair with relaxed posture, commercially appealing outfit presentation and clean silhouette visibility.",
        suggestedGaze: "Looking down softly.",
        suggestedExpression: "Soft calm expression with a faint natural smile.",
      };
    case "selfie":
      return {
        poseCategory,
        poseLabel: `셀카컷 ${n}`,
        posePrompt:
          shotType === "selfie_upper"
            ? "Natural upper-body selfie pose with slight high angle, phone-held composition, realistic Korean SNS mood, upper outfit and body line clearly visible."
            : "Natural selfie pose holding the phone, casual realistic posture, outfit-focused composition.",
        suggestedGaze: "Mirror-directed gaze suitable for a selfie or reflection shot.",
        suggestedExpression: "Natural relaxed daily-life expression.",
      };
    case "selfie_sitting":
      return {
        poseCategory,
        poseLabel: `셀카앉은컷 ${n}`,
        posePrompt:
          "Natural sitting selfie pose with phone-held composition, relaxed posture, realistic Korean SNS style, only one clear selfie pose.",
        suggestedGaze: "Mirror-directed gaze suitable for a selfie or reflection shot.",
        suggestedExpression: "Natural relaxed daily-life expression.",
      };
    case "selfie_chair":
      return {
        poseCategory,
        poseLabel: `셀카의자컷 ${n}`,
        posePrompt:
          "Chair-seated selfie pose with phone in hand, natural body angle, commercially useful outfit-focused selfie composition.",
        suggestedGaze: "Mirror-directed gaze suitable for a selfie or reflection shot.",
        suggestedExpression: "Soft calm expression with a faint natural smile.",
      };
    case "wall_lean":
      return {
        poseCategory,
        poseLabel: `벽기댐컷 ${n}`,
        posePrompt:
          "Leaning naturally against the wall, commercially appealing fashion posture, only one clear wall-lean pose.",
        suggestedGaze: "Looking toward a distant point.",
        suggestedExpression: "Calm composed expression.",
      };
    case "floor_sitting":
      return {
        poseCategory,
        poseLabel: `바닥앉은컷 ${n}`,
        posePrompt:
          "Sitting on the floor naturally, with relaxed legs and clear outfit visibility, only one floor-sitting pose.",
        suggestedGaze: "Looking down softly.",
        suggestedExpression: "Gentle dreamy expression.",
      };
    case "bed":
      return {
        poseCategory,
        poseLabel: `침대컷 ${n}`,
        posePrompt:
          "Natural fashion pose on a bed, such as sitting, side leaning, or light prone styling, but only one single bed pose in this image.",
        suggestedGaze: "Not looking at the camera at all.",
        suggestedExpression: "Gentle dreamy expression.",
      };
    case "back_view":
      return {
        poseCategory,
        poseLabel: `뒤돌아보는컷 ${n}`,
        posePrompt:
          "Back-view or over-shoulder turning pose that clearly shows outfit silhouette from the back or side-back angle.",
        suggestedGaze: "Turning back and glancing over the shoulder.",
        suggestedExpression: "Calm chic expression with no broad smile.",
      };
    case "walking":
      return {
        poseCategory,
        poseLabel: `워킹컷 ${n}`,
        posePrompt:
          "Natural mid-step walking pose with realistic garment movement and clean outfit visibility.",
        suggestedGaze: "Looking toward a distant point.",
        suggestedExpression: "Natural relaxed daily-life expression.",
      };
    case "bag_focus":
      return {
        poseCategory,
        poseLabel: `가방/소품 강조컷 ${n}`,
        posePrompt:
          "Commercial pose that naturally emphasizes the bag or accessory while keeping the outfit readable, only one clear accessory-focused pose.",
        suggestedGaze: "Looking slightly to the side of the camera.",
        suggestedExpression: "Soft calm expression with a faint natural smile.",
      };
    default:
      return {
        poseCategory: "recommended",
        poseLabel: `추천컷 ${n}`,
        posePrompt:
          "Commercially appealing recommended pose suited to the outfit and background.",
        suggestedGaze: "Looking slightly to the side of the camera.",
        suggestedExpression: "Calm composed expression.",
      };
  }
}

function getFallbackAnalysis(
  poseCategories: PoseCategoryOption[],
  shotType: ShotTypeOption,
  poseCount: number
): AnalysisResult {
  const distributed = distributePoseCategories(poseCategories, poseCount);

  return {
    clothingSummary:
      "Use the uploaded clothing references faithfully. Keep silhouette, neckline, sleeves, fit, length, seam lines, and fabric texture visible and commercially appealing.",
    overallMood:
      "Clean Korean fashion e-commerce mood with realistic detail presentation.",
    hairSummary: "Keep hairstyle natural and commercially appealing.",

    hasTopReference: true,
    hasBottomReference: false,
    hasDressReference: false,

    primaryGarmentKind: "top",
    secondaryGarmentKind: "unknown",

    recommendedTop: "",
    recommendedBottom:
      "Choose a commercially appealing matching bottom such as refined slacks, a clean skirt, or simple denim depending on the uploaded top mood.",

    poseSuggestions: distributed.map((poseCategory, i) =>
      getFallbackPosePrompt(poseCategory, i, shotType)
    ),
  };
}

function buildNotesSummary(notes: NotesInput) {
  const lines = [
    notes.backgroundNote ? `Background note: ${notes.backgroundNote}` : "",
    notes.modelNote ? `Model note: ${notes.modelNote}` : "",
    notes.clothing1Note ? `Clothing 1 note: ${notes.clothing1Note}` : "",
    notes.clothing2Note ? `Clothing 2 note: ${notes.clothing2Note}` : "",
    notes.accessory1Note ? `Accessory 1 note: ${notes.accessory1Note}` : "",
    notes.accessory2Note ? `Accessory 2 note: ${notes.accessory2Note}` : "",
    notes.extraInstructions ? `Extra instructions: ${notes.extraInstructions}` : "",
  ].filter(Boolean);

  return lines.join(" ");
}

function buildAnalysisInstruction(
  selections: UserSelections,
  referenceMapText: string,
  notes: NotesInput
) {
  const notesText = buildNotesText(notes);
  const shotTypeLabel = getShotTypeLabel(selections.shotType);
  const distanceLabel = getCameraDistanceLabel(selections.cameraDistance);
  const shotFramingInstruction = getShotFramingInstruction(selections.shotType);
  const cameraDistanceInstruction = getCameraDistanceInstruction(
    selections.cameraDistance
  );
  const poseCategoriesText = selections.poseCategories
    .map((v) => getPoseCategoryLabel(v))
    .join(", ");

  return `
You are building prompt-ready fashion analysis for a Korean shopping mall image workflow.

Analyze all uploaded reference images together with the user's text notes and return ONLY valid JSON.
Do not wrap the result in markdown.
Do not add explanation outside JSON.

Important garment logic:
- A dress / one-piece must be treated as a standalone dress, not as only a top or only a bottom.
- If a dress is uploaded, do not recommend a separate top or bottom.
- If only a top is uploaded, preserve the uploaded top exactly and recommend only the matching bottom.
- If only a bottom is uploaded, preserve the uploaded bottom exactly and recommend only the matching top.
- If both top and bottom are uploaded, preserve both exactly and recommend neither.
- Never replace an uploaded garment with a newly invented alternative.

User selections:
- ratio: ${selections.ratio}
- lighting: ${selections.lighting}
- filmTone: ${selections.filmTone}
- style: ${selections.style}
- shotType: ${shotTypeLabel}
- cameraDistance: ${distanceLabel}
- poseCategories: ${poseCategoriesText}
- poseCount: ${selections.poseCount}
- gazeOption: ${selections.gazeOption}
- expressionOption: ${selections.expressionOption}
- hairstyle: ${selections.hairstyle}

Reference image order:
${referenceMapText}

User notes:
${notesText}

Shot framing rule:
${shotFramingInstruction}

Camera distance rule:
${cameraDistanceInstruction}

Tasks:
1) Summarize the visible clothing references in a commercially useful way.
2) Reflect the user's notes when relevant.
3) Infer the overall fashion mood and usage.
4) Summarize visible hairstyle from model reference if available.
5) Infer uploaded garment type carefully:
   - top
   - bottom
   - dress
   - unknown
6) Return:
   - hasTopReference
   - hasBottomReference
   - hasDressReference
   - primaryGarmentKind
   - secondaryGarmentKind
7) Recommend only the missing side:
   - If top only -> recommendedBottom only
   - If bottom only -> recommendedTop only
   - If dress -> neither top nor bottom recommendation
   - If both top and bottom -> neither recommendation
8) Generate exactly ${selections.poseCount} pose suggestions.
9) Every pose suggestion must describe ONE pose only.
10) Never mix multiple poses into one pose suggestion.
11) All pose suggestions must come only from these allowed pose categories: ${poseCategoriesText}.
12) All pose suggestions must match the selected shot type and camera distance.
13) For "recommended", you may suggest commercially appealing poses such as bed pose, wall lean, floor sitting, window lean, or similar if they fit the garment and background.
14) Return poseCategory in English key form exactly as one of:
["recommended","general","general_sitting","general_chair","selfie","selfie_sitting","selfie_chair","wall_lean","floor_sitting","bed","back_view","walking","bag_focus"]

Return JSON in this exact shape:
{
  "clothingSummary": "string",
  "overallMood": "string",
  "hairSummary": "string",
  "hasTopReference": true,
  "hasBottomReference": false,
  "hasDressReference": false,
  "primaryGarmentKind": "top",
  "secondaryGarmentKind": "unknown",
  "recommendedTop": "",
  "recommendedBottom": "",
  "poseSuggestions": [
    {
      "poseCategory": "recommended",
      "poseLabel": "string",
      "posePrompt": "string",
      "suggestedGaze": "string",
      "suggestedExpression": "string"
    }
  ]
}
`.trim();
}

async function analyzeReferences(
  refs: RefItem[],
  selections: UserSelections,
  referenceMapText: string,
  notes: NotesInput
): Promise<AnalysisResult> {
  const fallback = getFallbackAnalysis(
    selections.poseCategories,
    selections.shotType,
    selections.poseCount
  );

  const contents: Array<
    { inlineData: { mimeType: string; data: string } } | { text: string }
  > = [
    ...refs.map((item) => ({
      inlineData: {
        mimeType: item.mimeType,
        data: item.base64,
      },
    })),
    {
      text: buildAnalysisInstruction(selections, referenceMapText, notes),
    },
  ];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text =
      response.text ||
      response.candidates?.[0]?.content?.parts
        ?.map((part) => ("text" in part && part.text ? part.text : ""))
        .join("") ||
      "";

    const parsed = safeJsonParse<AnalysisResult>(text, fallback);

    if (!parsed.poseSuggestions || !Array.isArray(parsed.poseSuggestions)) {
      return fallback;
    }

    const cleaned = parsed.poseSuggestions
      .filter((v) => !!v.posePrompt)
      .map((v) => ({
        ...v,
        poseCategory: selections.poseCategories.includes(v.poseCategory)
          ? v.poseCategory
          : selections.poseCategories[0] || "recommended",
      }));

    const filled =
      cleaned.length >= selections.poseCount
        ? cleaned.slice(0, selections.poseCount)
        : [
            ...cleaned,
            ...distributePoseCategories(
              selections.poseCategories,
              selections.poseCount - cleaned.length
            ).map((cat, i) =>
              getFallbackPosePrompt(cat, cleaned.length + i, selections.shotType)
            ),
          ];

    return {
      clothingSummary: parsed.clothingSummary || fallback.clothingSummary,
      overallMood: parsed.overallMood || fallback.overallMood,
      hairSummary: parsed.hairSummary || fallback.hairSummary,

      hasTopReference:
        typeof parsed.hasTopReference === "boolean"
          ? parsed.hasTopReference
          : fallback.hasTopReference,
      hasBottomReference:
        typeof parsed.hasBottomReference === "boolean"
          ? parsed.hasBottomReference
          : fallback.hasBottomReference,
      hasDressReference:
        typeof parsed.hasDressReference === "boolean"
          ? parsed.hasDressReference
          : fallback.hasDressReference,

      primaryGarmentKind:
        parsed.primaryGarmentKind || fallback.primaryGarmentKind,
      secondaryGarmentKind:
        parsed.secondaryGarmentKind || fallback.secondaryGarmentKind,

      recommendedTop: parsed.recommendedTop || "",
      recommendedBottom: parsed.recommendedBottom || "",

      poseSuggestions: filled,
    };
  } catch {
    return fallback;
  }
}

async function generateOneImage(args: {
  model: UserSelections["imageModel"];
  imageSize: UserSelections["imageSize"];
  ratio: UserSelections["ratio"];
  prompt: string;
  refs: RefItem[];
}) {
  const normalizedImageSize = normalizeImageSize(args.model, args.imageSize);

  const contents: Array<
    { inlineData: { mimeType: string; data: string } } | { text: string }
  > = [
    ...args.refs.map((item) => ({
      inlineData: {
        mimeType: item.mimeType,
        data: item.base64,
      },
    })),
    { text: args.prompt },
  ];

  const imageConfig: Record<string, unknown> = {
    aspectRatio: args.ratio,
  };

  if (canUseImageSize(args.model) && normalizedImageSize !== "auto") {
    imageConfig.imageSize = normalizedImageSize;
  }

  const response = await ai.models.generateContent({
    model: args.model,
    contents,
    config: {
      responseModalities: ["TEXT", "IMAGE"],
      imageConfig,
    },
  });

  const parts = response.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find(
    (part) => "inlineData" in part && part.inlineData?.data
  );

  if (
    !imagePart ||
    !("inlineData" in imagePart) ||
    !imagePart.inlineData?.data ||
    !imagePart.inlineData?.mimeType
  ) {
    return null;
  }

  return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
}

export async function POST(req: Request) {
  try {
    if (!apiKey) {
      return Response.json(
        {
          ok: false,
          message: "GEMINI_API_KEY가 설정되지 않았습니다.",
        },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const selections = parseSelections(formData);
    const notes = parseNotes(formData);
    const refs = await collectReferenceItems(formData);

    if (refs.length === 0) {
      return Response.json(
        {
          ok: false,
          message: "최소 1장 이상의 참고 이미지를 업로드해주세요.",
        },
        { status: 400 }
      );
    }

    const referenceMapText = buildReferenceMapText(refs);
    const refBlocks = buildReferenceBlocks(refs);

    const analysis = await analyzeReferences(
      refs,
      selections,
      referenceMapText,
      notes
    );

    const hairInstruction =
      HAIR_MAP[selections.hairstyle] ||
      "Preserve the hairstyle from the uploaded model reference images.";

    const lightingInstruction =
      LIGHTING_MAP[selections.lighting] || LIGHTING_MAP.auto;

    const filmInstruction =
      FILM_MAP[selections.filmTone] || FILM_MAP.auto;

    const styleInstruction =
      STYLE_MAP[selections.style] || STYLE_MAP.ecommerce;

    const notesSummary = buildNotesSummary(notes);
    const shotFramingInstruction = getShotFramingInstruction(selections.shotType);
    const cameraDistanceInstruction = getCameraDistanceInstruction(
      selections.cameraDistance
    );

    const garmentRuleBlock = buildGarmentRuleBlock({
      hasTopReference: analysis.hasTopReference,
      hasBottomReference: analysis.hasBottomReference,
      hasDressReference: analysis.hasDressReference,
      recommendedTop: analysis.recommendedTop,
      recommendedBottom: analysis.recommendedBottom,
    });

    const analysisSummary = [
      analysis.clothingSummary || "",
      analysis.overallMood ? `Overall mood: ${analysis.overallMood}` : "",
      analysis.hairSummary ? `Visible hairstyle notes: ${analysis.hairSummary}` : "",
      notesSummary ? `User notes: ${notesSummary}` : "",
      `Detected garment logic: top=${String(
        analysis.hasTopReference
      )}, bottom=${String(analysis.hasBottomReference)}, dress=${String(
        analysis.hasDressReference
      )}.`,
    ]
      .filter(Boolean)
      .join(" ");

    const basePrompt = buildBasePrompt({
      refBlocks,
      analysisSummary,
      garmentRuleBlock,
      hairInstruction,
      lightingInstruction,
      filmInstruction,
      styleInstruction,
      shotFramingInstruction,
      cameraDistanceInstruction,
      ratio: selections.ratio,
    });

    const shotTypeLabel = getShotTypeLabel(selections.shotType);
    const distanceLabel = getCameraDistanceLabel(selections.cameraDistance);

    const cards: PromptCard[] = analysis.poseSuggestions.map((pose, index) => {
      const gazeText =
        selections.gazeOption !== "auto"
          ? GAZE_MAP[selections.gazeOption] ||
            pose.suggestedGaze ||
            GAZE_MAP.auto
          : pose.suggestedGaze || GAZE_MAP.auto;

      const expressionText =
        selections.expressionOption !== "auto"
          ? EXPRESSION_MAP[selections.expressionOption] ||
            pose.suggestedExpression ||
            EXPRESSION_MAP.auto
          : pose.suggestedExpression || EXPRESSION_MAP.auto;

      const prompt = combinePrompt(
        basePrompt,
        pose.posePrompt,
        gazeText,
        expressionText
      );

      return {
        id: index + 1,
        title: `Prompt ${index + 1}`,
        poseLabel:
          pose.poseLabel ||
          `${getPoseCategoryLabel(pose.poseCategory)} ${index + 1}`,
        poseCategoryLabel: getPoseCategoryLabel(pose.poseCategory),
        shotTypeLabel,
        distanceLabel,
        gaze: gazeText,
        expression: expressionText,
        prompt,
        imageDataUrl: null,
      };
    });

    if (selections.generateMode === "prompt_and_image") {
  for (let i = 0; i < cards.length; i += 1) {
    try {
      const imageDataUrl = await generateOneImage({
        model: selections.imageModel,
        imageSize: selections.imageSize,
        ratio: selections.ratio,
        prompt: cards[i].prompt,
        refs,
      });

      if (!imageDataUrl) {
        cards[i].imageDataUrl = null;
        cards[i].imageError =
          "이미지 응답이 비어 있습니다. 모델이 이미지 데이터를 반환하지 않았습니다.";
      } else {
        cards[i].imageDataUrl = imageDataUrl;
        cards[i].imageError = null;
      }
    } catch (error) {
      cards[i].imageDataUrl = null;
      cards[i].imageError =
        error instanceof Error
          ? error.message
          : "이미지 생성 중 알 수 없는 오류";
    }
  }
}

    return Response.json({
      ok: true,
      referenceMapText,
      prompts: cards,
      analysis: {
        clothingSummary: analysis.clothingSummary,
        recommendedBottom:
          analysis.recommendedBottom ||
          analysis.recommendedTop ||
          "",
        hairSummary: analysis.hairSummary,
        overallMood: analysis.overallMood,
      },
    });
  } catch (error) {
    console.error("route.ts POST error:", error);

    const message =
      error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";

    return Response.json(
      {
        ok: false,
        message,
      },
      { status: 500 }
    );
  }
}