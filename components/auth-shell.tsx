"use client";

import { ReactNode } from "react";
import { Outfit } from "next/font/google";

const outfit = Outfit({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600", "700"], display: "swap" });

// Same card as the login/register screen (components/watermelon-ui/auth-5.tsx), for the
// smaller auth screens: forgot password and reset password. Always light, like the login.
const LIGHT = { colorScheme: "light", "--background": "#ffffff", "--foreground": "#111111" } as React.CSSProperties;

export function AuthShell({ heading, subtext, children }: { heading: string; subtext: string; children: ReactNode }) {
  return (
    <div translate="no" className={`${outfit.className} notranslate flex min-h-screen w-full items-center justify-center bg-[#ececef] p-3 sm:p-6`} style={LIGHT}>
      <div className="grid w-full max-w-[min(1400px,94vw,calc((100vh_-_48px)*2))] grid-cols-1 gap-4 rounded-[40px] bg-white p-3 text-[#111] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.25),0_2px_6px_rgba(0,0,0,0.04)] sm:p-4 lg:grid-cols-2 2xl:rounded-[48px] 2xl:p-5">
        <div className="relative aspect-[16/9] overflow-hidden rounded-[30px] bg-[#e9e9ee] lg:aspect-square 2xl:rounded-[36px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/auth-fog.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        </div>

        <section className="flex flex-col items-center justify-center px-4 py-10 sm:px-10 lg:py-6">
          <div className="auth-form w-full max-w-[340px] space-y-8 xl:max-w-[380px] 2xl:max-w-[440px]">
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="Snippr" className="h-7 w-auto 2xl:h-9" />
            </div>
            <div className="text-center">
              <h1 className="text-[30px] leading-tight font-bold tracking-[-0.02em] xl:text-[34px] 2xl:text-[40px]">{heading}</h1>
              <p className="mt-1.5 text-[13px] text-[#8e8e93] 2xl:text-[15px]">{subtext}</p>
            </div>
            {children}
          </div>
        </section>
      </div>
    </div>
  );
}

// iOS-style underline field and black pill button, matching the login screen
export const authInputClass =
  "h-11 rounded-none border-0 border-b border-[#d1d1d6] bg-transparent dark:bg-transparent pl-10 text-[15px] text-[#111] shadow-none placeholder:text-[#c7c7cc] focus-visible:border-[#111] focus-visible:ring-0 2xl:h-12 2xl:text-[17px]";
export const authButtonClass =
  "h-12 w-full gap-2 rounded-full bg-[#1c1c1e] text-[15px] font-semibold text-white shadow-[0_8px_20px_-8px_rgba(0,0,0,0.5)] transition-all hover:bg-black active:scale-[0.98] disabled:opacity-60 2xl:h-14 2xl:text-[17px]";
