"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MdLock, MdEmail, MdArrowForward, MdAutoAwesome } from "react-icons/md";

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

export function Auth5({
  brandName = "Nucleus",
  submitLabel = "Sign in",
  onSubmit,
  signUpHref = "#",
  forgotPasswordHref = "#",
  heading = "Welcome back",
  subtext = "Sign in to continue to your workspace.",
  footerText = "Don't have an account?",
  footerLinkText = "Create one for free",
  error,
  loading = false,
  showName = false,
}: Auth5Props) {
  return (
    <div className="flex min-h-screen w-full flex-col p-1 lg:flex-row">
      <section className="bg-background flex flex-1 flex-col items-center justify-center px-6 py-16 sm:px-10 lg:max-w-xl lg:px-16">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
                <MdAutoAwesome className="text-primary-foreground h-4 w-4" />
              </span>
              <span className="text-foreground text-xl font-bold tracking-tight">
                {brandName}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-foreground text-2xl font-extrabold tracking-tight">
              {heading}
            </h1>
            <p className="text-muted-foreground text-sm">
              {subtext}
            </p>
          </div>

          {/* Google / Apple sign-in buttons removed until those providers are actually set up in Supabase */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit?.(e);
            }}
            className="space-y-5"
          >
            {showName && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="Auth5-firstname" className="text-sm font-medium">First name</Label>
                  <Input
                    id="Auth5-firstname"
                    type="text"
                    placeholder="John"
                    className="bg-muted focus-visible:ring-primary/20 focus-visible:border-primary/50 h-11 border-0 px-3.5 shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_1px_4px_0px_rgba(0,0,0,0.08)]"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="Auth5-lastname" className="text-sm font-medium">Last name</Label>
                  <Input
                    id="Auth5-lastname"
                    type="text"
                    placeholder="Doe"
                    className="bg-muted focus-visible:ring-primary/20 focus-visible:border-primary/50 h-11 border-0 px-3.5 shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_1px_4px_0px_rgba(0,0,0,0.08)]"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="Auth5-email" className="text-sm font-medium">
                Email address
              </Label>
              <div className="relative">
                <MdEmail className="text-muted-foreground absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
                <Input
                  id="Auth5-email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  placeholder="you@company.com"
                  className="bg-muted focus-visible:ring-primary/20 focus-visible:border-primary/50 h-11 border-0 pl-10 shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_1px_4px_0px_rgba(0,0,0,0.08)]"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="Auth5-password" className="text-sm font-medium">
                  Password
                </Label>
                <a
                  href={forgotPasswordHref}
                  className="text-primary text-xs font-medium hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <MdLock className="text-muted-foreground absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
                <Input
                  id="Auth5-password"
                  name="password"
                  type="password"
                  autoComplete={showName ? "new-password" : "current-password"}
                  placeholder="••••••••••"
                  className="bg-muted focus-visible:ring-primary/20 focus-visible:border-primary/50 h-11 border-0 pl-10 shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_1px_4px_0px_rgba(0,0,0,0.08)]"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-sm font-medium text-red-500">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="from-primary to-primary/70 h-11 w-full gap-2 bg-linear-to-b font-semibold text-white shadow-sm disabled:opacity-60"
            >
              {submitLabel}
              <MdArrowForward className="h-4 w-4" />
            </Button>
          </form>

          <p className="text-muted-foreground text-center text-sm">
            {footerText}{" "}
            <a
              href={signUpHref}
              className="text-primary font-medium hover:underline"
            >
              {footerLinkText}
            </a>
          </p>
        </div>
      </section>

      <section className="relative hidden flex-1 bg-black p-3 lg:flex">
        <img
          src="/hero-bg.jpg"
          alt=""
          className="h-full w-full rounded-[28px] object-cover"
          style={{ objectPosition: 'center' }}
        />
      </section>
    </div>
  );
}
