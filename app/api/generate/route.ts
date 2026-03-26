import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const ai = new GoogleGenAI({});

export async function POST(req: Request) {
  try {
    const apiKey = (process.env.GEMINI_API_KEY || "").trim();

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const body = await req.json();

    const backgroundPrompt = String(body.backgroundPrompt || "").trim();
    const modelPrompt = String(body.modelPrompt || "").trim();
    const cloth1Prompt = String(body.cloth1Prompt || "").trim();
    const cloth2Prompt = String(body.cloth2Prompt || "").trim();
    const accessory1Prompt = String(body.accessory1Prompt || "").trim();
    const accessory2Prompt = String(body.accessory2Prompt || "").trim();

    const lighting = String(body.lighting || "").trim();
    const lightingPrompt = String(body.lightingPrompt || "").trim();

    const film = String(body.film || "").trim();
    const filmPrompt = String(body.filmPrompt || "").trim();

    const pose = String(body.pose || "").trim();
    const posePrompt = String(body.posePrompt || "").trim();

    const generateMode = String(body.generateMode || "prompt").trim();

    const promptStyle = String(body.promptStyle || "lookbook").trim();
    const promptStrength = String(body.promptStrength || "natural").trim();
    const promptStyleDetail = String(body.promptStyleDetail || "").trim();
    const promptStrengthDetail = String(body.promptStrengthDetail || "").trim();

    const useOutfitLock = Boolean(body.useOutfitLock);

    const ignoreLightingPreset = Boolean(body.ignoreLightingPreset);
    const ignoreFilmPreset = Boolean(body.ignoreFilmPreset);
    const ignorePosePreset = Boolean(body.ignorePosePreset);
    const ignoreStylePreset = Boolean(body.ignoreStylePreset);
    const ignoreStrengthPreset = Boolean(body.ignoreStrengthPreset);

    const lightingLine =
      ignoreLightingPreset && lightingPrompt
        ? `Lighting detail: ${lightingPrompt}`
        : [
            lighting && `Lighting preset: ${lighting}`,
            lightingPrompt && `Lighting detail: ${lightingPrompt}`,
          ]
            .filter(Boolean)
            .join("\n");

    const filmLine =
      ignoreFilmPreset && filmPrompt
        ? `Film detail: ${filmPrompt}`
        : [
            film && `Film preset: ${film}`,
            filmPrompt && `Film detail: ${filmPrompt}`,
          ]
            .filter(Boolean)
            .join("\n");

    const poseLine =
      ignorePosePreset && posePrompt
        ? `Pose detail: ${posePrompt}`
        : [
            pose && `Pose preset: ${pose}`,
            posePrompt && `Pose detail: ${posePrompt}`,
          ]
            .filter(Boolean)
            .join("\n");

    const styleLine =
      ignoreStylePreset && promptStyleDetail
        ? `Prompt style detail: ${promptStyleDetail}`
        : [
            promptStyle && `Prompt style preset: ${promptStyle}`,
            promptStyleDetail && `Prompt style detail: ${promptStyleDetail}`,
          ]
            .filter(Boolean)
            .join("\n");

    const strengthLine =
      ignoreStrengthPreset && promptStrengthDetail
        ? `Prompt strength detail: ${promptStrengthDetail}`
        : [
            promptStrength && `Prompt strength preset: ${promptStrength}`,
            promptStrengthDetail &&
              `Prompt strength detail: ${promptStrengthDetail}`,
          ]
            .filter(Boolean)
            .join("\n");

    const rawPrompt = [
      backgroundPrompt && `Background: ${backgroundPrompt}`,
      modelPrompt && `Model: ${modelPrompt}`,
      cloth1Prompt && `Outfit 1: ${cloth1Prompt}`,
      cloth2Prompt && `Outfit 2: ${cloth2Prompt}`,
      accessory1Prompt && `Accessory 1: ${accessory1Prompt}`,
      accessory2Prompt && `Accessory 2: ${accessory2Prompt}`,
      lightingLine,
      filmLine,
      poseLine,
      styleLine,
      strengthLine,
    ]
      .filter(Boolean)
      .join("\n");

    if (!rawPrompt) {
      return NextResponse.json(
        { error: "생성할 입력값이 비어 있습니다." },
        { status: 400 }
      );
    }

    const styleGuideMap: Record<string, string> = {
      lookbook: `
Style target:
Create a polished premium fashion lookbook prompt.
The result should feel like a refined brand campaign or editorial lookbook image.
Focus on clean composition, elegant model presence, cohesive styling, premium fashion mood, and visually elevated presentation.
`,

      detailpage: `
Style target:
Create an ecommerce product-detail-page prompt.

The result must strongly prioritize:
- fit readability
- fabric texture realism
- garment detail visibility
- silhouette clarity
- styling coherence
- commercial readability

The final image should feel highly useful for a fashion product detail page.
The clothing must read clearly at a glance, with strong emphasis on shape, drape, material texture, seam or construction impression, and visible design points.
The styling should support product understanding rather than distract from it.
Prioritize clean product-focused composition, realistic fashion presentation, and conversion-friendly clarity.
`,

      instagram: `
Style target:
Create an Instagram-friendly fashion content prompt.
The result should feel trendy, emotional, aesthetic, and scroll-stopping.
Focus on social-media appeal, natural but stylish posing, soft mood, lifestyle-driven composition, and visually attractive atmosphere.
`,

      "iphone-ugc": `
Style target:
Create an iPhone UGC-style fashion prompt.
The result should feel realistic, casually premium, and naturally captured on a smartphone.
Emphasize natural lighting, believable camera perspective, authentic social-media feeling, realistic skin and fabric rendering, and non-overproduced visual energy.
`,
    };

    const strengthGuideMap: Record<string, string> = {
      natural: `
Prompt strength:
Keep the result natural, balanced, realistic, and easy to use.
Do not overstuff the prompt.
`,

      detailed: `
Prompt strength:
Increase detail density.
Emphasize fabric texture, material realism, small design points, lighting nuance, silhouette accuracy, accessory finish, and camera realism.
`,

      commercial: `
Prompt strength:
Make the result stronger for selling and commercial impact.
Emphasize desirability, polished brand presentation, styling completeness, premium visual appeal, and high-conversion product readability.
`,
    };

    const outfitLockInstruction = useOutfitLock
      ? `
OUTFIT LOCK:
Preserve the intended clothing category, silhouette, fit, textile impression, fabric behavior, detail points, and visible design features.
Do not loosely reinterpret the outfit into a different garment type.
Maintain realistic fashion proportions and true-to-material appearance.
`
      : "";

    const detailpageBoost =
      promptStyle === "detailpage"
        ? `
Detailpage mode boost:
- Make fit, silhouette, and garment structure especially clear.
- Emphasize how the fabric looks, falls, stretches, or holds shape.
- Prioritize visible product detail points such as seams, texture, closures, pockets, collars, buttons, pleats, drape, hem shape, and construction lines when relevant.
- Make the result commercially readable and easy to understand for shoppers.
- Keep the model styling supportive, not overpowering.
- The image should help a customer quickly understand what kind of item it is, how it fits, and why it feels premium or wearable.
- Focus on ecommerce usefulness, visual trust, and product conversion appeal.
- Write the prompt so the garment appears highly readable for ecommerce thumbnail, detail page hero image, and product-focused campaign use.
- Favor clear garment communication over cinematic ambiguity.
- Make the viewer immediately understand fit, texture, styling use, and product appeal.
`
        : "";

    const instruction = `
You are a senior fashion prompt writer specialized in ecommerce, lookbook, editorial, and UGC fashion image prompts.

Your task:
Transform the user's structured fashion inputs into ONE polished, natural, high-quality English image-generation prompt.

Output rules:
- Output only one final English prompt paragraph.
- Do not use bullet points.
- Do not use labels, headings, JSON, markdown, or explanations.
- Keep the user's intent exactly.
- Merge overlapping ideas naturally.
- Ignore empty fields.
- Make the result immediately usable in an AI image generator.

Universal quality rules:
- Prioritize realism, polished styling, coherent composition, natural fashion proportions, fabric realism, and visually strong presentation.
- Make the image feel believable, stylish, commercially useful, and aesthetically refined.
- Avoid awkward repetition.
- Avoid vague wording when the user gave specific detail.

${styleGuideMap[promptStyle] || styleGuideMap.lookbook}

${strengthGuideMap[promptStrength] || strengthGuideMap.natural}

${outfitLockInstruction}

${detailpageBoost}

Special fashion requirements:
- Preserve outfit readability and fashion styling coherence.
- Make poses feel natural and wearable unless the user clearly wants something dramatic.
- If product-oriented, improve fit clarity, fabric readability, and commercial usefulness.
- If mood-oriented, improve aesthetic atmosphere without losing realism.
- If smartphone or UGC-oriented, preserve realistic handheld or natural camera feeling.

User input:
${rawPrompt}
`.trim();

    const promptResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: instruction,
    });

    const finalPrompt = promptResponse.text?.trim();

    if (!finalPrompt) {
      return NextResponse.json(
        { error: "Gemini가 프롬프트를 생성하지 못했습니다." },
        { status: 500 }
      );
    }

    if (generateMode === "prompt") {
      return NextResponse.json({
        prompt: finalPrompt,
        imageUrl: null,
      });
    }

    const imageResponse = await ai.models.generateImages({
      model: "imagen-4.0-generate-001",
      prompt: finalPrompt,
      config: {
        numberOfImages: 1,
      },
    });

    const base64Image = imageResponse.generatedImages?.[0]?.image?.imageBytes;

    if (!base64Image) {
      return NextResponse.json(
        { error: "이미지 생성 결과가 없습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      prompt: finalPrompt,
      imageUrl: `data:image/png;base64,${base64Image}`,
    });
  } catch (error: any) {
    console.error("GEMINI_GENERATE_ERROR:", error);

    return NextResponse.json(
      {
        error: error?.message || "Gemini 처리 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}