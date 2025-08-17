
'use client';
import type { Offer } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Edit, Clock, Heart, HeartCrack, Send, Video } from 'lucide-react';
import Image from 'next/image';
import { ManageServiceDialog } from './manage-service-dialog';
import { BookOfferDialog } from './book-offer-dialog';
import { useEffect, useState } from 'react';
import { getUserProfile, toggleSavedItem } from '@/lib/services';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import { QuoteRequestDialog } from './quote-request-dialog';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"


interface OfferCardProps {
  offer: Offer;
  role: 'client' | 'vendor';
  onListingUpdate?: () => void;
}

export function OfferCard({ offer, role, onListingUpdate }: OfferCardProps) {
  const { userId } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  const mediaItems = offer.media && offer.media.length > 0 ? offer.media : [{ url: offer.image, type: 'image' as const, isThumbnail: true }];


  useEffect(() => {
    async function checkSavedStatus() {
        if (role === 'client' && userId) {
            try {
                const profile = await getUserProfile(userId);
                if (profile?.savedItemIds?.includes(offer.id)) {
                    setIsSaved(true);
                }
            } catch (error) {
                console.warn("Could not check saved status. User profile might not exist yet.", error);
            }
        }
    }
    checkSavedStatus();
  }, [offer.id, role, userId]);

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.preventDefault(); // prevent navigation
    if (role !== 'client' || !userId) return;
    setIsSaving(true);
    try {
        await toggleSavedItem(userId, offer.id);
        setIsSaved(!isSaved);
         toast({
            title: isSaved ? 'Item Unsaved' : 'Item Saved!',
            description: isSaved ? `"${offer.title}" removed from your saved items.` : `"${offer.title}" added to your saved items.`
        });
    } catch (error) {
        console.error('Failed to toggle saved item', error);
        toast({ title: 'Error', description: 'Could not update saved items.', variant: 'destructive' });
    } finally {
        setIsSaving(false);
    }
  }


  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 rounded-xl group">
        <CardHeader className="p-0 relative overflow-hidden">
            <Carousel className="w-full">
                <CarouselContent>
                    {mediaItems.map((mediaItem, index) => (
                    <CarouselItem key={index}>
                         <Link href={`/client/offer/${offer.id}`}>
                            <div className="relative h-48 w-full">
                                {mediaItem.type === 'image' ? (
                                    <Image
                                        src={mediaItem.url}
                                        alt={offer.title}
                                        fill
                                        className="object-cover"
                                        data-ai-hint="event offer"
                                    />
                                ) : (
                                    <div className="relative w-full h-full">
                                        <video
                                            src={mediaItem.url}
                                            className="w-full h-full object-cover"
                                            muted
                                            loop
                                            playsInline
                                        />
                                        <div className="absolute bottom-2 right-2 bg-black/50 text-white rounded-full p-1.5">
                                            <Video className="h-4 w-4" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Link>
                    </CarouselItem>
                    ))}
                </CarouselContent>
                {mediaItems.length > 1 && (
                    <>
                        <CarouselPrevious className="absolute left-3 top-1/2 -translate-y-1/2 z-10" />
                        <CarouselNext className="absolute right-3 top-1/2 -translate-y-1/2 z-10" />
                    </>
                )}
            </Carousel>
         
          {role === 'client' && (
              <div className="absolute top-3 right-3 flex gap-2 z-10">
                <QuoteRequestDialog service={offer}>
                  <Button size="icon" variant="secondary" className="rounded-full h-8 w-8 bg-background/70 hover:bg-background">
                      <Send className="h-4 w-4" />
                      <span className="sr-only">Send to Vendor</span>
                  </Button>
                </QuoteRequestDialog>
                <Button size="icon" variant="secondary" onClick={handleSaveToggle} disabled={isSaving} className="rounded-full h-8 w-8 bg-background/70 hover:bg-background">
                    {isSaved ? <HeartCrack className="h-4 w-4 text-red-500" /> : <Heart className="h-4 w-4" />}
                    <span className="sr-only">Save</span>
                </Button>
              </div>
          )}
          <Badge className="absolute top-3 left-3 bg-primary/90 text-primary-foreground z-10" variant="default">
            Special Offer
          </Badge>
        </CardHeader>
        <div className="p-4 flex-grow flex flex-col">
            <Link href={`/client/offer/${offer.id}`} className="flex-grow">
                <h3 className="text-xl font-bold leading-tight mb-2">{offer.title}</h3>
            </Link>
           <Link href={`/vendor/${offer.vendorId}`} className="group/vendor" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mt-2">
              <Avatar className="h-10 w-10 border-2 border-background ring-2 ring-primary">
                <AvatarImage src={`https://i.pravatar.cc/150?u=${offer.vendorId}`} alt={offer.vendorName} />
                <AvatarFallback>{offer.vendorName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm group-hover/vendor:underline">{offer.vendorName}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold">{offer.rating.toFixed(1)}</span>
                  <span>({offer.reviewCount} reviews)</span>
                </div>
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-dashed">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground text-sm">Multiple dates available</span>
          </div>
        </div>
      
      <CardFooter className="p-4 pt-2 flex justify-between items-center bg-muted/50">
        <div>
          <p className="text-xs text-muted-foreground">Fixed Price</p>
          <p className="text-2xl font-bold text-primary">${offer.price}</p>
        </div>
        {role === 'client' ? (
          <BookOfferDialog offer={offer}>
            <Button size="lg">Book Now</Button>
          </BookOfferDialog>
        ) : (
          <ManageServiceDialog service={offer} onListingUpdate={onListingUpdate}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit Offer
            </Button>
          </ManageServiceDialog>
        )}
      </CardFooter>
    </Card>
  );
}
