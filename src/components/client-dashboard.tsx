
'use client';

import { ServiceCard } from './service-card';
import { OfferCard } from './offer-card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useState } from 'react';
import type { ServiceOrOffer, Service, Offer } from '@/lib/types';
import { getServicesAndOffers } from '@/lib/services';
import { Skeleton } from './ui/skeleton';

export function ClientDashboard() {
  const [allItems, setAllItems] = useState<ServiceOrOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadItems() {
        setIsLoading(true);
        try {
            const items = await getServicesAndOffers();
            setAllItems(items);
        } catch (error) {
            console.error("Failed to load services and offers", error);
        } finally {
            setIsLoading(false);
        }
    }
    loadItems();
  }, [])


  const categories = ['All Categories', ...Array.from(new Set(allItems.map((s) => s.category)))];
  const services = allItems.filter(item => item.type === 'service') as Service[];
  const offers = allItems.filter(item => item.type === 'offer') as Offer[];

  const renderSkeletons = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-96 w-full rounded-xl" />)}
    </div>
  );

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden shadow-lg border-primary/20">
        <CardHeader className="bg-gradient-to-br from-primary/10 to-transparent p-4 sm:p-6">
            <CardTitle className="text-2xl sm:text-3xl font-bold">Explore Event Services</CardTitle>
            <CardDescription>Find the perfect professional for your event.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
            <div className="relative flex-grow">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search for 'Catering', 'Photography', etc." className="pl-12 h-12 text-base" />
            </div>
             <Select defaultValue="All Categories">
              <SelectTrigger className="w-full sm:w-[220px] h-12 text-base">
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
            <Button size="lg" className="h-12 text-base w-full sm:w-auto">Search</Button>
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
            {isLoading ? renderSkeletons() : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {allItems.map((item) =>
                    item.type === 'service' ? (
                        <ServiceCard key={item.id} service={item} role="client" />
                    ) : (
                        <OfferCard key={item.id} offer={item} role="client" />
                    )
                    )}
                </div>
            )}
        </TabsContent>
         <TabsContent value="services">
             {isLoading ? renderSkeletons() : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {services.map((service) => (
                        <ServiceCard key={service.id} service={service} role="client" />
                    ))}
                </div>
            )}
        </TabsContent>
        <TabsContent value="offers">
            {isLoading ? renderSkeletons() : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {offers.map((offer) => (
                        <OfferCard key={offer.id} offer={offer} role="client" />
                    ))}
                </div>
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
