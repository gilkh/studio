
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ServiceCard } from './service-card';
import { OfferCard } from './offer-card';
import Link from 'next/link';
import { Calendar, Compass, Heart, PartyPopper } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Booking, ServiceOrOffer, UserProfile } from '@/lib/types';
import { getBookingsForUser, getSavedItems, getServicesAndOffers, getUserProfile } from '@/lib/services';
import { Skeleton } from './ui/skeleton';
import { useAuth } from '@/hooks/use-auth';

export function ClientHome() {
    const { userId, isLoading: isAuthLoading } = useAuth();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
    const [savedItems, setSavedItems] = useState<ServiceOrOffer[]>([]);
    const [featuredItems, setFeaturedItems] = useState<ServiceOrOffer[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadDashboardData() {
            if (!userId) {
                if (!isAuthLoading) setIsLoading(false);
                return;
            };

            setIsLoading(true);
            try {
                const [userProfile, bookings, saved, allItems] = await Promise.all([
                    getUserProfile(userId),
                    getBookingsForUser(userId),
                    getSavedItems(userId),
                    getServicesAndOffers(),
                ]);
                setUser(userProfile)
                setUpcomingBookings(bookings.filter(b => b.date >= new Date()));
                setSavedItems(saved);
                setFeaturedItems(allItems.slice(0, 4)); // Show first 4 as featured
            } catch (error) {
                console.error("Failed to load client dashboard:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadDashboardData();
    }, [userId, isAuthLoading]);
    
    const specialOffers = featuredItems.filter(i => i.type === 'offer').slice(0, 2);
    const featuredServices = featuredItems.filter(i => i.type === 'service').slice(0, 2);
    const pageIsLoading = isLoading || isAuthLoading;

    return (
        <div className="space-y-8">
            <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20 shadow-lg">
                <CardHeader>
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-3xl font-bold">
                                {pageIsLoading ? <Skeleton className="h-9 w-64" /> : `Welcome back, ${user?.firstName || 'User'}!`}
                            </CardTitle>
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
                    {pageIsLoading ? <Skeleton className="h-8 w-1/4 mt-1" /> : <div className="text-2xl font-bold">{upcomingBookings.length}</div>}
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
                     {pageIsLoading ? <Skeleton className="h-8 w-1/4 mt-1" /> : <div className="text-2xl font-bold">{savedItems.length}</div>}
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
                 {pageIsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Skeleton className="h-96 w-full" />
                        <Skeleton className="h-96 w-full" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {specialOffers.map((item) =>
                            <OfferCard key={item.id} offer={item} role="client" />
                        )}
                    </div>
                )}
            </div>

            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold">Featured Services</h2>
                    <p className="text-muted-foreground">Top-rated professionals to make your event unforgettable.</p>
                </div>
                 {pageIsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Skeleton className="h-96 w-full" />
                        <Skeleton className="h-96 w-full" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {featuredServices.map((item) =>
                            <ServiceCard key={item.id} service={item} role="client" />
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
