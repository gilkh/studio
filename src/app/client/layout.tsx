
import { AppHeader } from '@/components/header';
import { BottomNavBar } from '@/components/bottom-nav-bar';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-secondary/50">
      <AppHeader />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto pb-24 lg:pb-8">
          {children}
      </main>
      <BottomNavBar />
    </div>
  );
}
