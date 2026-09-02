import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileNav } from "@/components/dashboard/MobileNav";
import { getBalance } from "@/lib/credits";
import { isAdminEmail } from "@/lib/admin";
import {
  PanelIcon,
  DocIcon,
  BriefcaseIcon,
  SparkIcon,
  PuzzleIcon,
  GearIcon,
} from "@/components/ui/Icons";

const NAV = [
  { href: "/dashboard", label: "Panel", Icon: PanelIcon, exact: true },
  { href: "/dashboard/cv", label: "CV Maestro", Icon: DocIcon },
  { href: "/dashboard/offers", label: "Ofertas", Icon: BriefcaseIcon },
  { href: "/dashboard/creditos", label: "Créditos", Icon: SparkIcon },
  { href: "/dashboard/extension", label: "Extensión", Icon: PuzzleIcon },
  { href: "/dashboard/ajustes", label: "Ajustes", Icon: GearIcon },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: baseProfile }, { count: offerCount }, balance] =
    await Promise.all([
      supabase
        .from("base_profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("job_offers")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
      getBalance(),
    ]);

  const name =
    baseProfile?.full_name?.trim() || user.email?.split("@")[0] || "Tu cuenta";

  const plan =
    balance === null
      ? "Saldo no disponible"
      : balance.total === 1
        ? "1 crédito"
        : `${balance.total} créditos`;

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <MobileNav
        nav={NAV}
        name={name}
        plan={plan}
        offerCount={offerCount ?? 0}
        signOutAction={signOut}
      />
      <Sidebar
        name={name}
        plan={plan}
        offerCount={offerCount ?? 0}
        isAdmin={isAdminEmail(user.email)}
        signOutAction={signOut}
      />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
