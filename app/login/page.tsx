import { signIn } from "../../auth";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f6f3] px-4">
      <div className="w-full max-w-md rounded-3xl border border-[#d7e3d1] bg-white p-8 shadow-[0_10px_30px_rgba(76,96,70,0.06)]">
        <h1 className="text-3xl font-extrabold text-[#187d72]">
          정호 AI Factory
        </h1>
        <p className="mt-3 text-sm text-[#7a857d]">
          로그인 후 프롬프트 생성 도구를 사용할 수 있습니다.
        </p>

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/" });
          }}
          className="mt-8"
        >
          <button
            type="submit"
            className="w-full rounded-2xl bg-[#1877c8] px-6 py-4 text-base font-extrabold text-white shadow-[0_12px_25px_rgba(24,119,200,0.22)] transition hover:brightness-110"
          >
            Google로 로그인
          </button>
        </form>
      </div>
    </div>
  );
}