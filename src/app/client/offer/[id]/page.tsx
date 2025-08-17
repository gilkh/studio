
import { getServicesAndOffers } from '@/lib/services';
import type { Offer } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Clock, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { BookOfferDialog } from '@/components/book-offer-dialog';

// This function tells Next.js which pages to pre-render at build time.
export async function generateStaticParams() {
  const allItems = await getServicesAndOffers();
  const offers = allItems.filter(item => item.type === 'offer');
  return offers.map((offer) => ({
    id: offer.id,
  }));
}

// Mock Data - In a real app, this would be fetched from the DB
const mockPortfolio = [
    {id: 1, src: 'https://placehold.co/600x400.png', hint: 'event offer'},
    {id: 2, src: 'https://placehold.co/600x400.png', hint: 'event offer'},
    {id: 3, src: 'https://placehold.co/600x400.png', hint: 'event offer'},
    {id: 4, src: 'https://placehold.co/600x400.png', hint: 'event offer'},
];

const mockReviews = [
    { id: 1, author: 'Alice Johnson', rating: 5, comment: 'Absolutely amazing! The catering was the talk of the party.'},
    { id: 2, author: 'Bob Williams', rating: 5, comment: 'Punctual, professional, and delicious. Worth every penny!'}
]

// This is the client component that renders the UI
// It receives data as props from the server component below.
function OfferDetailView({ offer }: { offer: Offer | null }) {
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

  return (
    <div className="space-y-8">
       <Link href="/client/explore" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Back to Explore
        </Link>

        <div className="relative w-full h-[300px] md:h-[500px] overflow-hidden rounded-xl">
             <Image
                src={offer.image}
                alt={offer.title}
                fill
                className="object-cover"
                data-ai-hint="event offer"
            />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
             <div className="absolute bottom-6 left-6 text-white">
                <Badge className="bg-primary/90 text-primary-foreground mb-2" variant="default">Special Offer</Badge>
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">{offer.title}</h1>
                <p className="text-lg text-primary-foreground/90">{offer.category}</p>
             </div>
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

                <Card>
                    <CardHeader><CardTitle>Portfolio</CardTitle></CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {mockPortfolio.map((item) => (
                                <div key={item.id} className="relative aspect-square overflow-hidden rounded-lg group">
                                    <Image src={item.src} alt="Portfolio image" layout="fill" className="object-cover transition-transform group-hover:scale-110" data-ai-hint={item.hint} />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader><CardTitle>Reviews ({offer.reviewCount})</CardTitle></CardHeader>
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
                        <p className="text-muted-foreground">Fixed Price</p>
                        <p className="text-5xl font-bold text-primary">${offer.price}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground text-sm">Availability: {offer.availability}</span>
                        </div>
                         <Separator />
                        <BookOfferDialog offer={offer}>
                            <Button size="lg" className="w-full text-lg h-12">Book Now</Button>
                        </BookOfferDialog>
                    </CardContent>
                 </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>About the Vendor</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 border-primary">
                            <AvatarImage src={offer.vendorAvatar} alt={offer.vendorName} />
                            <AvatarFallback>{offer.vendorName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-bold text-lg">{offer.vendorName}</p>
                             <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                <span className="font-bold">{offer.rating.toFixed(1)}</span>
                                <span>({offer.reviewCount} reviews)</span>
                            </div>
                        </div>
                    </CardContent>
                 </Card>
            </div>
        </div>
    </div>
  );
}


// THIS IS THE MAIN SERVER COMPONENT FOR THE PAGE
export default async function OfferDetailPage({ params }: { params: { id: string } }) {
  const allItems = await getServicesAndOffers();
  const offer = allItems.find((item) => item.id === params.id && item.type === 'offer') as Offer | undefined;
  
  return <OfferDetailView offer={offer ?? null} />;
}
