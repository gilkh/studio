'use client';

import { useState } from 'react';
import { AppHeader } from '@/components/header';
import { ClientDashboard } from '@/components/client-dashboard';
import { VendorDashboard } from '@/components/vendor-dashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Home() {
  const [role, setRole] = useState<'client' | 'vendor'>('client');

  return (
    <div className="min-h-screen w-full bg-secondary/50">
      <AppHeader />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-foreground mb-4">
            Bring Your Event to Life
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover and book talented professionals for any occasion, or list your own event services and grow your business.
          </p>
        </div>
        
        <Tabs value={role} onValueChange={(value) => setRole(value as 'client' | 'vendor')} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-background shadow-md">
            <TabsTrigger value="client" className="py-2">Find Services</TabsTrigger>
            <TabsTrigger value="vendor" className="py-2">Offer Services</TabsTrigger>
          </TabsList>
          <TabsContent value="client" className="mt-8">
            <ClientDashboard />
          </TabsContent>
          <TabsContent value="vendor" className="mt-8">
            <VendorDashboard />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
