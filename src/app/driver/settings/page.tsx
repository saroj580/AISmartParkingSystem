import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { avatarColorFor } from "@/lib/avatar-color";
import { DriverSettingsClient } from "@/components/driver/settings-client";

export default async function DriverSettingsPage() {
  const session = await getSessionUser();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session!.id } });

  return (
    <DriverSettingsClient
      firstName={user.firstName}
      lastName={user.lastName}
      email={user.email}
      phone={user.phone ?? ""}
      avatarColor={avatarColorFor(user.id)}
      memberSince={user.createdAt.toISOString()}
    />
  );
}
