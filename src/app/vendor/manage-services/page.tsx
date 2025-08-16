
'use client';
import { ServiceCard } from '@/components/service-card';
import { OfferCard } from '@/components/offer-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { ManageServiceDialog } from '@/components/manage-service-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useState } from 'react';
import type { ServiceOrOffer, Service, Offer } from '@/lib/types';
import { getServicesAndOffers } from '@/lib/services';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';

export default function ManageServicesPage() {
    const { userId, isLoading: isAuthLoading } = useAuth();
    const [myListings, setMyListings] = useState<ServiceOrOffer[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadListings() {
            if (!userId) {
                if (!isAuthLoading) setIsLoading(false);
                return;
            }
            setIsLoading(true);
            try {
                const allItems = await getServicesAndOffers();
                setMyListings(allItems.filter(item => item.vendorId === userId));
            } catch (error) {
                console.error("Failed to load listings", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadListings();
    }, [userId, isAuthLoading]);

    const myOffers = myListings.filter(item => item.type === 'offer') as Offer[];
    const myServices = myListings.filter(item => item.type === 'service') as Service[];

    const pageIsLoading = isLoading || isAuthLoading;

    const renderSkeletons = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-96 w-full rounded-xl" />)}
            <Card className="flex items-center justify-center border-dashed border-2 h-full min-h-96">
                <ManageServiceDialog>
                    <Button variant="outline" className="text-lg p-8">
                        <PlusCircle className="mr-4 h-8 w-8" />
                        Add New Service/Offer
                    </Button>
                </ManageServiceDialog>
            </Card>
        </div>
    );

  return (
    <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
            <div>
                <CardTitle>Manage Your Services & Offers</CardTitle>
                <CardDescription>Add, edit, or remove your services and special offers.</CardDescription>
            </div>
            <ManageServiceDialog>
                <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New
                </Button>
            </ManageServiceDialog>
            </div>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="offers">
                <TabsList className="mb-4">
                    <TabsTrigger value="offers">Offers ({myOffers.length})</TabsTrigger>
                    <TabsTrigger value="services">Services ({myServices.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="offers">
                    {pageIsLoading ? renderSkeletons() : (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myOffers.map((offer) => (
                                <OfferCard key={offer.id} offer={offer} role="vendor" />
                            ))}
                             <Card className="flex items-center justify-center border-dashed border-2 h-full min-h-96">
                                <ManageServiceDialog>
                                    <Button variant="outline" className="text-lg p-8">
                                        <PlusCircle className="mr-4 h-8 w-8" />
                                        Add New Offer
                                    </Button>
                                </ManageServiceDialog>
                            </Card>
                        </div>
                    )}
                </TabsContent>
                <TabsContent value="services">
                    {pageIsLoading ? renderSkeletons() : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myServices.map((service) => (
                                <ServiceCard key={service.id} service={service} role="vendor" />
                            ))}
                            <Card className="flex items-center justify-center border-dashed border-2 h-full min-h-96">
                                <ManageServiceDialog>
                                    <Button variant="outline" className="text-lg p-8">
                                        <PlusCircle className="mr-4 h-8 w-8" />
                                        Add New Service
                                    </Button>
                                </ManageServiceDialog>
                            </Card>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </CardContent>
    </Card>
  );
}
