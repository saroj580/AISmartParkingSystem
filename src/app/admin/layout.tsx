import { AdminSidebar } from "@/components/admin/sidebar";
import { DashboardTopbar } from "@/components/shared/dashboard-topbar";
import { CURRENT_ADMIN } from "@/data/user";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar
          searchPlaceholder="Search operators, users, reports…"
          name={CURRENT_ADMIN.name}
          email={CURRENT_ADMIN.email}
          avatarColor={CURRENT_ADMIN.avatarColor}
          settingsHref="/admin/settings"
          unreadCount={2}
        />
        <main className="flex-1 px-4 pb-10 pt-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
