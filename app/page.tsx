"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildAllPromptsText,
  canUseImageSize,
  CameraDistanceOption,
  getCameraDistanceLabel,
  getShotTypeLabel,
  PoseCategoryOption,
  PromptCard,
  ShotTypeOption,
} from "@/lib/fitbuilder";

type ApiResponse = {
  ok: boolean;
  message?: string;
  referenceMapText: string;
  prompts: PromptCard[];
  analysis?: {
    clothingSummary?: string;
    recommendedBottom?: string;
    hairSummary?: string;
    overallMood?: string;
  };
};

type PreviewItem = {
  id: string;
  file: File;
  url: string;
};

type SimpleOption = {
  key: string;
  label: string;
};

const LIGHTING_OPTIONS = [
  { key: "auto", label: "자동" },
  { key: "soft_natural", label: "부드러운 자연광" },
  { key: "sunlit_natural", label: "햇살이 비치는 자연광" },
  { key: "warm_indoor", label: "따뜻한 실내 조명" },
  { key: "hotel_mood", label: "호텔 무드 조명" },
  { key: "studio_softbox", label: "스튜디오 소프트박스" },
  { key: "sunset_glow", label: "노을빛 조명" },
] as const;

const FILM_OPTIONS = [
  { key: "auto", label: "자동" },
  { key: "clean_digital", label: "깨끗한 디지털" },
  { key: "warm_film", label: "따뜻한 필름톤" },
  { key: "cream_tone", label: "크림 무드톤" },
  { key: "vintage_faded", label: "바랜 빈티지" },
  { key: "magazine_crisp", label: "매거진 선명톤" },
  { key: "iphone_real", label: "아이폰 리얼톤" },
] as const;

const STYLE_OPTIONS = [
  { key: "auto", label: "자동" },
  { key: "ecommerce", label: "쇼핑몰 상세페이지" },
  { key: "lookbook", label: "룩북" },
  { key: "daily_mood", label: "감성 데일리룩" },
  { key: "editorial", label: "프리미엄 매거진" },
  { key: "ugc", label: "아이폰 UGC" },
  { key: "guestlook", label: "하객룩 화보" },
] as const;

const GAZE_OPTIONS = [
  { key: "auto", label: "자동 추천" },
  { key: "front", label: "정면" },
  { key: "slight_side", label: "살짝 옆" },
  { key: "side", label: "완전 옆" },
  { key: "down", label: "아래" },
  { key: "far", label: "먼 곳" },
  { key: "back_turn", label: "뒤돌아봄" },
  { key: "not_camera", label: "카메라 안 봄" },
  { key: "mirror", label: "거울 속 시선" },
] as const;

const EXPRESSION_OPTIONS = [
  { key: "auto", label: "자동 추천" },
  { key: "chic", label: "무표정 시크" },
  { key: "soft_smile", label: "은은한 미소" },
  { key: "bright_smile", label: "밝은 미소" },
  { key: "calm", label: "차분한 표정" },
  { key: "dreamy", label: "몽환적인 표정" },
  { key: "daily", label: "데일리 표정" },
  { key: "focused", label: "집중한 듯한 표정" },
] as const;

const HAIR_OPTIONS = [
  { key: "keep_uploaded", label: "업로드 헤어 유지" },
  { key: "auto", label: "자동 추천" },
  { key: "long_straight", label: "긴 생머리" },
  { key: "c_curl", label: "자연스러운 C컬" },
  { key: "wave", label: "웨이브" },
  { key: "low_bun", label: "로우번" },
  { key: "ponytail", label: "포니테일" },
  { key: "half_up", label: "반묶음" },
  { key: "neat_updo", label: "단정한 묶음머리" },
  { key: "short_cut", label: "숏컷" },
  { key: "behind_ear", label: "귀 뒤로 넘긴 스타일" },
] as const;

const SHOT_TYPE_OPTIONS: { key: ShotTypeOption; label: string }[] = [
  { key: "full", label: "전신컷" },
  { key: "upper", label: "상반신컷" },
  { key: "lower", label: "하반신컷" },
  { key: "selfie_upper", label: "상반 셀카" },
  { key: "neck_crop", label: "목짤컷" },
];

