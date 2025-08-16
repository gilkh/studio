
import { AppHeader } from '@/components/header';
import { ClientSidebar } from '@/components/client-sidebar';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-secondary/50">
      <ClientSidebar />
      <div className="flex flex-col flex-1">
        <AppHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
            {children}
        </main>
      </div>
    </div>
  );
}
