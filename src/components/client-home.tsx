
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { bookings, servicesAndOffers } from '@/lib/placeholder-data';
import { ServiceCard } from './service-card';
import { OfferCard } from './offer-card';
import Link from 'next/link';
import { Calendar, Compass, Heart, PartyPopper } from 'lucide-react';
import { Badge } from './ui/badge';
import Image from 'next/image';

export function ClientHome() {
    const upcomingBookings = bookings.filter(b => b.date >= new Date()).length;
    const savedItems = 3; // Placeholder
    const featuredServices = servicesAndOffers.filter(i => i.type === 'service').slice(0, 2);
    const specialOffers = servicesAndOffers.filter(i => i.type === 'offer').slice(0, 2);

    return (
        <div className="space-y-8">
            <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20 shadow-lg">
                <CardHeader>
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-3xl font-bold">Welcome back, John!</CardTitle>
                            <CardDescription className="mt-2 text-lg">Let's start planning your next amazing event.</CardDescription>
                        </div>
                        <Link href="/client/event-planner">
                            <Button size="lg" className="w-full md:w-auto">
                                <PartyPopper className="mr-2" />
                                Open Event Planner
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Upcoming Bookings
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">{upcomingBookings}</div>
                    <Link href="/client/bookings">
                        <p className="text-xs text-muted-foreground underline hover:text-primary">
                            View your calendar
                        </p>
                    </Link>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Saved Items
                    </CardTitle>
                    <Heart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">{savedItems}</div>
                    <Link href="/client/saved">
                        <p className="text-xs text-muted-foreground underline hover:text-primary">
                            View your favorites
                        </p>
                    </Link>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Explore Services
                    </CardTitle>
                    <Compass className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">50+</div>
                     <Link href="/client/explore">
                        <p className="text-xs text-muted-foreground underline hover:text-primary">
                           Find vendors for any need
                        </p>
                    </Link>
                    </CardContent>
                </Card>
            </div>
            
             <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold">Special Offers</h2>
                    <p className="text-muted-foreground">Don't miss these limited-time deals.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {specialOffers.map((item) =>
                        <OfferCard key={item.id} offer={item} role="client" />
                    )}
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold">Featured Services</h2>
                    <p className="text-muted-foreground">Top-rated professionals to make your event unforgettable.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {featuredServices.map((item) =>
                        <ServiceCard key={item.id} service={item} role="client" />
                    )}
                </div>
            </div>
        </div>
    )
}
