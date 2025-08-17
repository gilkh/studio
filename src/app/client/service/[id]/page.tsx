
'use client';
import { useEffect, useState } from 'react';
import { getServicesAndOffers } from '@/lib/services';
import type { Service } from '@/lib/types';
import { useParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, MessageSquare, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { QuoteRequestDialog } from '@/components/quote-request-dialog';

// Mock Data - In a real app, this would be fetched from the DB
const mockPortfolio = [
    {id: 1, src: 'https://placehold.co/600x400.png', hint: 'event photography'},
    {id: 2, src: 'https://placehold.co/600x400.png', hint: 'wedding photography'},
    {id: 3, src: 'https://placehold.co/600x400.png', hint: 'portrait photography'},
    {id: 4, src: 'https://placehold.co/600x400.png', hint: 'event photography'},
];

const mockReviews = [
    { id: 1, author: 'Alice Johnson', rating: 5, comment: 'Absolutely stunning photos! Timeless Snaps captured our wedding day perfectly.'},
    { id: 2, author: 'Bob Williams', rating: 5, comment: 'Professional, creative, and a joy to work with. Highly recommended!'}
]


export default function ServiceDetailPage() {
  const { id } = useParams();
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchService() {
      setIsLoading(true);
      const allItems = await getServicesAndOffers();
      const foundService = allItems.find((item) => item.id === id && item.type === 'service') as Service | undefined;
      setService(foundService || null);
      setIsLoading(false);
    }

    if (id) {
      fetchService();
    }
  }, [id]);

  if (isLoading) {
    return (
        <div className="space-y-8">
            <Skeleton className="h-12 w-1/4" />
            <Skeleton className="h-[400px] w-full rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-48 w-full" />
                </div>
            </div>
        </div>
    );
  }

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

  return (
    <div className="space-y-8">
       <Link href="/client/explore" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Back to Explore
        </Link>

        <div className="relative w-full h-[300px] md:h-[500px] overflow-hidden rounded-xl">
            <Image
                src={service.image}
                alt={service.title}
                fill
                className="object-cover"
                data-ai-hint="event service"
            />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
             <div className="absolute bottom-6 left-6 text-white">
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

                <Card>
                    <CardHeader><CardTitle>Portfolio</CardTitle></CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {mockPortfolio.map((item) => (
                                <div key={item.id} className="relative aspect-square overflow-hidden rounded-lg group">
                                    <Image src={item.src} alt="Portfolio image" layout="fill" className="object-cover transition-transform group-hover:scale-110" data-ai-hint={item.hint}/>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                
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
            
            <div className="lg:col-span-1 space-y-6">
                 <Card className="sticky top-24">
                    <CardHeader className="text-center">
                        <p className="text-5xl font-bold text-primary">Custom Quote</p>
                         <p className="text-muted-foreground">Pricing is tailored to your event's needs.</p>
                    </CardHeader>
                    <CardContent>
                        <QuoteRequestDialog service={service}>
                            <Button size="lg" className="w-full text-lg h-12">
                                <MessageSquare className="mr-2 h-5 w-5" />
                                Request a Quote
                            </Button>
                        </QuoteRequestDialog>
                    </CardContent>
                 </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>About the Vendor</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 border-primary">
                            <AvatarImage src={service.vendorAvatar} alt={service.vendorName} />
                            <AvatarFallback>{service.vendorName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-bold text-lg">{service.vendorName}</p>
                             <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                <span className="font-bold">{service.rating.toFixed(1)}</span>
                                <span>({service.reviewCount} reviews)</span>
                            </div>
                        </div>
                    </CardContent>
                 </Card>
            </div>
        </div>
    </div>
  );
}
