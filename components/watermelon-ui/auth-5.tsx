"use client";

// Login / register screen: one big rounded white card on a soft grey page (iOS style),
// playful 3D-style artwork on the left, a clean form with underline fields on the right.
// Light on purpose: the site root always carries the "dark" class, so this screen sets
// its own colours instead of using dark: variants.
import { useState } from "react";
import { Outfit } from "next/font/google";
import { AuthArt } from "@/components/auth-art";

// Left panel: the misty field photo (public/auth-fog.jpg). Set to true for the 3D artwork instead.
const SHOW_3D_ART = false;

const outfit = Outfit({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600", "700"], display: "swap" });

export interface AuthFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface Auth5Props {
  /** Brand / product name shown in the form panel */
  brandName?: string;
  /** Tag line shown below brand name */
  tagline?: string;
  /** Heading for the feature panel */
  panelHeading?: string;
  /** Sub-copy for the feature panel */
  panelSubtext?: string;
  /** List of features shown in the right panel */
  features?: AuthFeature[];
  /** Text for the primary CTA button */
  submitLabel?: string;
  /** Callback when the form is submitted */
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  /** Link href for the sign-up page */
  signUpHref?: string;
  /** Link href for forgot password */
  forgotPasswordHref?: string;
  /** Main heading above the form */
  heading?: string;
  /** Sub-copy below the heading */
  subtext?: string;
  /** Footer prompt text */
  footerText?: string;
  /** Footer link label */
  footerLinkText?: string;
  /** Error message shown above the submit button */
  error?: string;
  /** Disable the submit button (e.g. while loading) */
  loading?: boolean;
  /** Show first/last name fields (for sign-up) */
  showName?: boolean;
}

// iOS-like underline field
function Field({ id, label, children, right }: { id: string; label: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="group">
      <label htmlFor={id} className="mb-1 block text-[12px] 2xl:text-[14px] font-medium text-[#8e8e93]">{label}</label>
      <div className="relative flex items-center border-b border-[#d1d1d6] transition-colors duration-200 group-focus-within:border-[#111]">
        {children}
        {right}
      </div>
    </div>
  );
}
const INPUT = "h-10 2xl:h-12 w-full bg-transparent text-[15px] 2xl:text-[17px] text-[#111] placeholder:text-[#c7c7cc] outline-none";

export function Auth5({
  brandName = "Snippr",
  submitLabel = "Log in",
  onSubmit,
  signUpHref = "#",
  forgotPasswordHref = "#",
  heading = "Welcome Back!",
  subtext = "Enter your details below",
  footerText = "Don't have an account?",
  footerLinkText = "Sign up",
  error,
  loading = false,
  showName = false,
}: Auth5Props) {
  const [showPw, setShowPw] = useState(false);

  return (
    <div className={`${outfit.className} flex min-h-screen w-full items-center justify-center bg-[#ececef] p-3 sm:p-6`} style={{ colorScheme: "light" }}>
      <div className="grid w-full max-w-[min(1400px,94vw,calc((100vh_-_48px)*2))] grid-cols-1 gap-4 rounded-[40px] bg-white p-3 2xl:rounded-[48px] 2xl:p-5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.25),0_2px_6px_rgba(0,0,0,0.04)] sm:p-4 lg:grid-cols-2">
        {/* artwork */}
        <div className="relative aspect-[16/9] overflow-hidden rounded-[30px] bg-[#e9e9ee] lg:aspect-square 2xl:rounded-[36px]">
          {SHOW_3D_ART ? <AuthArt /> : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/auth-fog.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
          )}
        </div>

        {/* form */}
        <section className="flex flex-col items-center justify-center px-4 py-10 sm:px-10 lg:py-6">
          <div className="auth-form w-full max-w-[340px] xl:max-w-[380px] 2xl:max-w-[440px]">
            <div className="mb-9 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt={brandName} className="h-7 w-auto 2xl:h-9" />
            </div>

            <h1 className="text-center text-[32px] xl:text-[36px] 2xl:text-[44px] leading-tight font-bold tracking-[-0.02em] text-[#111]">{heading}</h1>
            <p className="mt-1.5 mb-9 text-center text-[13px] 2xl:mb-11 2xl:text-[15px] text-[#8e8e93]">{subtext}</p>

            <form
              onSubmit={(e) => { e.preventDefault(); onSubmit?.(e); }}
              className="space-y-6 2xl:space-y-7"
            >
              {showName && (
                <div className="grid grid-cols-2 gap-4">
                  <Field id="Auth5-firstname" label="First name">
                    <input id="Auth5-firstname" type="text" autoComplete="given-name" placeholder="John" className={INPUT} required />
                  </Field>
                  <Field id="Auth5-lastname" label="Last name">
                    <input id="Auth5-lastname" type="text" autoComplete="family-name" placeholder="Doe" className={INPUT} />
                  </Field>
                </div>
              )}

              <Field id="Auth5-email" label="Email">
                <input id="Auth5-email" name="email" type="email" autoComplete="username" placeholder="you@example.com" className={INPUT} required />
              </Field>

              <Field
                id="Auth5-password"
                label="Password"
                right={
                  <button type="button" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? "Hide password" : "Show password"}
                    className="ml-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[#8e8e93] transition-colors hover:bg-[#f2f2f7] hover:text-[#111]">
                    {showPw ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3l18 18"/><path d="M10.6 5.1A10.6 10.6 0 0 1 12 5c6.4 0 10 7 10 7a17.7 17.7 0 0 1-3.2 4.2M6.6 6.6C3.9 8.4 2 12 2 12s3.6 7 10 7a9.7 9.7 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>
                    )}
                  </button>
                }
              >
                <input id="Auth5-password" name="password" type={showPw ? "text" : "password"} autoComplete={showName ? "new-password" : "current-password"} placeholder="••••••••" className={INPUT} required />
              </Field>

              {!showName && (
                <div className="flex items-center justify-between text-[12px] 2xl:text-[14px]">
                  <label htmlFor="Auth5-remember" className="flex cursor-pointer items-center gap-2 text-[#3a3a3c] select-none">
                    <input id="Auth5-remember" type="checkbox" defaultChecked className="peer sr-only" />
                    <span className="flex h-[18px] w-[18px] items-center justify-center rounded-[6px] border border-[#c7c7cc] bg-white transition-colors peer-checked:border-[#111] peer-checked:bg-[#111] peer-focus-visible:ring-2 peer-focus-visible:ring-[#111]/30 [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>
                    </span>
                    Remember me
                  </label>
                  <a href={forgotPasswordHref} className="text-[#8e8e93] transition-colors hover:text-[#111]">Forgot password?</a>
                </div>
              )}

              {error && (
                <p role="alert" className="rounded-2xl bg-[#fff1f0] px-4 py-3 text-[13px] leading-snug text-[#d70015]">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="h-12 2xl:h-14 w-full rounded-full bg-[#1c1c1e] text-[15px] 2xl:text-[17px] font-semibold text-white shadow-[0_8px_20px_-8px_rgba(0,0,0,0.5)] transition-all duration-200 hover:bg-black active:scale-[0.98] disabled:opacity-60"
              >
                {submitLabel}
              </button>
            </form>

            <p className="mt-10 text-center text-[12px] 2xl:text-[14px] text-[#8e8e93]">
              {footerText}{" "}
              <a href={signUpHref} className="font-semibold text-[#111] hover:underline">{footerLinkText}</a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
