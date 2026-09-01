"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import {
  BriefcaseIcon,
  DocIcon,
  GearIcon,
  PanelIcon,
  SendIcon,
} from "@/components/ui/Icons";

const NAV = [
  { href: "/dashboard", label: "Panel", Icon: PanelIcon, exact: true },
  { href: "/dashboard/cv", label: "CV Maestro", Icon: DocIcon },
  { href: "/dashboard/offers", label: "Ofertas", Icon: BriefcaseIcon },
  { href: "/dashboard/ajustes", label: "Ajustes", Icon: GearIcon },
];

// Está en el diseño pero todavía no tiene datos detrás (no hay tabla de
// postulaciones enviadas): se muestra apagada en vez de enlazar a un 404.
const NAV_PENDIENTE = [{ label: "Postulaciones", Icon: SendIcon }];

export function Sidebar({
  name,
  plan,
  offerCount,
  signOutAction,
}: {
  name: string;
  plan: string;
  offerCount: number;
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <aside className="flex w-[248px] shrink-0 flex-col justify-between bg-forest px-3.5 pb-4 pt-6">
      <div className="flex flex-col gap-7">
        <Link href="/dashboard" className="px-2">
          <Logo />
        </Link>

        <nav className="flex flex-col gap-0.5">
          {NAV.map(({ href, label, Icon, exact }) => {
            const active = exact
              ? pathname === href
              : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
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

          {NAV_PENDIENTE.map(({ label, Icon }) => (
            <span
              key={label}
              className="flex cursor-default items-center gap-2.5 rounded-[9px] px-3 py-2.5 text-sm font-medium text-forest-ink/45"
              title="Disponible en una próxima versión"
            >
              <Icon className="h-[19px] w-[19px]" />
              {label}
              <span className="ml-auto text-[10.5px] font-semibold uppercase tracking-[0.06em]">
                Pronto
              </span>
            </span>
          ))}
        </nav>
      </div>

      <div className="flex flex-col gap-3.5">
        <div className="h-px bg-forest-line" />
        <div className="flex items-center gap-2.5 px-2 py-1">
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
    </aside>
  );
}
