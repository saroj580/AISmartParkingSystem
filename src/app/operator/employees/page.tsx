import { Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default function EmployeesPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <PageHeader
        title="Employees"
        description="Manage staff access to your parking lots."
      />
      <EmptyState
        icon={<Users />}
        title="Employee accounts aren't available yet"
        description="Staff/attendant logins are on the roadmap. For now, the operator account can manage everything, including scanning QR codes at the barrier."
      />
    </div>
  );
}
