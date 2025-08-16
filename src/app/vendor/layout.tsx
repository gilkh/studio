
import { AppHeader } from '@/components/header';
import { VendorSidebar } from '@/components/vendor-sidebar';

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-secondary/50">
      <VendorSidebar />
      <div className="flex flex-col flex-1">
        <AppHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
            {children}
        </main>
      </div>
    </div>
  );
}
