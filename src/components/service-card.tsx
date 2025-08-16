
'use client';
import type { Service } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Edit, Heart, HeartCrack } from 'lucide-react';
import Image from 'next/image';
import { QuoteRequestDialog } from './quote-request-dialog';
import { ManageServiceDialog } from './manage-service-dialog';
import { useEffect, useState } from 'react';
import { getUserProfile, toggleSavedItem } from '@/lib/services';
import { useToast } from '@/hooks/use-toast';

interface ServiceCardProps {
  service: Service;
  role: 'client' | 'vendor';
}

const MOCK_USER_ID = 'user123';

export function ServiceCard({ service, role }: ServiceCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if item is saved
    if (role === 'client') {
      getUserProfile(MOCK_USER_ID).then(profile => {
        if (profile?.savedItemIds?.includes(service.id)) {
          setIsSaved(true);
        }
      })
    }
  }, [service.id, role]);

  const handleSaveToggle = async () => {
    if (role !== 'client') return;
    setIsSaving(true);
    try {
        await toggleSavedItem(MOCK_USER_ID, service.id);
        setIsSaved(!isSaved);
        toast({
            title: isSaved ? 'Item Unsaved' : 'Item Saved!',
            description: isSaved ? `"${service.title}" removed from your saved items.` : `"${service.title}" added to your saved items.`
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
          src={service.image}
          alt={service.title}
          width={600}
          height={400}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
          data-ai-hint="event service"
        />
        {role === 'client' && (
             <Button size="icon" variant="secondary" onClick={handleSaveToggle} disabled={isSaving} className="absolute top-3 right-3 rounded-full h-8 w-8 bg-background/70 hover:bg-background">
                {isSaved ? <HeartCrack className="h-4 w-4 text-red-500" /> : <Heart className="h-4 w-4" />}
                <span className="sr-only">Save</span>
            </Button>
         )}
         <Badge className="absolute top-3 left-3" variant="secondary">
          {service.category}
        </Badge>
      </CardHeader>
      <CardContent className="p-4 flex-grow flex flex-col">
        <h3 className="text-xl font-bold leading-tight mb-2 flex-grow">{service.title}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{service.description}</p>
        <div className="flex items-center gap-3 mt-auto pt-4 border-t border-dashed">
          <Avatar className="h-10 w-10 border-2 border-background ring-2 ring-primary">
            <AvatarImage src={service.vendorAvatar} alt={service.vendorName} />
            <AvatarFallback>{service.vendorName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm">{service.vendorName}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-bold">{service.rating.toFixed(1)}</span>
              <span>({service.reviewCount} reviews)</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-2 flex justify-between items-center bg-muted/50">
        <div>
          <p className="text-xl font-semibold text-primary">Custom Quote</p>
        </div>
        {role === 'client' ? (
          <QuoteRequestDialog service={service}>
            <Button size="lg">Get a Quote</Button>
          </QuoteRequestDialog>
        ) : (
          <ManageServiceDialog service={service}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit Service
            </Button>
          </ManageServiceDialog>
        )}
      </CardFooter>
    </Card>
  );
}
