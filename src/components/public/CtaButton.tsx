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
      className={className}
      onClick={() => trackCtaClick(location)}
    >
      {children}
    </ButtonLink>
  );
}
