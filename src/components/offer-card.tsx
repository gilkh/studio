
'use client';
import type { Offer } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Edit, Clock, Heart, HeartCrack } from 'lucide-react';
import Image from 'next/image';
import { ManageServiceDialog } from './manage-service-dialog';
import { BookOfferDialog } from './book-offer-dialog';
import { useEffect, useState } from 'react';
import { getUserProfile, toggleSavedItem } from '@/lib/services';
import { useToast } from '@/hooks/use-toast';

interface OfferCardProps {
  offer: Offer;
  role: 'client' | 'vendor';
}

const MOCK_USER_ID = 'user123';

export function OfferCard({ offer, role }: OfferCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if item is saved
    if (role === 'client') {
      getUserProfile(MOCK_USER_ID).then(profile => {
        if (profile?.savedItemIds?.includes(offer.id)) {
          setIsSaved(true);
        }
      })
    }
  }, [offer.id, role]);

  const handleSaveToggle = async () => {
    if (role !== 'client') return;
    setIsSaving(true);
    try {
        await toggleSavedItem(MOCK_USER_ID, offer.id);
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
        <Image
          src={offer.image}
          alt={offer.title}
          width={600}
          height={400}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
          data-ai-hint="event offer"
        />
         {role === 'client' && (
             <Button size="icon" variant="secondary" onClick={handleSaveToggle} disabled={isSaving} className="absolute top-3 right-3 rounded-full h-8 w-8 bg-background/70 hover:bg-background">
                {isSaved ? <HeartCrack className="h-4 w-4 text-red-500" /> : <Heart className="h-4 w-4" />}
                <span className="sr-only">Save</span>
            </Button>
         )}
        <Badge className="absolute top-3 left-3 bg-primary/90 text-primary-foreground" variant="default">
          Special Offer
        </Badge>
      </CardHeader>
      <CardContent className="p-4 flex-grow flex flex-col">
        <h3 className="text-xl font-bold leading-tight mb-2 flex-grow">{offer.title}</h3>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-background ring-2 ring-primary">
            <AvatarImage src={offer.vendorAvatar} alt={offer.vendorName} />
            <AvatarFallback>{offer.vendorName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm">{offer.vendorName}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-bold">{offer.rating.toFixed(1)}</span>
              <span>({offer.reviewCount} reviews)</span>
            </div>
          </div>
        </div>
         <div className="flex items-center gap-2 mt-4 pt-4 border-t border-dashed">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">Availability: {offer.availability}</span>
        </div>
      </CardContent>
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
          <ManageServiceDialog service={offer}>
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
