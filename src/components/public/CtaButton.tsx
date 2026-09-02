"use client";

import { ButtonLink } from "@/components/ui/Button";
import { trackCtaClick } from "@/lib/analytics";

export function CtaButton({
  location,
  href,
  children,
  className = "",
}: {
  location: "hero" | "pricing" | "final";
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <ButtonLink
      href={href}
      className={`w-full whitespace-normal sm:w-auto ${className}`}
      onClick={() => trackCtaClick(location)}
    >
      {children}
    </ButtonLink>
  );
}
