import { PageHeader } from "@/components/shared/page-header";
import { SpacesClient } from "@/components/operator/spaces-client";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { listSpacesForOperator } from "@/server/views/spaces";
import { listLotsForOperator } from "@/server/views/parking-lots";

export default async function OperatorSpacesPage() {
  const session = await getSessionUser();
  const operatorProfile = await prisma.operatorProfile.findUniqueOrThrow({ where: { userId: session!.id } });
  const [spaces, lots] = await Promise.all([
    listSpacesForOperator(operatorProfile.id),
    listLotsForOperator(operatorProfile.id),
  ]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        title="Parking spaces"
        description={`${spaces.length} spaces across ${lots.length} lots`}
      />
      <SpacesClient spaces={spaces} lots={lots.map((l) => ({ id: l.id, name: l.name }))} />
    </div>
  );
}
