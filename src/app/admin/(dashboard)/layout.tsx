import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { getSiteSettings } from "@/lib/repo/settings";
import AdminShell from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const settings = getSiteSettings();

  return (
    <AdminShell adminName={session.name} siteName={settings.siteName}>
      {children}
    </AdminShell>
  );
}
