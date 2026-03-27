"use client";

import { signOut, useSession } from "next-auth/react";

export default function AuthHeader() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  return (
    <div className="mb-6 flex items-center justify-between rounded-2xl border border-[#d7e3d1] bg-white px-5 py-4 shadow-[0_8px_24px_rgba(76,96,70,0.05)]">
      <div>
        <p className="text-sm text-[#7a857d]">로그인됨</p>
        <p className="font-bold text-[#187d72]">
          {session.user.name || session.user.email || "사용자"}
        </p>
      </div>

      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="rounded-xl bg-[#e8efe6] px-4 py-2 text-sm font-bold text-[#4f5b53] transition hover:brightness-95"
      >
        로그아웃
      </button>
    </div>
  );
}