
'use client'

import { useState } from 'react';
import type { VendorProfile, ServiceOrOffer, Service, Offer } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, ShieldCheck, Mail, Phone } from 'lucide-react';
import Link from 'next/link';
import { ServiceCard } from '@/components/service-card';
import { OfferCard } from '@/components/offer-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

interface VendorPublicProfileProps {
    vendor: VendorProfile | null;
    listings: ServiceOrOffer[];
}

export function VendorPublicProfile({ vendor: initialVendor, listings: initialListings }: VendorPublicProfileProps) {
  const [vendor] = useState<VendorProfile | null>(initialVendor);
  const [listings] = useState<ServiceOrOffer[]>(initialListings);
  const [isLoading, setIsLoading] = useState(false); // Kept for potential future client-side fetching logic

  if (!vendor) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold">Vendor not found</h1>
        <p className="text-muted-foreground">This vendor may no longer be on the platform.</p>
        <Link href="/client/explore">
            <Button className="mt-4">Back to Explore</Button>
        </Link>
      </div>
    );
  }
  
  const myOffers = listings.filter(item => item.type === 'offer') as Offer[];
  const myServices = listings.filter(item => item.type === 'service') as Service[];

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-primary/50">
              <AvatarImage src={`https://i.pravatar.cc/150?u=${vendor.id}`} alt={vendor.businessName} data-ai-hint="company logo" />
              <AvatarFallback>{vendor.businessName?.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex-grow mt-2">
              <h1 className="text-3xl md:text-4xl font-bold">{vendor.businessName}</h1>
              <p className="text-muted-foreground text-lg">{vendor.tagline}</p>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold">5.0</span>
                  <span className="text-muted-foreground">(150 reviews)</span>
                </div>
                <Badge variant="secondary" className="gap-1.5 pl-2">
                  <ShieldCheck className="h-4 w-4 text-green-600" />
                  Verified Vendor
                </Badge>
                <div className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{vendor.email}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{vendor.phone}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
            <p className="text-muted-foreground mt-4">{vendor.description}</p>
        </CardContent>
      </Card>
      
      <Card>
            <CardHeader>
                <CardTitle>Portfolio & Services</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="offers" className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="offers">Offers ({myOffers.length})</TabsTrigger>
                        <TabsTrigger value="services">Services ({myServices.length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="offers">
                        {myOffers.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {myOffers.map((offer) => (
                                    <OfferCard key={offer.id} offer={offer} role="client" />
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-8">This vendor currently has no special offers.</p>
                        )}
                    </TabsContent>
                    <TabsContent value="services">
                        {myServices.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {myServices.map((service) => (
                                    <ServiceCard key={service.id} service={service} role="client" />
                                ))}
                            </div>
                        ) : (
                             <p className="text-center text-muted-foreground py-8">This vendor currently has no quote-based services.</p>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
      </Card>

    </div>
  );
}
