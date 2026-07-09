import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { OperatorSettingsClient } from "@/components/operator/settings-client";

export default async function OperatorSettingsPage() {
  const session = await getSessionUser();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session!.id } });
  const operatorProfile = await prisma.operatorProfile.findUniqueOrThrow({ where: { userId: user.id } });

  return (
    <OperatorSettingsClient
      companyName={operatorProfile.companyName}
      firstName={user.firstName}
      lastName={user.lastName}
      email={user.email}
      phone={user.phone ?? ""}
    />
  );
}
