
'use client';

import { useAuth, logout } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && role !== 'admin') {
      router.replace('/login');
    }
  }, [isLoading, role, router]);

  if (isLoading || role !== 'admin') {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-secondary/50">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

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
