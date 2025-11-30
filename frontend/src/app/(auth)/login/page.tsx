"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { GoogleLoginButton } from "@/components/auth";
import Image from "next/image";

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function LoginContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectUrl);
    }
  }, [isAuthenticated, isLoading, router, redirectUrl]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1a1f2e]">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#1a1f2e]">
      <div className="w-full max-w-lg rounded-2xl bg-[#252b3b] p-10 shadow-xl">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-2 flex items-center gap-3">
            <Image
              src="/waterball.png"
              alt="水球軟體學院"
              width={48}
              height={48}
              className="h-12 w-12"
            />
            <div className="text-left">
              <p className="text-lg font-semibold text-[#4fc3f7]">
                水球軟體學院
              </p>
              <p className="text-sm font-medium tracking-wider text-[#4fc3f7]">
                WATERBALLSA.TW
              </p>
            </div>
          </div>
        </div>

        <p className="mb-6 text-center text-white">請選擇登入方式</p>

        <div className="space-y-6">
          <GoogleLoginButton redirectUrl={redirectUrl} />

          <button
            className="flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-lg bg-[#1877F2] py-3.5 font-medium text-white opacity-60"
            disabled
            title="Facebook 登入功能開發中"
          >
            <FacebookIcon />
            使用 Facebook 登入
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#1a1f2e]">
          <p className="text-white">Loading...</p>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
