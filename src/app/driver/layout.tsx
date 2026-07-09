import { DriverSidebar } from "@/components/driver/sidebar";
import { DriverTopbar } from "@/components/driver/topbar";
import { DriverMobileNav } from "@/components/driver/mobile-nav";

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <DriverSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DriverTopbar />
        <main className="flex-1 px-4 pb-24 pt-6 sm:px-6 lg:pb-10">
          {children}
        </main>
      </div>
      <DriverMobileNav />
    </div>
  );
}
