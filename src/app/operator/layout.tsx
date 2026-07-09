import { OperatorSidebar } from "@/components/operator/sidebar";
import { DashboardTopbar } from "@/components/shared/dashboard-topbar";
import { CURRENT_OPERATOR } from "@/data/user";

export default function OperatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <OperatorSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar
          searchPlaceholder="Search lots, bookings, customers…"
          name={CURRENT_OPERATOR.contactName}
          email={CURRENT_OPERATOR.email}
          avatarColor={CURRENT_OPERATOR.avatarColor}
          settingsHref="/operator/settings"
          unreadCount={3}
        />
        <main className="flex-1 px-4 pb-10 pt-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
