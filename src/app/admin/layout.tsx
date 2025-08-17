
import { AppHeader } from '@/components/header';
import { logout } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // A simple header for the admin section
  return (
    <div className="flex min-h-screen w-full flex-col bg-secondary/50">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
            <h1 className="text-xl font-semibold">TradeCraft Admin</h1>
            <Link href="/login">
                <Button variant="outline" onClick={() => logout()}>Logout</Button>
            </Link>
        </header>
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
      </main>
    </div>
  );
}