const DISTANCE_OPTIONS: { key: CameraDistanceOption; label: string }[] = [
  { key: "close", label: "가까움" },
  { key: "normal", label: "보통" },
  { key: "far", label: "멀게" },
  { key: "very_far", label: "아주 멀게" },
];

const POSE_CATEGORY_OPTIONS: { key: PoseCategoryOption; label: string }[] = [
  { key: "recommended", label: "추천컷" },
  { key: "general", label: "일반컷" },
  { key: "general_sitting", label: "일반앉은컷" },
  { key: "general_chair", label: "일반의자컷" },
  { key: "selfie", label: "셀카컷" },
  { key: "selfie_sitting", label: "셀카앉은컷" },
  { key: "selfie_chair", label: "셀카의자컷" },
  { key: "wall_lean", label: "벽기댐컷" },
  { key: "floor_sitting", label: "바닥앉은컷" },
  { key: "bed", label: "침대컷" },
  { key: "back_view", label: "뒤돌아보는컷" },
  { key: "walking", label: "워킹컷" },
  { key: "bag_focus", label: "가방/소품 강조컷" },
];

const POSE_COUNT_OPTIONS = [1, 3, 5, 10, 20];

function makePreviewItems(files: File[]) {
  return files.map((file, index) => ({
    id: `${file.name}-${file.lastModified}-${index}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    file,
    url: URL.createObjectURL(file),
  }));
}

function usePreviewState(initial: File[] = []) {
  const [items, setItems] = useState<PreviewItem[]>(() =>
    makePreviewItems(initial)
  );

  useEffect(() => {
    return () => {
      items.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [items]);

  const appendFiles = (files: File[]) => {
    if (!files.length) return;
    setItems((prev) => [...prev, ...makePreviewItems(files)]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((item) => item.id !== id);
    });
  };

  const clear = () => {
    setItems((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.url));
      return [];
    });
  };

  return {
    items,
    files: items.map((item) => item.file),
    appendFiles,
    removeItem,
    clear,
  };
}

function SelectBox({
  title,
  value,
  onChange,
  options,
}: {
  title: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly SimpleOption[];
}) {
  return (
    <div style={panelStyle}>
      <div style={labelStyle}>{title}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={selectStyle}
      >
        {options.map((opt) => (
          <option key={opt.key} value={opt.key}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function UploadCard({
  title,
  description,
  note,
  setNote,
  items,
  onAddFiles,
  onRemoveItem,
}: {
  title: string;
  description: string;
  note: string;
  setNote: (value: string) => void;
  items: PreviewItem[];
  onAddFiles: (files: File[]) => void;
  onRemoveItem: (id: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (fileList: FileList | null) => {
    const files = Array.from(fileList || []).filter((file) =>
      file.type.startsWith("image/")
    );
    if (files.length) onAddFiles(files);
  };

  return (
    <div style={uploadCardStyle}>
      <div style={labelRow}>
        <div>
          <div style={uploadTitle}>{title}</div>
          <div style={uploadDesc}>{description}</div>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          style={smallButton}
        >
          이미지 추가
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={(e) => {
          handleFiles(e.target.files);
          e.currentTarget.value = "";
        }}
      />

      <div
        style={{
          ...dropZoneStyle,
          ...(dragging ? dropZoneActiveStyle : {}),
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          if (e.currentTarget === e.target) setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
      >
        <div style={{ fontWeight: 700, marginBottom: 6 }}>
          드래그 앤 드롭 또는 클릭해서 업로드
        </div>
        <div style={{ fontSize: 13, opacity: 0.72 }}>
          여러 장 업로드 가능 · 현재 {items.length}장
        </div>
      </div>

      {items.length > 0 && (
        <div style={previewGridStyle}>
          {items.map((item) => (
            <div key={item.id} style={previewBoxStyle}>
              <img src={item.url} alt={item.file.name} style={previewImageStyle} />
              <button
                type="button"
                onClick={() => onRemoveItem(item.id)}
                style={removeButtonStyle}
                aria-label="remove image"
              >
                ×
              </button>
              <div style={previewNameStyle}>{item.file.name}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <div style={{ ...labelStyle, marginBottom: 8 }}>설명</div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="예: 햇살 들어오는 크림톤 방 / 20대 한국인 여성 / 원단감 살려서 / 상의만 참고 / 소품은 포인트만"
          style={textareaStyle}
        />
      </div>
    </div>
  );
}

export default function Page() {
  const backgroundState = usePreviewState();
  const modelState = usePreviewState();
  const clothing1State = usePreviewState();
  const clothing2State = usePreviewState();
  const accessory1State = usePreviewState();
  const accessory2State = usePreviewState();

  const [backgroundNote, setBackgroundNote] = useState("");
  const [modelNote, setModelNote] = useState("");
  const [clothing1Note, setClothing1Note] = useState("");
  const [clothing2Note, setClothing2Note] = useState("");
  const [accessory1Note, setAccessory1Note] = useState("");
  const [accessory2Note, setAccessory2Note] = useState("");
  const [extraInstructions, setExtraInstructions] = useState("");

  const [ratio, setRatio] = useState("4:5");
  const [imageModel, setImageModel] = useState("gemini-3.1-flash-image-preview");
  const [imageSize, setImageSize] = useState("1K");
  const [generateMode, setGenerateMode] = useState("prompt_only");

  const [lighting, setLighting] = useState("sunlit_natural");
  const [filmTone, setFilmTone] = useState("magazine_crisp");
  const [style, setStyle] = useState("ecommerce");

  const [shotType, setShotType] = useState<ShotTypeOption>("full");
  const [cameraDistance, setCameraDistance] =
    useState<CameraDistanceOption>("far");
  const [poseCategories, setPoseCategories] = useState<PoseCategoryOption[]>([
    "recommended",
    "general",
  ]);
  const [poseCount, setPoseCount] = useState(1);

  const [gazeOption, setGazeOption] = useState("auto");
  const [expressionOption, setExpressionOption] = useState("auto");
  const [hairstyle, setHairstyle] = useState("keep_uploaded");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [referenceMapText, setReferenceMapText] = useState("");
  const [analysisSummary, setAnalysisSummary] = useState<{
    clothingSummary?: string;
    recommendedBottom?: string;
    hairSummary?: string;
    overallMood?: string;
  } | null>(null);
  const [prompts, setPrompts] = useState<PromptCard[]>([]);
  const [lightboxImage, setLightboxImage] = useState<{
    src: string;
    title: string;
  } | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);

  const allPromptsText = useMemo(() => buildAllPromptsText(prompts), [prompts]);

  const imageSizeDisabled = !canUseImageSize(
    imageModel as
      | "gemini-2.5-flash-image"
      | "gemini-3.1-flash-image-preview"
      | "gemini-3-pro-image-preview"
  );

  async function handleGenerate() {
    setLoading(true);
    setError("");
    setReferenceMapText("");
    setAnalysisSummary(null);
    setPrompts([]);

    try {
      const totalImageCount =
        backgroundState.files.length +
        modelState.files.length +
        clothing1State.files.length +
        clothing2State.files.length +
        accessory1State.files.length +
        accessory2State.files.length;

      if (totalImageCount === 0) {
        throw new Error("최소 1장 이상의 참고 이미지를 업로드해주세요.");
      }

      if (poseCategories.length === 0) {
        throw new Error("포즈를 최소 1개 이상 선택해주세요.");
      }

      const formData = new FormData();

      backgroundState.files.forEach((file) =>
        formData.append("backgroundImages", file)
      );
      modelState.files.forEach((file) => formData.append("modelImages", file));
      clothing1State.files.forEach((file) =>
        formData.append("clothing1Images", file)
      );
      clothing2State.files.forEach((file) =>
        formData.append("clothing2Images", file)
      );
      accessory1State.files.forEach((file) =>
        formData.append("accessory1Images", file)
      );
      accessory2State.files.forEach((file) =>
        formData.append("accessory2Images", file)
      );

      formData.append("backgroundNote", backgroundNote);
      formData.append("modelNote", modelNote);
      formData.append("clothing1Note", clothing1Note);
      formData.append("clothing2Note", clothing2Note);
      formData.append("accessory1Note", accessory1Note);
      formData.append("accessory2Note", accessory2Note);
      formData.append("extraInstructions", extraInstructions);

      formData.append("ratio", ratio);
      formData.append("imageModel", imageModel);
      formData.append("imageSize", imageSizeDisabled ? "auto" : imageSize);
      formData.append("generateMode", generateMode);

      formData.append("lighting", lighting);
      formData.append("filmTone", filmTone);
      formData.append("style", style);

      formData.append("shotType", shotType);
      formData.append("cameraDistance", cameraDistance);
      formData.append("poseCategories", JSON.stringify(poseCategories));
      formData.append("poseCount", String(poseCount));

      formData.append("gazeOption", gazeOption);
      formData.append("expressionOption", expressionOption);
      formData.append("hairstyle", hairstyle);

      const res = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      const data = (await res.json()) as ApiResponse;

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "생성 중 오류가 발생했습니다.");
      }

      setReferenceMapText(data.referenceMapText || "");
      setAnalysisSummary(data.analysis || null);
      setPrompts(data.prompts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      alert("복사됐습니다.");
    } catch {
      alert("복사에 실패했습니다.");
    }
  }

  function downloadImage(dataUrl: string, fileName: string) {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function downloadAllImages() {
    try {
      setDownloadingAll(true);

      const imageItems = prompts.filter((item) => item.imageDataUrl);

      if (!imageItems.length) {
        alert("다운로드할 이미지가 없습니다.");
        return;
      }

      imageItems.forEach((item, index) => {
        const safeTitle = item.title.replace(/[^\w\-가-힣]+/g, "_");
        downloadImage(
          item.imageDataUrl as string,
          `${index + 1}_${safeTitle}.png`
        );
      });
    } finally {
      setDownloadingAll(false);
    }
  }

  function clearAll() {
    backgroundState.clear();
    modelState.clear();
    clothing1State.clear();
    clothing2State.clear();
    accessory1State.clear();
    accessory2State.clear();

    setBackgroundNote("");
    setModelNote("");
    setClothing1Note("");
    setClothing2Note("");
    setAccessory1Note("");
    setAccessory2Note("");
    setExtraInstructions("");

    setReferenceMapText("");
    setAnalysisSummary(null);
    setPrompts([]);
    setError("");
  }

  function togglePoseCategory(key: PoseCategoryOption) {
    setPoseCategories((prev) =>
      prev.includes(key) ? prev.filter((v) => v !== key) : [...prev, key]
    );
  }

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>
          FitBuilder
        </h1>
        <p style={{ opacity: 0.75, marginBottom: 24 }}>
          참조 이미지 번호 기반 프롬프트 생성 + Gemini 이미지 생성
        </p>

        <div style={sectionTitleStyle}>참고 이미지 업로드</div>
        <div style={uploadGridStyle}>
          <UploadCard
            title="배경 이미지"
            description="배경, 공간, 인테리어"
            note={backgroundNote}
            setNote={setBackgroundNote}
            items={backgroundState.items}
            onAddFiles={backgroundState.appendFiles}
            onRemoveItem={backgroundState.removeItem}
          />
          <UploadCard
            title="모델 이미지"
            description="얼굴, 체형, 헤어 참고"
            note={modelNote}
            setNote={setModelNote}
            items={modelState.items}
            onAddFiles={modelState.appendFiles}
            onRemoveItem={modelState.removeItem}
          />
          <UploadCard
            title="의류 1"
            description="주요 의상 참고"
            note={clothing1Note}
            setNote={setClothing1Note}
            items={clothing1State.items}
            onAddFiles={clothing1State.appendFiles}
            onRemoveItem={clothing1State.removeItem}
          />
          <UploadCard
            title="의류 2"
            description="보조 의상 또는 하의 참고"
            note={clothing2Note}
            setNote={setClothing2Note}
            items={clothing2State.items}
            onAddFiles={clothing2State.appendFiles}
            onRemoveItem={clothing2State.removeItem}
          />
          <UploadCard
            title="소품 1"
            description="가방, 신발, 악세서리"
            note={accessory1Note}
            setNote={setAccessory1Note}
            items={accessory1State.items}
            onAddFiles={accessory1State.appendFiles}
            onRemoveItem={accessory1State.removeItem}
          />
          <UploadCard
            title="소품 2"
            description="추가 소품 참고"
            note={accessory2Note}
            setNote={setAccessory2Note}
            items={accessory2State.items}
            onAddFiles={accessory2State.appendFiles}
            onRemoveItem={accessory2State.removeItem}
          />
        </div>

        <div style={sectionTitleStyle}>출력 설정</div>
        <div style={grid4Style}>
          <div style={panelStyle}>
            <div style={labelStyle}>비율</div>
            <select
              value={ratio}
              onChange={(e) => setRatio(e.target.value)}
              style={selectStyle}
            >
              <option value="1:1">1:1</option>
              <option value="4:5">4:5</option>
              <option value="16:9">16:9</option>
              <option value="9:16">9:16</option>
            </select>
          </div>

          <div style={panelStyle}>
            <div style={labelStyle}>생성 모델</div>
            <select
              value={imageModel}
              onChange={(e) => setImageModel(e.target.value)}
              style={selectStyle}
            >
              <option value="gemini-2.5-flash-image">
                Gemini 2.5 Flash Image
              </option>
              <option value="gemini-3.1-flash-image-preview">
                Gemini 3.1 Flash Image
              </option>
              <option value="gemini-3-pro-image-preview">
                Gemini 3 Pro Image
              </option>
            </select>
          </div>

          <div style={panelStyle}>
            <div style={labelStyle}>해상도</div>
            <select
              value={imageSizeDisabled ? "auto" : imageSize}
              onChange={(e) => setImageSize(e.target.value)}
              disabled={imageSizeDisabled}
              style={{
                ...selectStyle,
                opacity: imageSizeDisabled ? 0.55 : 1,
              }}
            >
              <option value="auto">기본</option>
              <option value="1K">1K</option>
              <option value="2K">2K</option>
              <option value="4K">4K</option>
            </select>
            {imageSizeDisabled && (
              <div style={hintTextStyle}>2.5 Flash Image는 비율만 사용</div>
            )}
          </div>

          <div style={panelStyle}>
            <div style={labelStyle}>생성 방식</div>
            <select
              value={generateMode}
              onChange={(e) => setGenerateMode(e.target.value)}
              style={selectStyle}
            >
              <option value="prompt_only">프롬프트만 생성</option>
              <option value="prompt_and_image">
                프롬프트 + Gemini 이미지 생성
              </option>
            </select>
          </div>
        </div>

        <div style={grid3Style}>
          <SelectBox
            title="조명"
            value={lighting}
            onChange={setLighting}
            options={LIGHTING_OPTIONS}
          />
          <SelectBox
            title="필름 / 톤"
            value={filmTone}
            onChange={setFilmTone}
            options={FILM_OPTIONS}
          />
          <SelectBox
            title="스타일"
            value={style}
            onChange={setStyle}
            options={STYLE_OPTIONS}
          />
        </div>

        <div style={panelStyle}>
          <div style={labelStyle}>컷 타입</div>
          <div style={pillRowStyle}>
            {SHOT_TYPE_OPTIONS.map((opt) => {
              const active = shotType === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setShotType(opt.key)}
                  style={active ? activePillStyle : pillStyle}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={panelStyle}>
          <div style={labelStyle}>거리</div>
          <div style={pillRowStyle}>
            {DISTANCE_OPTIONS.map((opt) => {
              const active = cameraDistance === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setCameraDistance(opt.key)}
                  style={active ? activePillStyle : pillStyle}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: 8, fontSize: 13, opacity: 0.72 }}>
            현재 거리: {getCameraDistanceLabel(cameraDistance)}
          </div>
        </div>

        <div style={panelStyle}>
          <div style={labelStyle}>포즈 선택 / 수량</div>
          <div style={poseCountWrapStyle}>
            <div style={pillRowStyle}>
              {POSE_CATEGORY_OPTIONS.map((opt) => {
                const active = poseCategories.includes(opt.key);
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => togglePoseCategory(opt.key)}
                    style={active ? activePillStyle : pillStyle}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            <div style={pillRowStyle}>
              {POSE_COUNT_OPTIONS.map((count) => {
                const active = poseCount === count;
                return (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setPoseCount(count)}
                    style={active ? activeCountPillStyle : countPillStyle}
                  >
                    {count}
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ marginTop: 10, fontSize: 13, opacity: 0.72 }}>
            선택 포즈 {poseCategories.length}개 · 총 생성 수량 {poseCount}개 ·{" "}
            {getShotTypeLabel(shotType)} · {getCameraDistanceLabel(cameraDistance)}
          </div>
        </div>

        <div style={grid3Style}>
          <SelectBox
            title="시선"
            value={gazeOption}
            onChange={setGazeOption}
            options={GAZE_OPTIONS}
          />
          <SelectBox
            title="표정"
            value={expressionOption}
            onChange={setExpressionOption}
            options={EXPRESSION_OPTIONS}
          />
          <SelectBox
            title="헤어스타일"
            value={hairstyle}
            onChange={setHairstyle}
            options={HAIR_OPTIONS}
          />
        </div>

        <div style={panelStyle}>
          <div style={labelStyle}>추가 요청사항</div>
          <textarea
            value={extraInstructions}
            onChange={(e) => setExtraInstructions(e.target.value)}
            placeholder="예: 상세페이지용, 과한 연출 금지, 쇼핑몰 느낌, 원단감 최우선, 얼굴은 동일하게 유지"
            style={{ ...textareaStyle, minHeight: 110 }}
          />
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              ...primaryButtonStyle,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "생성 중..." : "생성하기"}
          </button>

          <button onClick={clearAll} style={ghostButtonStyle}>
            초기화
          </button>

          {!!prompts.length && (
            <button onClick={() => copyText(allPromptsText)} style={ghostButtonStyle}>
              전체 프롬프트 복사
            </button>
          )}

          {!!prompts.some((item) => item.imageDataUrl) && (
            <button onClick={downloadAllImages} style={ghostButtonStyle}>
              {downloadingAll ? "이미지 다운로드 중..." : "전체 이미지 다운로드"}
            </button>
          )}
        </div>

        {!!error && <div style={errorBoxStyle}>{error}</div>}

        {!!referenceMapText && (
          <div style={resultCardStyle}>
            <div style={resultTitleStyle}>참조 이미지 번호</div>
            <pre style={preStyle}>{referenceMapText}</pre>
          </div>
        )}

        {analysisSummary && (
          <div style={resultCardStyle}>
            <div style={resultTitleStyle}>AI 분석 요약</div>
            <div style={analysisGridStyle}>
              <div style={miniCardStyle}>
                <div style={miniTitleStyle}>의상 요약</div>
                <div>{analysisSummary.clothingSummary || "-"}</div>
              </div>
              <div style={miniCardStyle}>
                <div style={miniTitleStyle}>무드</div>
                <div>{analysisSummary.overallMood || "-"}</div>
              </div>
              <div style={miniCardStyle}>
                <div style={miniTitleStyle}>헤어 요약</div>
                <div>{analysisSummary.hairSummary || "-"}</div>
              </div>
              <div style={miniCardStyle}>
                <div style={miniTitleStyle}>추천 코디</div>
                <div>{analysisSummary.recommendedBottom || "-"}</div>
              </div>
            </div>
          </div>
        )}

        {!!prompts.length && (
          <div style={{ marginTop: 28 }}>
            <div style={resultTitleStyle}>생성된 프롬프트</div>
            <div style={{ display: "grid", gap: 14 }}>
              {prompts.map((item) => (
                <div key={item.id} style={resultCardStyle}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      flexWrap: "wrap",
                      alignItems: "flex-start",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 800 }}>
                        {item.title}
                      </div>
                      <div style={metaTextStyle}>
                        {item.poseCategoryLabel} | {item.shotTypeLabel} |{" "}
                        {item.distanceLabel}
                      </div>
                      <div style={metaTextStyle}>포즈: {item.poseLabel}</div>
                      <div style={metaTextStyle}>시선: {item.gaze}</div>
                      <div style={metaTextStyle}>표정: {item.expression}</div>
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button
                        onClick={() => copyText(item.prompt)}
                        style={ghostButtonStyle}
                      >
                        이 프롬프트 복사
                      </button>

                      {item.imageDataUrl && (
                        <button
                          onClick={() =>
                            downloadImage(
                              item.imageDataUrl as string,
                              `${item.title.replace(/[^\w\-가-힣]+/g, "_")}.png`
                            )
                          }
                          style={ghostButtonStyle}
                        >
                          이미지 다운로드
                        </button>
                      )}
                    </div>
                  </div>

                  <pre style={compactPreStyle}>{item.prompt}</pre>

                  {item.imageError && (
                    <div
                      style={{
                        marginTop: 12,
                        padding: 12,
                        borderRadius: 12,
                        background: "#fff1f2",
                        color: "#9f1239",
                        border: "1px solid #fecdd3",
                        fontSize: 13,
                      }}
                    >
                      이미지 생성 실패: {item.imageError}
                    </div>
                  )}

                  {item.imageDataUrl && (
                    <div style={{ marginTop: 14 }}>
                      <img
                        src={item.imageDataUrl}
                        alt={item.title}
                        onClick={() =>
                          setLightboxImage({
                            src: item.imageDataUrl as string,
                            title: item.title,
                          })
                        }
                        style={{
                          width: "100%",
                          maxWidth: 560,
                          borderRadius: 16,
                          border: "1px solid #e5e7eb",
                          display: "block",
                          cursor: "zoom-in",
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.72)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            zIndex: 9999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "95vw",
              maxHeight: "95vh",
              background: "#fff",
              borderRadius: 20,
              padding: 16,
              boxShadow: "0 20px 60px rgba(0,0,0,0.28)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "center",
                marginBottom: 12,
                flexWrap: "wrap",
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 18 }}>
                {lightboxImage.title}
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  onClick={() =>
                    downloadImage(
                      lightboxImage.src,
                      `${lightboxImage.title.replace(/[^\w\-가-힣]+/g, "_")}.png`
                    )
                  }
                  style={ghostButtonStyle}
                >
                  다운로드
                </button>

                <button
                  onClick={() => setLightboxImage(null)}
                  style={ghostButtonStyle}
                >
                  닫기
                </button>
              </div>
            </div>

            <img
              src={lightboxImage.src}
              alt={lightboxImage.title}
              style={{
                maxWidth: "90vw",
                maxHeight: "80vh",
                display: "block",
                borderRadius: 14,
              }}
            />
          </div>
        </div>
      )}
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#f5f6f8",
  padding: "28px 16px 72px",
};

const containerStyle: React.CSSProperties = {
  maxWidth: 1240,
  margin: "0 auto",
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 800,
  marginTop: 26,
  marginBottom: 12,
};

const uploadGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: 16,
};

const grid4Style: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 14,
};

const grid3Style: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: 14,
  marginTop: 14,
};

const panelStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #dfe3e8",
  borderRadius: 18,
  padding: 14,
  boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)",
  marginTop: 14,
};

const uploadCardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #dfe3e8",
  borderRadius: 18,
  padding: 14,
  boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)",
};

const labelRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
  marginBottom: 12,
};

const uploadTitle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 800,
  lineHeight: 1.2,
};

const uploadDesc: React.CSSProperties = {
  fontSize: 13,
  opacity: 0.72,
  marginTop: 4,
};

const labelStyle: React.CSSProperties = {
  fontWeight: 700,
  fontSize: 14,
  marginBottom: 10,
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  height: 44,
  borderRadius: 12,
  border: "1px solid #cfd6df",
  padding: "0 12px",
  background: "#fff",
  fontSize: 15,
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 88,
  resize: "vertical",
  borderRadius: 12,
  border: "1px solid #cfd6df",
  padding: "12px",
  fontSize: 14,
  lineHeight: 1.5,
  background: "#fff",
};

const dropZoneStyle: React.CSSProperties = {
  border: "1.5px dashed #c8d0da",
  borderRadius: 16,
  background: "#fafbfc",
  minHeight: 92,
  padding: "18px 14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  textAlign: "center",
  cursor: "pointer",
};

const dropZoneActiveStyle: React.CSSProperties = {
  border: "1.5px dashed #5b7cff",
  background: "#eef3ff",
};

const previewGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(92px, 1fr))",
  gap: 10,
  marginTop: 12,
};

const previewBoxStyle: React.CSSProperties = {
  position: "relative",
  borderRadius: 12,
  overflow: "hidden",
  border: "1px solid #e5e7eb",
  background: "#fff",
};

const previewImageStyle: React.CSSProperties = {
  width: "100%",
  aspectRatio: "1 / 1",
  objectFit: "cover",
  display: "block",
};

const previewNameStyle: React.CSSProperties = {
  fontSize: 11,
  lineHeight: 1.35,
  padding: "6px 7px",
  borderTop: "1px solid #eef2f7",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const removeButtonStyle: React.CSSProperties = {
  position: "absolute",
  top: 6,
  right: 6,
  width: 24,
  height: 24,
  borderRadius: "999px",
  border: "none",
  background: "rgba(17, 24, 39, 0.82)",
  color: "#fff",
  fontSize: 16,
  cursor: "pointer",
  lineHeight: 1,
};

const pillRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

const pillStyle: React.CSSProperties = {
  height: 40,
  padding: "0 16px",
  borderRadius: 999,
  border: "1px solid #cfd6df",
  background: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};

const activePillStyle: React.CSSProperties = {
  ...pillStyle,
  border: "1px solid #6d7df5",
  background: "#eef2ff",
};

const countPillStyle: React.CSSProperties = {
  height: 44,
  minWidth: 54,
  padding: "0 16px",
  borderRadius: 14,
  border: "1px solid #cfd6df",
  background: "#fff",
  fontWeight: 800,
  cursor: "pointer",
};

const activeCountPillStyle: React.CSSProperties = {
  ...countPillStyle,
  border: "1px solid #111827",
  background: "#111827",
  color: "#fff",
};

const poseCountWrapStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  flexWrap: "wrap",
  alignItems: "center",
};

const primaryButtonStyle: React.CSSProperties = {
  height: 46,
  padding: "0 20px",
  border: "none",
  borderRadius: 14,
  background: "#111827",
  color: "#fff",
  fontWeight: 800,
  fontSize: 16,
};

const ghostButtonStyle: React.CSSProperties = {
  height: 46,
  padding: "0 18px",
  border: "1px solid #cfd6df",
  borderRadius: 14,
  background: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};

const smallButton: React.CSSProperties = {
  height: 36,
  padding: "0 12px",
  border: "1px solid #cfd6df",
  borderRadius: 12,
  background: "#fff",
  fontWeight: 700,
  cursor: "pointer",
  flexShrink: 0,
};

const hintTextStyle: React.CSSProperties = {
  fontSize: 12,
  opacity: 0.65,
  marginTop: 6,
};

const errorBoxStyle: React.CSSProperties = {
  marginTop: 16,
  padding: 14,
  borderRadius: 14,
  background: "#fff1f2",
  color: "#9f1239",
  border: "1px solid #fecdd3",
};

const resultCardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #dfe3e8",
  borderRadius: 18,
  padding: 18,
  boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)",
};

const resultTitleStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 800,
  marginBottom: 12,
};

const preStyle: React.CSSProperties = {
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  fontSize: 13,
  lineHeight: 1.65,
  background: "#f8fafc",
  borderRadius: 14,
  padding: 14,
  border: "1px solid #e5e7eb",
  overflowX: "auto",
};

const compactPreStyle: React.CSSProperties = {
  ...preStyle,
  marginTop: 14,
  maxHeight: 130,
  overflowY: "auto",
  fontSize: 12,
};

const analysisGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
};

const miniCardStyle: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 14,
  background: "#fafafa",
};

const miniTitleStyle: React.CSSProperties = {
  fontWeight: 800,
  marginBottom: 8,
  fontSize: 14,
};

const metaTextStyle: React.CSSProperties = {
  fontSize: 13,
  opacity: 0.72,
  marginTop: 4,
};