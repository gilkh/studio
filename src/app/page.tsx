'use client';

import { useState } from 'react';
import { AppHeader } from '@/components/header';
import { ClientDashboard } from '@/components/client-dashboard';
import { VendorDashboard } from '@/components/vendor-dashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Home() {
  const [role, setRole] = useState<'client' | 'vendor'>('client');

  return (
    <div className="min-h-screen w-full bg-background">
      <AppHeader />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Tabs value={role} onValueChange={(value) => setRole(value as 'client' | 'vendor')} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="client">I'm a Client</TabsTrigger>
            <TabsTrigger value="vendor">I'm a Vendor</TabsTrigger>
          </TabsList>
          <TabsContent value="client" className="mt-6">
            <ClientDashboard />
          </TabsContent>
          <TabsContent value="vendor" className="mt-6">
            <VendorDashboard />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
