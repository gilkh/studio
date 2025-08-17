
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from '@/hooks/use-toast';
import type { ServiceOrOffer, Service, Offer, VendorProfile, MediaItem } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { DollarSign, Loader2, ImagePlus, X, Video } from 'lucide-react';
import { createServiceOrOffer, getVendorProfile, updateServiceOrOffer } from '@/lib/services';
import { useAuth } from '@/hooks/use-auth';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';
import { ScrollArea } from './ui/scroll-area';
import Image from 'next/image';
import { Separator } from './ui/separator';

interface ManageServiceDialogProps {
  children: React.ReactNode;
  service?: ServiceOrOffer;
  onListingUpdate?: () => void;
}

const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = document.createElement('img');
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1024;
                const MAX_HEIGHT = 1024;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject('Could not get canvas context');

                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.8)); // 80% quality JPEG
            };
        };
        reader.onerror = (error) => reject(error);
    });
}


export function ManageServiceDialog({ children, service, onListingUpdate }: ManageServiceDialogProps) {
  const { userId: vendorId } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [type, setType] = React.useState<string>(service?.type || 'offer');
  const [isSaving, setIsSaving] = React.useState(false);
  const [vendorProfile, setVendorProfile] = React.useState<VendorProfile | null>(null);
  const [dates, setDates] = React.useState<Date[] | undefined>([]);
  const [media, setMedia] = React.useState<MediaItem[]>([]);


  React.useEffect(() => {
    async function loadVendor() {
        if (vendorId) {
            const profile = await getVendorProfile(vendorId);
            setVendorProfile(profile);
        }
    }
    if (open) {
        loadVendor();
        // Reset state when dialog opens based on service prop
        setType(service?.type || 'offer');
        setMedia(service?.media || []);
        if (service?.type === 'offer' && service.availableDates) {
            setDates(service.availableDates.map(d => new Date(d)));
        } else {
            setDates([]);
        }
    }
  }, [vendorId, open, service]);


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!vendorId || !vendorProfile) {
        toast({ title: "Error", description: "You must be logged in as a vendor.", variant: "destructive" });
        return;
    }
    setIsSaving(true);
    const formData = new FormData(event.currentTarget);
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;
    
    const finalMedia = media.map((item, index) => ({ ...item, isThumbnail: index === 0 }));

    try {
        const baseData: Partial<ServiceOrOffer> = {
            title,
            category,
            description,
            vendorId,
            vendorName: vendorProfile.businessName,
            vendorAvatar: `https://i.pravatar.cc/150?u=${vendorId}`,
            rating: service?.rating || 0,
            reviewCount: service?.reviewCount || 0,
            image: finalMedia.length > 0 ? finalMedia[0].url : service?.image || 'https://placehold.co/600x400.png',
            media: finalMedia,
        }

        if (type === 'offer') {
            const price = parseFloat(formData.get('price') as string);
            const availableDates = dates?.map(date => format(date, 'yyyy-MM-dd'));

            const offerData: Partial<Offer> = {
                ...baseData,
                type: 'offer',
                price,
                availableDates,
            }
            if (service?.id) {
                await updateServiceOrOffer(service.id, offerData);
            } else {
                await createServiceOrOffer(offerData as Omit<Offer, 'id'>);
            }

        } else {
            const serviceData: Partial<Service> = {
                ...baseData,
                type: 'service',
            }
             if (service?.id) {
                await updateServiceOrOffer(service.id, serviceData);
            } else {
                await createServiceOrOffer(serviceData as Omit<Service, 'id'>);
            }
        }
        
        toast({
          title: `${type === 'service' ? 'Service' : 'Offer'} ${service ? 'Updated' : 'Created'}`,
          description: `The ${type} "${title}" has been successfully saved.`,
        });
        setOpen(false);
        onListingUpdate?.(); // Callback to refresh the list

    } catch (error) {
        console.error("Failed to save service/offer", error);
        toast({ title: "Save Failed", description: "Could not save your listing.", variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
  };
  
  const handleMediaUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
        const newMediaItems: MediaItem[] = [];
        for(let i = 0; i < files.length; i++) {
            const file = files[i];
            const isVideo = file.type.startsWith('video');

            if (isVideo) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    newMediaItems.push({
                        url: reader.result as string,
                        type: 'video',
                    });
                     if (newMediaItems.length === files.length) {
                        setMedia(prev => [...prev, ...newMediaItems]);
                    }
                };
                reader.readAsDataURL(file);
            } else {
                try {
                    const compressedDataUrl = await compressImage(file);
                     newMediaItems.push({
                        url: compressedDataUrl,
                        type: 'image',
                    });
                     if (newMediaItems.length === files.length) {
                        setMedia(prev => {
                             const allItems = [...prev, ...newMediaItems];
                            allItems.sort((a, b) => {
                                if (a.type === 'image' && b.type === 'video') return -1;
                                if (a.type === 'video' && b.type === 'image') return 1;
                                return 0;
                            });

                            if(allItems.length > 0 && allItems[0].type === 'video'){
                                toast({
                                    title: "Invalid Thumbnail",
                                    description: "The first item in your portfolio must be an image, not a video. It has been moved.",
                                    variant: "destructive"
                                });
                            }
                            return allItems;
                        });
                    }
                } catch (error) {
                    console.error("Image compression failed:", error);
                    toast({title: "Image Error", description: `Could not process image: ${file.name}`, variant: "destructive"});
                }
            }
        }
    }
  };

  const handleRemoveMedia = (index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  }


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90dvh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{service ? 'Edit' : 'Create New'}</DialogTitle>
          <DialogDescription>
            Fill in the details below to {service ? 'update your' : 'list a new'} service or offer.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-hidden">
            <ScrollArea className="h-full pr-4">
                <form id="service-form" onSubmit={handleSubmit} className="grid gap-6 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Type</Label>
                        <RadioGroup defaultValue={type} onValueChange={setType} className="col-span-3 flex gap-4">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="offer" id="r-offer" />
                                <Label htmlFor="r-offer">Offer (Fixed Price)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="service" id="r-service" />
                                <Label htmlFor="r-service">Service (Quote-based)</Label>
                            </div>
                        </RadioGroup>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                        Title
                        </Label>
                        <Input id="title" name="title" defaultValue={service?.title} className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">
                        Category
                        </Label>
                        <Select name="category" defaultValue={service?.category}>
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Catering">Catering</SelectItem>
                            <SelectItem value="Photography">Photography</SelectItem>
                            <SelectItem value="Decor & Floral">Decor & Floral</SelectItem>
                            <SelectItem value="Music & Entertainment">Music & Entertainment</SelectItem>
                            <SelectItem value="Venue">Venue</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="description" className="text-right pt-2">
                        Description
                        </Label>
                        <Textarea
                        id="description"
                        name="description"
                        defaultValue={service?.description}
                        className="col-span-3"
                        required
                        rows={4}
                        />
                    </div>
                    
                     <Separator />

                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right pt-2">Portfolio Media</Label>
                        <div className="col-span-3">
                             <div className="grid grid-cols-3 gap-4 mb-4">
                                {media.map((item, index) => (
                                    <div key={index} className="relative group aspect-video">
                                         {item.type === 'image' ? (
                                            <Image src={item.url} alt={`upload preview ${index}`} layout="fill" className="object-cover rounded-md" />
                                        ) : (
                                            <div className="relative w-full h-full">
                                                <video src={item.url} className="w-full h-full object-cover rounded-md" muted loop playsInline />
                                                <div className="absolute bottom-1 right-1 bg-black/50 text-white rounded-full p-1">
                                                    <Video className="h-3 w-3" />
                                                </div>
                                            </div>
                                        )}
                                        <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100" onClick={() => handleRemoveMedia(index)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <Button type="button" variant="outline" asChild>
                                <Label htmlFor="media-upload" className="cursor-pointer">
                                    <ImagePlus className="mr-2 h-4 w-4" />
                                    Add Media
                                </Label>
                            </Button>
                            <Input 
                                id="media-upload" 
                                type="file" 
                                className="sr-only" 
                                accept="image/*,video/*" 
                                multiple
                                onChange={handleMediaUpload} 
                            />
                            <p className="text-xs text-muted-foreground mt-2">The first item must be an image to be used as a thumbnail.</p>
                        </div>
                    </div>

                    {type === 'offer' && (
                        <>
                             <Separator />
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="price" className="text-right">
                                    Price
                                </Label>
                                <div className="relative col-span-3">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    defaultValue={service?.type === 'offer' ? service.price : undefined}
                                    className="pl-8"
                                    required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label className="text-right pt-2">
                                    Availability
                                </Label>
                                <div className="col-span-3">
                                    <Calendar
                                        mode="multiple"
                                        selected={dates}
                                        onSelect={setDates}
                                        className="rounded-md border"
                                    />
                                    <p className="text-sm text-muted-foreground mt-2">Select all dates this specific offer is available.</p>
                                </div>
                            </div>
                        </>
                    )}
                </form>
            </ScrollArea>
        </div>
        <DialogFooter className="flex-shrink-0 pt-4 border-t">
          <Button type="submit" form="service-form" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
