"use client";

import { ReactNode } from "react";
import { MdAutoAwesome } from "react-icons/md";

// Same two-panel look as the login/register pages (components/watermelon-ui/auth-5.tsx),
// for the smaller auth screens: forgot password and reset password.
export function AuthShell({ heading, subtext, children }: { heading: string; subtext: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col p-1 lg:flex-row">
      <section className="bg-background flex flex-1 flex-col items-center justify-center px-6 py-16 sm:px-10 lg:max-w-xl lg:px-16">
        <div className="w-full max-w-sm space-y-8">
          <div className="flex items-center gap-2">
            <span className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <MdAutoAwesome className="text-primary-foreground h-4 w-4" />
            </span>
            <span className="text-foreground text-xl font-bold tracking-tight">Snippr</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-foreground text-2xl font-extrabold tracking-tight">{heading}</h1>
            <p className="text-muted-foreground text-sm">{subtext}</p>
          </div>

          {children}
        </div>
      </section>

      <section className="relative hidden flex-1 bg-black p-3 lg:flex">
        <img src="/hero-bg.jpg" alt="" className="h-full w-full rounded-[28px] object-cover" style={{ objectPosition: "center" }} />
      </section>
    </div>
  );
}

export const authInputClass =
  "bg-muted focus-visible:ring-primary/20 focus-visible:border-primary/50 h-11 border-0 pl-10 shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_1px_4px_0px_rgba(0,0,0,0.08)]";
export const authButtonClass =
  "from-primary to-primary/70 h-11 w-full gap-2 bg-linear-to-b font-semibold text-white shadow-sm disabled:opacity-60";
