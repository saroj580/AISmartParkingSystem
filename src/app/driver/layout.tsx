import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { avatarColorFor } from "@/lib/avatar-color";
import { DriverSidebar } from "@/components/driver/sidebar";
import { DriverTopbar } from "@/components/driver/topbar";
import { DriverMobileNav } from "@/components/driver/mobile-nav";

export default async function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole("DRIVER");
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.id } });
  const unreadCount = await prisma.notification.count({
    where: { userId: session.id, createdAt: { gt: user.lastLoginAt ?? user.createdAt } },
  });

  const name = `${user.firstName} ${user.lastName}`;
  const avatarColor = avatarColorFor(user.id);

  return (
    <div className="flex min-h-screen">
      <DriverSidebar unreadCount={unreadCount} />
      <div className="flex min-w-0 flex-1 flex-col">
        <DriverTopbar name={name} email={user.email} avatarColor={avatarColor} unreadCount={unreadCount} />
        <main className="flex-1 px-4 pb-24 pt-6 sm:px-6 lg:pb-10">
          {children}
        </main>
      </div>
      <DriverMobileNav />
    </div>
  );
}
