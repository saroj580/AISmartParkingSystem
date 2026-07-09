import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { avatarColorFor } from "@/lib/avatar-color";
import { AdminSidebar } from "@/components/admin/sidebar";
import { DashboardTopbar } from "@/components/shared/dashboard-topbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole("ADMIN");
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.id } });
  const unreadCount = await prisma.notification.count({
    where: { userId: session.id, createdAt: { gt: user.lastLoginAt ?? user.createdAt } },
  });

  const name = `${user.firstName} ${user.lastName}`;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar
          searchPlaceholder="Search operators, users, reports…"
          name={name}
          email={user.email}
          avatarColor={avatarColorFor(user.id)}
          settingsHref="/admin/settings"
          unreadCount={unreadCount}
        />
        <main className="flex-1 px-4 pb-10 pt-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
