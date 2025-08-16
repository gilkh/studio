'use client';

import { services, offers, servicesAndOffers } from '@/lib/placeholder-data';
import { ServiceCard } from './service-card';
import { OfferCard } from './offer-card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function ClientDashboard() {
  const categories = ['All Categories', ...Array.from(new Set(servicesAndOffers.map((s) => s.category)))];

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
            <CardTitle className="text-3xl font-bold">Explore Event Services</CardTitle>
            <CardDescription>Find the perfect professional for your event.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
            <div className="relative flex-grow">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search for 'Catering', 'Photography', etc." className="pl-12 h-12 text-lg" />
            </div>
             <Select defaultValue="All Categories">
              <SelectTrigger className="w-full sm:w-[220px] h-12 text-lg">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="lg" className="h-12 text-lg">Search</Button>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="services">Services (for Quote)</TabsTrigger>
          <TabsTrigger value="offers">Offers (Book Now)</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {servicesAndOffers.map((item) =>
              item.type === 'service' ? (
                <ServiceCard key={item.id} service={item} role="client" />
              ) : (
                <OfferCard key={item.id} offer={item} role="client" />
              )
            )}
          </div>
        </TabsContent>
         <TabsContent value="services">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {services.map((service) => (
                    <ServiceCard key={service.id} service={service} role="client" />
                ))}
            </div>
        </TabsContent>
        <TabsContent value="offers">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {offers.map((offer) => (
                    <OfferCard key={offer.id} offer={offer} role="client" />
                ))}
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
