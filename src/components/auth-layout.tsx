import type { ReactNode } from "react";

import heroImage from "@/assets/hero-apartment.jpg";

/** Shared split layout for sign-in and registration screens. */
export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-10 sm:px-8 lg:grid-cols-2 lg:items-stretch lg:py-16">
      <div className="relative hidden overflow-hidden rounded-2xl border border-border lg:block">
        <img src={heroImage} alt="Bright apartment interior" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-8 text-background">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-80">AD Property Rental</p>
          <p className="mt-2 font-display text-3xl font-medium leading-tight">
            Verified homes, clear agreements, secure payments.
          </p>
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-md flex-col justify-center">
        <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        <div className="mt-8 rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">{children}</div>
        {footer ? <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div> : null}
      </div>
    </div>
  );
}
