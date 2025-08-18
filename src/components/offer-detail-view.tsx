
'use client';
import { getServiceOrOfferById } from '@/lib/services';
import type { Offer, MediaItem, Review } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Star, Clock, ArrowLeft, Send, Video } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { BookOfferDialog } from '@/components/book-offer-dialog';
import { useEffect, useState } from 'react';
import { QuoteRequestDialog } from './quote-request-dialog';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { getReviewsForVendor } from '@/lib/services';

// This is the client component that renders the UI
export function OfferDetailView({ offer: initialOffer, id }: { offer: Offer | null, id: string }) {
  const [offer, setOffer] = useState(initialOffer);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function fetchOffer() {
        if(!initialOffer) {
            const foundOffer = (await getServiceOrOfferById(id)) as Offer | null;
            setOffer(foundOffer ?? null);
            if (foundOffer) {
                const vendorReviews = await getReviewsForVendor(foundOffer.vendorId);
                setReviews(vendorReviews);
            }
        } else {
             const vendorReviews = await getReviewsForVendor(initialOffer.vendorId);
             setReviews(vendorReviews);
        }
        setIsLoading(false);
    }
    fetchOffer();
  }, [initialOffer, id]);

  if (!offer) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold">Offer not found</h1>
        <p className="text-muted-foreground">This offer may have been removed or the link is incorrect.</p>
        <Link href="/client/explore">
            <Button className="mt-4">Back to Explore</Button>
        </Link>
      </div>
    );
  }

    const mediaItems = offer.media && offer.media.length > 0 ? offer.media : [{ url: offer.image, type: 'image' as const, isThumbnail: true }];


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
                                    alt={`${offer.title} - media ${index + 1}`}
                                    fill
                                    className="object-cover"
                                    data-ai-hint="event offer"
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

             <div className="absolute bottom-6 left-6 text-white z-10 pointer-events-none">
                <Badge className="bg-primary/90 text-primary-foreground mb-2" variant="default">Special Offer</Badge>
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">{offer.title}</h1>
                <p className="text-lg text-primary-foreground/90">{offer.category}</p>
             </div>
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl pointer-events-none" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Description</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground">
                        <p>{offer.description}</p>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader><CardTitle>What's Included</CardTitle></CardHeader>
                    <CardContent>
                        {/* This could be a structured field in the future */}
                        <ul className="list-disc list-inside text-muted-foreground space-y-2">
                            <li>Service for up to 4 hours</li>
                            <li>All necessary equipment and setup</li>
                            <li>Professional staff on-site</li>
                            <li>Travel within a 50-mile radius</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
            
            <div className="lg:col-span-1 space-y-6">
                 <Card className="sticky top-24">
                    <CardHeader className="text-center">
                        <p className="text-muted-foreground">Fixed Price</p>
                        <p className="text-5xl font-bold text-primary">${offer.price}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground text-sm">Multiple dates available</span>
                        </div>
                         <Separator />
                        <div className="flex gap-2">
                            <BookOfferDialog offer={offer}>
                                <Button size="lg" className="w-full text-lg h-12">Book Now</Button>
                            </BookOfferDialog>
                            <QuoteRequestDialog service={offer}>
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
                        <Link href={`/vendor/${offer.vendorId}`} className="group/vendor">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16 border-2 border-primary">
                                    <AvatarImage src={offer.vendorAvatar} alt={offer.vendorName} />
                                    <AvatarFallback>{offer.vendorName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-bold text-lg group-hover/vendor:underline">{offer.vendorName}</p>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                        <span className="font-bold">{offer.rating.toFixed(1)}</span>
                                        <span>({offer.reviewCount} reviews)</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </CardContent>
                 </Card>
            </div>

            <div className="lg:col-span-2 space-y-6">
                 <Card>
                    <CardHeader><CardTitle>Reviews ({reviews.length})</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        {isLoading ? (
                            <p className="text-muted-foreground">Loading reviews...</p>
                        ) : reviews.length > 0 ? reviews.map((review, index) => (
                            <div key={review.id}>
                                <div className="flex items-start gap-4">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={review.clientAvatar} />
                                        <AvatarFallback>{review.clientName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-grow">
                                        <div className="flex items-center justify-between">
                                            <p className="font-semibold">{review.clientName}</p>
                                            <div className="flex items-center gap-0.5">
                                                {[...Array(review.rating)].map((_, i) => (
                                                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                                                ))}
                                                {[...Array(5-review.rating)].map((_, i) => (
                                                    <Star key={i} className="h-4 w-4 fill-muted text-muted-foreground" />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-muted-foreground mt-1">"{review.comment}"</p>
                                    </div>
                                </div>
                                {index < reviews.length -1 && <Separator className="mt-6" />}
                            </div>
                        )) : (
                             <p className="text-center text-muted-foreground py-8">This vendor doesn't have any reviews yet.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

        </div>
    </div>
  );
}

    
