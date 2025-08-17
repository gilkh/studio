
'use client';
import { getServiceOrOfferById } from '@/lib/services';
import type { Service, MediaItem } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Star, MessageSquare, ArrowLeft, Send, Video } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { QuoteRequestDialog } from '@/components/quote-request-dialog';
import { useEffect, useState } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"


// This is the client component that renders the UI
export function ServiceDetailView({ service: initialService, id }: { service: Service | null, id: string }) {
    const [service, setService] = useState(initialService);

    useEffect(() => {
        async function fetchService() {
            if(!initialService) {
                const foundService = (await getServiceOrOfferById(id)) as Service | null;
                setService(foundService ?? null);
            }
        }
        fetchService();
    }, [initialService, id]);

  if (!service) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold">Service not found</h1>
        <p className="text-muted-foreground">This service may have been removed or the link is incorrect.</p>
        <Link href="/client/explore">
            <Button className="mt-4">Back to Explore</Button>
        </Link>
      </div>
    );
  }

    // Mock Data - In a real app, this would be fetched from the DB
    const mockReviews = [
        { id: 1, author: 'Alice Johnson', rating: 5, comment: 'Absolutely stunning photos! Timeless Snaps captured our wedding day perfectly.'},
        { id: 2, author: 'Bob Williams', rating: 5, comment: 'Professional, creative, and a joy to work with. Highly recommended!'}
    ]

    const mediaItems = service.media && service.media.length > 0 ? service.media : [{ url: service.image, type: 'image' as const, isThumbnail: true }];


  return (
    <div className="space-y-8">
       <Link href="/client/explore" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Back to Explore
        </Link>

        <div className="relative">
             <Carousel className="w-full overflow-hidden rounded-xl">
                <CarouselContent>
                    {mediaItems.map((mediaItem, index) => (
                        <CarouselItem key={index} className="relative h-[300px] md:h-[500px]">
                            {mediaItem.type === 'image' ? (
                                <Image
                                    src={mediaItem.url}
                                    alt={`${service.title} - media ${index + 1}`}
                                    fill
                                    className="object-cover"
                                    data-ai-hint="event service"
                                />
                            ) : (
                                <video
                                    src={mediaItem.url}
                                    className="w-full h-full object-cover"
                                    muted
                                    loop
                                    autoPlay
                                    playsInline
                                />
                            )}
                        </CarouselItem>
                    ))}
                </CarouselContent>
                {mediaItems.length > 1 && (
                    <>
                        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10" />
                        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10" />
                    </>
                )}
            </Carousel>
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl pointer-events-none" />
             <div className="absolute bottom-6 left-6 text-white z-10 pointer-events-none">
                <Badge className="mb-2" variant="secondary">{service.category}</Badge>
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">{service.title}</h1>
             </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Description</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground">
                        <p>{service.description}</p>
                    </CardContent>
                </Card>
            </div>
            
            <div className="lg:col-span-1 space-y-6">
                 <Card className="sticky top-24">
                    <CardHeader className="text-center">
                        <p className="text-5xl font-bold text-primary">Custom Quote</p>
                         <p className="text-muted-foreground">Pricing is tailored to your event's needs.</p>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <QuoteRequestDialog service={service}>
                                <Button size="lg" className="w-full text-lg h-12">
                                    <MessageSquare className="mr-2 h-5 w-5" />
                                    Request a Quote
                                </Button>
                            </QuoteRequestDialog>
                            <QuoteRequestDialog service={service}>
                                <Button size="lg" variant="outline" className="h-12 w-12 p-0">
                                    <Send className="h-5 w-5" />
                                </Button>
                            </QuoteRequestDialog>
                        </div>
                    </CardContent>
                 </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>About the Vendor</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Link href={`/vendor/${service.vendorId}`} className="group/vendor">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16 border-2 border-primary">
                                    <AvatarImage src={service.vendorAvatar} alt={service.vendorName} />
                                    <AvatarFallback>{service.vendorName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-bold text-lg group-hover/vendor:underline">{service.vendorName}</p>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                        <span className="font-bold">{service.rating.toFixed(1)}</span>
                                        <span>({service.reviewCount} reviews)</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </CardContent>
                 </Card>
            </div>

            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader><CardTitle>Reviews ({service.reviewCount})</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        {mockReviews.map((review, index) => (
                            <div key={review.id}>
                                <div className="flex items-start gap-4">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-grow">
                                        <div className="flex items-center justify-between">
                                            <p className="font-semibold">{review.author}</p>
                                            <div className="flex items-center gap-0.5">
                                                {[...Array(review.rating)].map((_, i) => (
                                                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-muted-foreground mt-1">"{review.comment}"</p>
                                    </div>
                                </div>
                                {index < mockReviews.length -1 && <Separator className="mt-6" />}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
