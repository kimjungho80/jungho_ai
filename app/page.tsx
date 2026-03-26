"use client";

import { ChangeEvent, DragEvent, useMemo, useRef, useState } from "react";

type UploadCardProps = {
  title: string;
  uploadTitle: string;
  helper: string;
  accent?: "green" | "teal";
  inputId: string;
  preview: string | null;
  onFileSelect: (file: File) => void;
};

type PromptBoxProps = {
  title: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

type SelectPromptBoxProps = {
  title: string;
  selectValue: string;
  onSelectChange: (value: string) => void;
  options: { value: string; label: string }[];
  value: string;
  onTextChange: (value: string) => void;
  placeholder: string;
};

export default function Home() {
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [modelImage, setModelImage] = useState<string | null>(null);
  const [cloth1Image, setCloth1Image] = useState<string | null>(null);
  const [cloth2Image, setCloth2Image] = useState<string | null>(null);
  const [accessory1Image, setAccessory1Image] = useState<string | null>(null);
  const [accessory2Image, setAccessory2Image] = useState<string | null>(null);

  const [backgroundPrompt, setBackgroundPrompt] = useState("");
  const [modelPrompt, setModelPrompt] = useState("");
  const [cloth1Prompt, setCloth1Prompt] = useState("");
  const [cloth2Prompt, setCloth2Prompt] = useState("");
  const [accessory1Prompt, setAccessory1Prompt] = useState("");
  const [accessory2Prompt, setAccessory2Prompt] = useState("");
  const [lightingPrompt, setLightingPrompt] = useState("");
  const [filmPrompt, setFilmPrompt] = useState("");
  const [posePrompt, setPosePrompt] = useState("");

  const [lighting, setLighting] = useState("soft-daylight");
  const [film, setFilm] = useState("clean-editorial");
  const [pose, setPose] = useState("natural-standing");

  const [generateMode, setGenerateMode] = useState<"prompt" | "image">(
    "prompt"
  );

  const [promptStyle, setPromptStyle] = useState<
    "lookbook" | "detailpage" | "instagram" | "iphone-ugc"
  >("lookbook");

  const [promptStrength, setPromptStrength] = useState<
    "natural" | "detailed" | "commercial"
  >("natural");

  const [useOutfitLock, setUseOutfitLock] = useState(true);

  const [promptStyleDetail, setPromptStyleDetail] = useState("");
  const [promptStrengthDetail, setPromptStrengthDetail] = useState("");

  const [ignoreLightingPreset, setIgnoreLightingPreset] = useState(false);
  const [ignoreFilmPreset, setIgnoreFilmPreset] = useState(false);
  const [ignorePosePreset, setIgnorePosePreset] = useState(false);
  const [ignoreStylePreset, setIgnoreStylePreset] = useState(false);
  const [ignoreStrengthPreset, setIgnoreStrengthPreset] = useState(false);

  const [resultImage, setResultImage] = useState<string | null>(null);
  const [finalPrompt, setFinalPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const objectUrlsRef = useRef<string[]>([]);

  const createPreview =
    (setter: (value: string | null) => void) => (file: File) => {
      if (!file.type.startsWith("image/")) {
        alert("이미지 파일만 업로드 가능합니다.");
        return;
      }

      const url = URL.createObjectURL(file);
      objectUrlsRef.current.push(url);
      setter(url);
    };

  const buildPreviewPrompt = useMemo(() => {
    const lightingLabel =
      {
        "soft-daylight": "soft daylight",
        "studio-clean": "clean studio lighting",
        "warm-hotel": "warm hotel lighting",
        "moody-editorial": "moody editorial lighting",
      }[lighting] || lighting;

    const filmLabel =
      {
        "clean-editorial": "clean editorial tone",
        "soft-film": "soft film tone",
        "luxury-fashion": "luxury fashion mood",
        "iphone-real": "realistic iPhone photography look",
      }[film] || film;

    const poseLabel =
      {
        "natural-standing": "natural standing pose",
        "one-hand-bag": "one-hand bag pose",
        "mirror-selfie": "mirror selfie pose",
        "lookbook-angle": "lookbook-style angle",
      }[pose] || pose;

    const styleLabel =
      {
        lookbook: "lookbook",
        detailpage: "detailpage",
        instagram: "instagram mood",
        "iphone-ugc": "iphone ugc",
      }[promptStyle] || promptStyle;

    const strengthLabel =
      {
        natural: "natural",
        detailed: "detailed",
        commercial: "commercial",
      }[promptStrength] || promptStrength;

    const lightingText =
      ignoreLightingPreset && lightingPrompt
        ? `Lighting detail: ${lightingPrompt}`
        : [
            lighting && `Lighting preset: ${lightingLabel}`,
            lightingPrompt && `Lighting detail: ${lightingPrompt}`,
          ]
            .filter(Boolean)
            .join("\n");

    const filmText =
      ignoreFilmPreset && filmPrompt
        ? `Film detail: ${filmPrompt}`
        : [
            film && `Film preset: ${filmLabel}`,
            filmPrompt && `Film detail: ${filmPrompt}`,
          ]
            .filter(Boolean)
            .join("\n");

    const poseText =
      ignorePosePreset && posePrompt
        ? `Pose detail: ${posePrompt}`
        : [
            pose && `Pose preset: ${poseLabel}`,
            posePrompt && `Pose detail: ${posePrompt}`,
          ]
            .filter(Boolean)
            .join("\n");

    const styleText =
      ignoreStylePreset && promptStyleDetail
        ? `Prompt style detail: ${promptStyleDetail}`
        : [
            promptStyle && `Prompt style preset: ${styleLabel}`,
            promptStyleDetail && `Prompt style detail: ${promptStyleDetail}`,
          ]
            .filter(Boolean)
            .join("\n");

    const strengthText =
      ignoreStrengthPreset && promptStrengthDetail
        ? `Prompt strength detail: ${promptStrengthDetail}`
        : [
            promptStrength && `Prompt strength preset: ${strengthLabel}`,
            promptStrengthDetail &&
              `Prompt strength detail: ${promptStrengthDetail}`,
          ]
            .filter(Boolean)
            .join("\n");

    return [
      "Create a high-quality fashion image with the following direction.",
      backgroundPrompt && `Background: ${backgroundPrompt}`,
      modelPrompt && `Model: ${modelPrompt}`,
      cloth1Prompt && `Outfit 1: ${cloth1Prompt}`,
      cloth2Prompt && `Outfit 2: ${cloth2Prompt}`,
      accessory1Prompt && `Accessory 1: ${accessory1Prompt}`,
      accessory2Prompt && `Accessory 2: ${accessory2Prompt}`,
      lightingText,
      filmText,
      poseText,
      styleText,
      strengthText,
      useOutfitLock
        ? "OUTFIT LOCK: Keep the intended outfit silhouette, fit, fabric feel, and key design details consistent."
        : "",
      "Keep the styling cohesive, realistic, detailed, and visually polished.",
    ]
      .filter(Boolean)
      .join("\n\n");
  }, [
    backgroundPrompt,
    modelPrompt,
    cloth1Prompt,
    cloth2Prompt,
    accessory1Prompt,
    accessory2Prompt,
    lighting,
    lightingPrompt,
    film,
    filmPrompt,
    pose,
    posePrompt,
    promptStyle,
    promptStyleDetail,
    promptStrength,
    promptStrengthDetail,
    useOutfitLock,
    ignoreLightingPreset,
    ignoreFilmPreset,
    ignorePosePreset,
    ignoreStylePreset,
    ignoreStrengthPreset,
  ]);

  const resetAll = () => {
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current = [];

    setBackgroundImage(null);
    setModelImage(null);
    setCloth1Image(null);
    setCloth2Image(null);
    setAccessory1Image(null);
    setAccessory2Image(null);

    setBackgroundPrompt("");
    setModelPrompt("");
    setCloth1Prompt("");
    setCloth2Prompt("");
    setAccessory1Prompt("");
    setAccessory2Prompt("");
    setLightingPrompt("");
    setFilmPrompt("");
    setPosePrompt("");

    setLighting("soft-daylight");
    setFilm("clean-editorial");
    setPose("natural-standing");

    setGenerateMode("prompt");
    setPromptStyle("lookbook");
    setPromptStrength("natural");
    setUseOutfitLock(true);

    setPromptStyleDetail("");
    setPromptStrengthDetail("");

    setIgnoreLightingPreset(false);
    setIgnoreFilmPreset(false);
    setIgnorePosePreset(false);
    setIgnoreStylePreset(false);
    setIgnoreStrengthPreset(false);

    setResultImage(null);
    setFinalPrompt("");
    setLoading(false);
    setCopied(false);
  };

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setResultImage(null);
      setFinalPrompt(buildPreviewPrompt);

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          backgroundPrompt,
          modelPrompt,
          cloth1Prompt,
          cloth2Prompt,
          accessory1Prompt,
          accessory2Prompt,
          lighting,
          lightingPrompt,
          film,
          filmPrompt,
          pose,
          posePrompt,
          generateMode,
          promptStyle,
          promptStrength,
          useOutfitLock,
          promptStyleDetail,
          promptStrengthDetail,
          ignoreLightingPreset,
          ignoreFilmPreset,
          ignorePosePreset,
          ignoreStylePreset,
          ignoreStrengthPreset,
        }),
      });

      const text = await response.text();
      let data: any;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(text || "서버 응답을 읽을 수 없습니다.");
      }

      if (!response.ok) {
        throw new Error(data?.error || "생성에 실패했습니다.");
      }

      setFinalPrompt(data.prompt || "");
      setResultImage(data.imageUrl || null);
    } catch (error: any) {
      console.error("생성 에러:", error);
      alert(error?.message || "생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6f3] text-[#1d2420]">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 border-r border-[#d9e2d2] bg-[#f1f3ee] px-8 py-12 xl:block">
          <div className="mb-14">
            <h1 className="text-[42px] font-extrabold tracking-tight text-[#178c7b]">
              정호 AI Factory
            </h1>
            <p className="mt-3 text-sm text-[#748176]">
              AI 콘텐츠 제작용 작업 도구
            </p>
          </div>

          <nav className="space-y-3">
            <MenuItem label="프롬프트 생성" active />
            <MenuItem label="피팅컷 생성" />
            <MenuItem label="포즈 체인지" />
            <MenuItem label="제품 체인지" />
            <MenuItem label="컬러 체인지" />
            <MenuItem label="배경 체인지" />
            <MenuItem label="디테일 생성" />
            <MenuItem label="영상 생성" />
          </nav>
        </aside>

        <main className="flex-1 px-5 py-8 md:px-8 xl:px-12">
          <header className="mb-10 rounded-[28px] border border-[#d7e3d1] bg-white px-6 py-7 shadow-[0_10px_30px_rgba(76,96,70,0.06)] md:px-10">
            <div className="text-center">
              <p className="mb-2 text-sm font-semibold tracking-[0.18em] text-[#7a8d7c]">
                PROMPT BUILDER
              </p>
              <h2 className="text-3xl font-extrabold text-[#39443d] md:text-5xl">
                프롬프트 생성
              </h2>
              <p className="mt-3 text-sm text-[#7a857d] md:text-base">
                이미지 프롬프트를 한 번에 구성하고 생성 준비를 합니다.
              </p>
            </div>
          </header>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <UploadCard
              title="배경이미지"
              uploadTitle="배경이미지 업로드"
              helper="배경을 변경할 이미지를 선택해주세요"
              accent="green"
              inputId="backgroundImage"
              preview={backgroundImage}
              onFileSelect={createPreview(setBackgroundImage)}
            />
            <UploadCard
              title="모델이미지"
              uploadTitle="모델이미지 업로드"
              helper="모델을 변경할 이미지를 선택해주세요"
              accent="teal"
              inputId="modelImage"
              preview={modelImage}
              onFileSelect={createPreview(setModelImage)}
            />
          </section>

          <section className="mt-4 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <PromptBox
              title="배경 설명"
              placeholder="원하는 배경 분위기, 장소, 조명, 색감 등을 자세히 입력해주세요."
              value={backgroundPrompt}
              onChange={setBackgroundPrompt}
            />
            <PromptBox
              title="모델 설명"
              placeholder="원하는 모델 분위기, 표정, 헤어, 체형, 스타일 톤 등을 입력해주세요."
              value={modelPrompt}
              onChange={setModelPrompt}
            />
          </section>

          <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <UploadCard
              title="착용의류1"
              uploadTitle="의류1이미지 업로드"
              helper="착용할 의류 이미지를 선택해주세요"
              accent="green"
              inputId="cloth1Image"
              preview={cloth1Image}
              onFileSelect={createPreview(setCloth1Image)}
            />
            <UploadCard
              title="착용의류2"
              uploadTitle="의류2이미지 업로드"
              helper="착용할 의류 이미지를 선택해주세요"
              accent="teal"
              inputId="cloth2Image"
              preview={cloth2Image}
              onFileSelect={createPreview(setCloth2Image)}
            />
          </section>

          <section className="mt-4 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <PromptBox
              title="착용의류1 설명"
              placeholder="원하는 의류의 소재, 핏감, 디테일 포인트를 입력해주세요."
              value={cloth1Prompt}
              onChange={setCloth1Prompt}
            />
            <PromptBox
              title="착용의류2 설명"
              placeholder="원하는 의류의 소재, 핏감, 디테일 포인트를 입력해주세요."
              value={cloth2Prompt}
              onChange={setCloth2Prompt}
            />
          </section>

          <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <UploadCard
              title="착용소품1"
              uploadTitle="소품1이미지 업로드"
              helper="소품 이미지를 선택해주세요"
              accent="green"
              inputId="accessory1Image"
              preview={accessory1Image}
              onFileSelect={createPreview(setAccessory1Image)}
            />
            <UploadCard
              title="착용소품2"
              uploadTitle="소품2이미지 업로드"
              helper="소품 이미지를 선택해주세요"
              accent="teal"
              inputId="accessory2Image"
              preview={accessory2Image}
              onFileSelect={createPreview(setAccessory2Image)}
            />
          </section>

          <section className="mt-4 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <PromptBox
              title="착용소품1 설명"
              placeholder="원하는 소품의 소재, 크기, 컬러, 분위기를 입력해주세요."
              value={accessory1Prompt}
              onChange={setAccessory1Prompt}
            />
            <PromptBox
              title="착용소품2 설명"
              placeholder="원하는 소품의 소재, 크기, 컬러, 분위기를 입력해주세요."
              value={accessory2Prompt}
              onChange={setAccessory2Prompt}
            />
          </section>
<section className="mt-8 space-y-5">
  {/* 조명 설명 */}
  <div className="rounded-[24px] border-2 border-[#7aa74f] bg-white p-5 shadow-[0_8px_24px_rgba(76,96,70,0.05)]">
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h4 className="text-xl font-extrabold text-[#187d72]">조명 설명</h4>
        <p className="mt-1 text-sm text-[#7f8b81]">
          원하는 옵션을 선택하거나 직접 입력해주세요.
        </p>
      </div>

      <select
        value={lighting}
        onChange={(e) => setLighting(e.target.value)}
        className="rounded-2xl bg-[#27b0a4] px-5 py-3 text-sm font-bold text-white outline-none"
      >
        <option value="soft-daylight" className="text-black">
          부드러운 자연광
        </option>
        <option value="studio-clean" className="text-black">
          클린 스튜디오광
        </option>
        <option value="warm-hotel" className="text-black">
          따뜻한 호텔 조명
        </option>
        <option value="moody-editorial" className="text-black">
          무디 에디토리얼
        </option>
      </select>
    </div>

    <textarea
      value={lightingPrompt}
      onChange={(e) => setLightingPrompt(e.target.value)}
      placeholder="원하는 조명을 선택하거나, 구체적인 조명 연출을 입력해주세요."
      className="mt-4 min-h-[90px] w-full rounded-2xl border-2 border-[#d8e5cd] bg-[#fcfdf9] px-4 py-3 text-sm outline-none placeholder:text-[#9aa59d] focus:border-[#96be59]"
    />

    <div className="mt-3 flex justify-end">
      <button
        type="button"
        onClick={() => setIgnoreLightingPreset(!ignoreLightingPreset)}
        className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
          ignoreLightingPreset
            ? "bg-[#27b0a4] text-white"
            : "bg-[#e8efe6] text-[#4f5b53]"
        }`}
      >
        {ignoreLightingPreset
          ? "입력값 있으면 preset 무시: ON"
          : "입력값 있으면 preset 무시: OFF"}
      </button>
    </div>
  </div>

  {/* 필름설명 */}
  <div className="rounded-[24px] border-2 border-[#7aa74f] bg-white p-5 shadow-[0_8px_24px_rgba(76,96,70,0.05)]">
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h4 className="text-xl font-extrabold text-[#187d72]">필름설명</h4>
        <p className="mt-1 text-sm text-[#7f8b81]">
          원하는 옵션을 선택하거나 직접 입력해주세요.
        </p>
      </div>

      <select
        value={film}
        onChange={(e) => setFilm(e.target.value)}
        className="rounded-2xl bg-[#27b0a4] px-5 py-3 text-sm font-bold text-white outline-none"
      >
        <option value="clean-editorial" className="text-black">
          클린 에디토리얼
        </option>
        <option value="soft-film" className="text-black">
          소프트 필름톤
        </option>
        <option value="luxury-fashion" className="text-black">
          럭셔리 패션 무드
        </option>
        <option value="iphone-real" className="text-black">
          아이폰 리얼 촬영감
        </option>
      </select>
    </div>

    <textarea
      value={filmPrompt}
      onChange={(e) => setFilmPrompt(e.target.value)}
      placeholder="원하는 필름톤이나 색감 스타일을 입력해주세요."
      className="mt-4 min-h-[90px] w-full rounded-2xl border-2 border-[#d8e5cd] bg-[#fcfdf9] px-4 py-3 text-sm outline-none placeholder:text-[#9aa59d] focus:border-[#96be59]"
    />

    <div className="mt-3 flex justify-end">
      <button
        type="button"
        onClick={() => setIgnoreFilmPreset(!ignoreFilmPreset)}
        className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
          ignoreFilmPreset
            ? "bg-[#27b0a4] text-white"
            : "bg-[#e8efe6] text-[#4f5b53]"
        }`}
      >
        {ignoreFilmPreset
          ? "입력값 있으면 preset 무시: ON"
          : "입력값 있으면 preset 무시: OFF"}
      </button>
    </div>
  </div>

  {/* 포즈설명 */}
  <div className="rounded-[24px] border-2 border-[#7aa74f] bg-white p-5 shadow-[0_8px_24px_rgba(76,96,70,0.05)]">
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h4 className="text-xl font-extrabold text-[#187d72]">포즈설명</h4>
        <p className="mt-1 text-sm text-[#7f8b81]">
          원하는 옵션을 선택하거나 직접 입력해주세요.
        </p>
      </div>

      <select
        value={pose}
        onChange={(e) => setPose(e.target.value)}
        className="rounded-2xl bg-[#27b0a4] px-5 py-3 text-sm font-bold text-white outline-none"
      >
        <option value="natural-standing" className="text-black">
          자연스러운 정면 포즈
        </option>
        <option value="one-hand-bag" className="text-black">
          한 손 가방 포즈
        </option>
        <option value="mirror-selfie" className="text-black">
          거울 셀카 포즈
        </option>
        <option value="lookbook-angle" className="text-black">
          룩북 스타일 포즈
        </option>
      </select>
    </div>

    <textarea
      value={posePrompt}
      onChange={(e) => setPosePrompt(e.target.value)}
      placeholder="원하는 포즈나 손동작, 시선 방향을 입력해주세요."
      className="mt-4 min-h-[90px] w-full rounded-2xl border-2 border-[#d8e5cd] bg-[#fcfdf9] px-4 py-3 text-sm outline-none placeholder:text-[#9aa59d] focus:border-[#96be59]"
    />

    <div className="mt-3 flex justify-end">
      <button
        type="button"
        onClick={() => setIgnorePosePreset(!ignorePosePreset)}
        className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
          ignorePosePreset
            ? "bg-[#27b0a4] text-white"
            : "bg-[#e8efe6] text-[#4f5b53]"
        }`}
      >
        {ignorePosePreset
          ? "입력값 있으면 preset 무시: ON"
          : "입력값 있으면 preset 무시: OFF"}
      </button>
    </div>
  </div>
</section>
          <section className="mt-8 space-y-5">
            <div className="rounded-[24px] border-2 border-[#7aa74f] bg-white p-5 shadow-[0_8px_24px_rgba(76,96,70,0.05)]">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h4 className="text-xl font-extrabold text-[#187d72]">
                    프롬프트 스타일
                  </h4>
                  <p className="mt-1 text-sm text-[#7f8b81]">
                    원하는 결과물 톤에 맞춰 프롬프트 스타일을 선택해주세요.
                  </p>
                </div>

                <select
                  value={promptStyle}
                  onChange={(e) =>
                    setPromptStyle(
                      e.target.value as
                        | "lookbook"
                        | "detailpage"
                        | "instagram"
                        | "iphone-ugc"
                    )
                  }
                  className="rounded-2xl bg-[#27b0a4] px-5 py-3 text-sm font-bold text-white outline-none"
                >
                  <option value="lookbook" className="text-black">
                    룩북
                  </option>
                  <option value="detailpage" className="text-black">
                    상세페이지
                  </option>
                  <option value="instagram" className="text-black">
                    인스타 감성
                  </option>
                  <option value="iphone-ugc" className="text-black">
                    아이폰 UGC
                  </option>
                </select>
              </div>

              <textarea
                value={promptStyleDetail}
                onChange={(e) => setPromptStyleDetail(e.target.value)}
                placeholder="스타일을 더 구체적으로 입력해주세요. 예: 감성적인 룩북 톤, 미니멀한 브랜드 캠페인 무드"
                className="mt-4 min-h-[90px] w-full rounded-2xl border-2 border-[#d8e5cd] bg-[#fcfdf9] px-4 py-3 text-sm outline-none placeholder:text-[#9aa59d] focus:border-[#96be59]"
              />

              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIgnoreStylePreset(!ignoreStylePreset)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                    ignoreStylePreset
                      ? "bg-[#27b0a4] text-white"
                      : "bg-[#e8efe6] text-[#4f5b53]"
                  }`}
                >
                  {ignoreStylePreset
                    ? "입력값 있으면 preset 무시: ON"
                    : "입력값 있으면 preset 무시: OFF"}
                </button>
              </div>
            </div>

            <div className="rounded-[24px] border-2 border-[#7aa74f] bg-white p-5 shadow-[0_8px_24px_rgba(76,96,70,0.05)]">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h4 className="text-xl font-extrabold text-[#187d72]">
                    프롬프트 강도
                  </h4>
                  <p className="mt-1 text-sm text-[#7f8b81]">
                    자연스러운 표현, 디테일 강조, 상업용 강조 중에서
                    선택해주세요.
                  </p>
                </div>

                <select
                  value={promptStrength}
                  onChange={(e) =>
                    setPromptStrength(
                      e.target.value as "natural" | "detailed" | "commercial"
                    )
                  }
                  className="rounded-2xl bg-[#27b0a4] px-5 py-3 text-sm font-bold text-white outline-none"
                >
                  <option value="natural" className="text-black">
                    자연스러움
                  </option>
                  <option value="detailed" className="text-black">
                    디테일 강조
                  </option>
                  <option value="commercial" className="text-black">
                    상업용 강조
                  </option>
                </select>
              </div>

              <textarea
                value={promptStrengthDetail}
                onChange={(e) => setPromptStrengthDetail(e.target.value)}
                placeholder="강도를 더 구체적으로 입력해주세요. 예: 원단 디테일을 강하게, 광고용으로 더 세련되게"
                className="mt-4 min-h-[90px] w-full rounded-2xl border-2 border-[#d8e5cd] bg-[#fcfdf9] px-4 py-3 text-sm outline-none placeholder:text-[#9aa59d] focus:border-[#96be59]"
              />

              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setIgnoreStrengthPreset(!ignoreStrengthPreset)
                  }
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                    ignoreStrengthPreset
                      ? "bg-[#27b0a4] text-white"
                      : "bg-[#e8efe6] text-[#4f5b53]"
                  }`}
                >
                  {ignoreStrengthPreset
                    ? "입력값 있으면 preset 무시: ON"
                    : "입력값 있으면 preset 무시: OFF"}
                </button>
              </div>
            </div>

            <div className="rounded-[24px] border-2 border-[#7aa74f] bg-white p-5 shadow-[0_8px_24px_rgba(76,96,70,0.05)]">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h4 className="text-xl font-extrabold text-[#187d72]">
                    OUTFIT LOCK
                  </h4>
                  <p className="mt-1 text-sm text-[#7f8b81]">
                    의상 핏감, 소재감, 디테일 포인트를 더 강하게 유지합니다.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setUseOutfitLock(!useOutfitLock)}
                  className={`rounded-2xl px-5 py-3 text-sm font-bold transition ${
                    useOutfitLock
                      ? "bg-[#27b0a4] text-white"
                      : "bg-[#e8efe6] text-[#4f5b53]"
                  }`}
                >
                  {useOutfitLock ? "ON" : "OFF"}
                </button>
              </div>
            </div>
          </section>

          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setGenerateMode("prompt")}
              className={`rounded-2xl px-6 py-3 text-sm font-bold transition ${
                generateMode === "prompt"
                  ? "bg-[#27b0a4] text-white shadow-[0_10px_20px_rgba(39,176,164,0.18)]"
                  : "bg-[#e8efe6] text-[#4f5b53]"
              }`}
            >
              프롬프트만 생성
            </button>

            <button
              type="button"
              onClick={() => setGenerateMode("image")}
              className={`rounded-2xl px-6 py-3 text-sm font-bold transition ${
                generateMode === "image"
                  ? "bg-[#1877c8] text-white shadow-[0_10px_20px_rgba(24,119,200,0.18)]"
                  : "bg-[#e8efe6] text-[#4f5b53]"
              }`}
            >
              프롬프트 + 이미지 생성
            </button>
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={resetAll}
              className="rounded-2xl bg-[#d7d7d7] px-8 py-4 text-base font-bold text-white transition hover:brightness-95"
            >
              초기화
            </button>

            <button
              onClick={handleGenerate}
              className="rounded-2xl bg-[#1877c8] px-12 py-4 text-base font-extrabold text-white shadow-[0_12px_25px_rgba(24,119,200,0.22)] transition hover:brightness-110"
            >
              {loading
                ? "생성 중..."
                : generateMode === "prompt"
                ? "프롬프트 생성 시작"
                : "프롬프트 + 이미지 생성 시작"}
            </button>
          </div>

          <div className="mt-12">
            <div className="rounded-[24px] border border-[#b6d57b]/30 bg-white/80 p-6 shadow-[0_10px_30px_rgba(76,96,70,0.05)] backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-extrabold text-[#187d72]">
                  생성 결과
                </h3>
                <span className="text-sm text-[#7f8b81]">AI 결과 이미지</span>
              </div>

              <div className="mt-6 grid min-h-[420px] grid-cols-1 gap-6 xl:grid-cols-2">
                <div className="flex min-h-[420px] flex-col rounded-[20px] border-2 border-dashed border-[#d8e5cd] bg-[#f9fbf7] p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-lg font-extrabold text-[#187d72]">
                      전체 생성 프롬프트
                    </h4>

                    {finalPrompt ? (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(finalPrompt);
                            setCopied(true);
                            setTimeout(() => {
                              setCopied(false);
                            }, 1500);
                          } catch (error) {
                            alert("복사에 실패했습니다.");
                          }
                        }}
                        className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                          copied
                            ? "bg-[#27b0a4] text-white"
                            : "bg-[#eaf4ff] text-[#1877c8]"
                        }`}
                      >
                        {copied ? "복사 완료!" : "복사"}
                      </button>
                    ) : null}
                  </div>

                  <div className="flex-1 overflow-auto rounded-2xl border border-[#d8e5cd] bg-white p-4 text-sm leading-7 text-[#445047]">
                    {finalPrompt ? (
                      <pre className="whitespace-pre-wrap break-words font-sans">
                        {finalPrompt}
                      </pre>
                    ) : (
                      <span className="text-[#9aa59d]">
                        아직 생성된 프롬프트가 없습니다
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex min-h-[420px] items-center justify-center rounded-[20px] border-2 border-dashed border-[#d8e5cd] bg-[#f9fbf7] p-4">
                  {loading ? (
                    <span className="text-[#9aa59d]">생성 중...</span>
                  ) : resultImage ? (
                    <img
                      src={resultImage}
                      alt="생성 결과"
                      className="max-h-[420px] rounded-xl shadow-md"
                    />
                  ) : (
                    <span className="text-[#9aa59d]">
                      {generateMode === "prompt"
                        ? "프롬프트만 생성 모드입니다"
                        : "아직 생성된 이미지가 없습니다"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function MenuItem({
  label,
  active = false,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`w-full rounded-2xl px-5 py-4 text-[24px] font-bold leading-none whitespace-nowrap transition ${
        active
          ? "border border-[#b6d57b]/30 bg-[#f8fff0] text-[#7fb53e] shadow-[0_8px_18px_rgba(162,197,86,0.18)]"
          : "text-[#1c1f1d] hover:bg-white"
      }`}
    >
      {label}
    </div>
  );
}

function UploadCard({
  title,
  uploadTitle,
  helper,
  accent = "green",
  inputId,
  preview,
  onFileSelect,
}: UploadCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const accentStyle =
    accent === "green"
      ? {
          border: "border-[#7aa74f]",
          softBorder: "border-[#b8d38d]",
          title: "text-[#187d72]",
          button: "bg-[#27b0a4]",
        }
      : {
          border: "border-[#6e9c56]",
          softBorder: "border-[#b8d38d]",
          title: "text-[#187d72]",
          button: "bg-[#27b0a4]",
        };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onFileSelect(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    onFileSelect(file);
  };

  return (
    <div
      className={`rounded-[28px] border-2 ${accentStyle.border} bg-white p-5 shadow-[0_10px_30px_rgba(76,96,70,0.05)]`}
    >
      <h3 className={`mb-4 text-2xl font-extrabold ${accentStyle.title}`}>
        {title}
      </h3>

      <div
        className={`rounded-[26px] border-2 ${accentStyle.softBorder} bg-[#fbfcf8] p-6`}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />

        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`cursor-pointer rounded-[28px] border px-6 py-10 text-center transition ${
            isDragging
              ? "border-[#27b0a4] bg-[#f2fffd] shadow-[0_16px_40px_rgba(39,176,164,0.18)]"
              : "border-[#b6d57b]/40 bg-white hover:shadow-[0_16px_40px_rgba(39,176,164,0.15)]"
          }`}
        >
          {preview ? (
            <div>
              <img
                src={preview}
                alt={title}
                className="mx-auto max-h-[320px] rounded-2xl object-contain"
              />
              <p className="mt-5 text-sm font-semibold text-[#75836f]">
                드래그 앤 드롭 또는 클릭해서 다른 이미지로 변경
              </p>
            </div>
          ) : (
            <>
              <div className="mb-3 text-5xl text-[#157f74]">↑</div>
              <div className="text-[32px] font-extrabold text-[#1d2420]">
                {uploadTitle}
              </div>
              <p className="mt-4 text-base text-[#616c64]">{helper}</p>
              <p className="mt-3 text-sm font-bold text-[#90ae62]">
                드래그 앤 드롭 또는 클릭하여 파일 선택
              </p>

              <div
                className={`mx-auto mt-7 w-fit rounded-2xl ${accentStyle.button} px-8 py-3 text-lg font-bold text-white shadow-[0_10px_20px_rgba(39,176,164,0.18)]`}
              >
                파일 선택
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PromptBox({ title, placeholder, value, onChange }: PromptBoxProps) {
  return (
    <div className="rounded-[24px] border-2 border-[#7aa74f] bg-white p-4 shadow-[0_8px_24px_rgba(76,96,70,0.05)]">
      <h4 className="text-xl font-extrabold text-[#187d72]">{title}</h4>
      <p className="mt-1 text-sm text-[#7f8b81]">
        원하는 내용을 자세히 입력해주세요.
      </p>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-4 min-h-[100px] w-full rounded-2xl border-2 border-[#d8e5cd] bg-[#fcfdf9] px-4 py-3 text-sm outline-none placeholder:text-[#9aa59d] focus:border-[#96be59]"
      />
    </div>
  );
}

function SelectPromptBox({
  title,
  selectValue,
  onSelectChange,
  options,
  value,
  onTextChange,
  placeholder,
}: SelectPromptBoxProps) {
  return (
    <div className="rounded-[24px] border-2 border-[#7aa74f] bg-white p-5 shadow-[0_8px_24px_rgba(76,96,70,0.05)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h4 className="text-xl font-extrabold text-[#187d72]">{title}</h4>
          <p className="mt-1 text-sm text-[#7f8b81]">
            원하는 옵션을 선택하거나 직접 입력해주세요.
          </p>
        </div>

        <select
          value={selectValue}
          onChange={(e) => onSelectChange(e.target.value)}
          className="rounded-2xl bg-[#27b0a4] px-5 py-3 text-sm font-bold text-white outline-none"
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="text-black"
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <textarea
        value={value}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder={placeholder}
        className="mt-4 min-h-[90px] w-full rounded-2xl border-2 border-[#d8e5cd] bg-[#fcfdf9] px-4 py-3 text-sm outline-none placeholder:text-[#9aa59d] focus:border-[#96be59]"
      />
    </div>
  );
}