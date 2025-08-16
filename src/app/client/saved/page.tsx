
'use client';

import { useEffect, useState } from 'react';
import { OfferCard } from '@/components/offer-card';
import { ServiceCard } from '@/components/service-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { servicesAndOffers as placeholderData } from '@/lib/placeholder-data';
import type { ServiceOrOffer } from '@/lib/types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function SavedItemsPage() {
    const [savedItems, setSavedItems] = useState<ServiceOrOffer[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // In a real app, we would fetch the user's saved item IDs from their profile
        // and then fetch the details for each of those items from the 'services' and 'offers' collections.
        // For this prototype, we'll just show the first few items from placeholder data.
        const fetchSavedItems = async () => {
            setIsLoading(true);
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
            setSavedItems(placeholderData.slice(0, 3));
            setIsLoading(false);
        };

        fetchSavedItems();
    }, []);

    return (
        <div className="space-y-8">
             <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Link href="/client/profile">
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <CardTitle>My Saved Items</CardTitle>
                            <CardDescription>
                                All the services and offers you've saved for later.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-96 w-full rounded-xl" />)}
                         </div>
                    ) : savedItems.length > 0 ? (
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {savedItems.map((item) =>
                                item.type === 'service' ? (
                                    <ServiceCard key={item.id} service={item} role="client" />
                                ) : (
                                    <OfferCard key={item.id} offer={item} role="client" />
                                )
                            )}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-8">You haven't saved any items yet.</p>
                    )}
                </CardContent>
             </Card>
        </div>
    )
}
