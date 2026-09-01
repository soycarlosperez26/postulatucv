import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { PLAN_LABEL } from "@/lib/plan";

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

  const [{ data: baseProfile }, { count: offerCount }] = await Promise.all([
    supabase
      .from("base_profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("job_offers")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  const name =
    baseProfile?.full_name?.trim() || user.email?.split("@")[0] || "Tu cuenta";

  return (
    <div className="flex flex-1">
      <Sidebar
        name={name}
        plan={PLAN_LABEL}
        offerCount={offerCount ?? 0}
        signOutAction={signOut}
      />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
