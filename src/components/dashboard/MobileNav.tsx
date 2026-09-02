"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import {
  MenuIcon,
  CloseIcon,
  PanelIcon,
  DocIcon,
  BriefcaseIcon,
  SparkIcon,
  PuzzleIcon,
  GearIcon,
  ShieldIcon,
} from "@/components/ui/Icons";

const NAV = [
  { href: "/dashboard", label: "Panel", Icon: PanelIcon, exact: true },
  { href: "/dashboard/cv", label: "CV Maestro", Icon: DocIcon },
  { href: "/dashboard/offers", label: "Ofertas", Icon: BriefcaseIcon },
  { href: "/dashboard/creditos", label: "Créditos", Icon: SparkIcon },
  { href: "/dashboard/extension", label: "Extensión", Icon: PuzzleIcon },
  { href: "/dashboard/ajustes", label: "Ajustes", Icon: GearIcon },
];

export function MobileNav({
  name,
  plan,
  offerCount,
  isAdmin = false,
  signOutAction,
}: {
  name: string;
  plan: string;
  offerCount: number;
  isAdmin?: boolean;
  signOutAction: () => Promise<void>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <>
      <div className="flex items-center justify-between border-b border-line bg-canvas px-4 py-3 lg:hidden">
        <Link href="/dashboard">
          <Logo wordClassName="text-ink" />
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-md text-ink transition hover:bg-surface"
          aria-label="Abrir menú"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-forest/95 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        >
          <div className="flex h-full flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-forest-line px-4 py-3">
              <Logo />
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-md text-cream transition hover:bg-forest-soft"
                aria-label="Cerrar menú"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-4">
              {NAV.map(({ href, label, Icon, exact }) => {
                const active = exact
                  ? pathname === href
                  : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-2.5 rounded-[9px] px-3 py-2.5 text-sm transition ${
                      active
                        ? "bg-forest-soft font-semibold text-surface"
                        : "font-medium text-forest-ink hover:bg-forest-soft/60 hover:text-surface"
                    }`}
                  >
                    <Icon className="h-[19px] w-[19px]" />
                    {label}
                    {href === "/dashboard/offers" && offerCount > 0 && (
                      <span
                        className={`ml-auto text-xs font-semibold ${
                          active ? "text-forest-ink-strong" : "text-forest-ink"
                        }`}
                      >
                        {offerCount}
                      </span>
                    )}
                  </Link>
                );
              })}

              {isAdmin && (
                <>
                  <div className="my-2 h-px bg-forest-line" />
                  <Link
                    href="/dashboard/admin/creditos"
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-2.5 rounded-[9px] px-3 py-2.5 text-sm transition ${
                      pathname.startsWith("/dashboard/admin")
                        ? "bg-forest-soft font-semibold text-surface"
                        : "font-medium text-forest-ink hover:bg-forest-soft/60 hover:text-surface"
                    }`}
                  >
                    <ShieldIcon className="h-[19px] w-[19px]" />
                    Recargas
                  </Link>
                </>
              )}
            </nav>

            <div className="border-t border-forest-line p-4">
              <div className="flex items-center gap-2.5 px-2 py-1 mb-3">
                <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-amber font-display text-sm font-bold text-forest">
                  {initials || "?"}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[13.5px] font-semibold text-cream">
                    {name}
                  </span>
                  <span className="text-[11.5px] text-forest-ink">{plan}</span>
                </span>
              </div>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="w-full rounded-[9px] px-3 py-2 text-left text-[13px] font-medium text-forest-ink transition hover:bg-forest-soft hover:text-surface"
                >
                  Cerrar sesión
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
