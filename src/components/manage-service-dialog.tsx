
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
import type { ServiceOrOffer, Service, Offer, VendorProfile } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { DollarSign, Loader2 } from 'lucide-react';
import { createServiceOrOffer, getVendorProfile } from '@/lib/services';
import { useAuth } from '@/hooks/use-auth';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';

interface ManageServiceDialogProps {
  children: React.ReactNode;
  service?: ServiceOrOffer;
}

export function ManageServiceDialog({ children, service }: ManageServiceDialogProps) {
  const { userId: vendorId } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [type, setType] = React.useState<string>(service?.type || 'offer');
  const [isSaving, setIsSaving] = React.useState(false);
  const [vendorProfile, setVendorProfile] = React.useState<VendorProfile | null>(null);
  const [dates, setDates] = React.useState<Date[] | undefined>(
      service?.type === 'offer' && service.availableDates 
      ? service.availableDates.map(d => new Date(d)) 
      : []
  );

  React.useEffect(() => {
    async function loadVendor() {
        if (vendorId) {
            const profile = await getVendorProfile(vendorId);
            setVendorProfile(profile);
        }
    }
    if (open) {
        loadVendor();
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

    try {
        const baseData = {
            title,
            category,
            description,
            vendorId,
            vendorName: vendorProfile.businessName,
            vendorAvatar: `https://i.pravatar.cc/150?u=${vendorId}`,
            rating: 0,
            reviewCount: 0,
            image: 'https://placehold.co/600x400.png'
        }

        if (type === 'offer') {
            const price = parseFloat(formData.get('price') as string);
            const availableDates = dates?.map(date => format(date, 'yyyy-MM-dd'));

            const offerData: Omit<Offer, 'id'> = {
                ...baseData,
                type: 'offer',
                price,
                availableDates,
            }
            await createServiceOrOffer(offerData);
        } else {
            const serviceData: Omit<Service, 'id'> = {
                ...baseData,
                type: 'service',
            }
            await createServiceOrOffer(serviceData);
        }
        
        toast({
          title: `${type === 'service' ? 'Service' : 'Offer'} ${service ? 'Updated' : 'Created'}`,
          description: `The ${type} "${title}" has been successfully saved.`,
        });
        setOpen(false);

    } catch (error) {
        console.error("Failed to save service/offer", error);
        toast({ title: "Save Failed", description: "Could not save your listing.", variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{service ? 'Edit' : 'Create New'}</DialogTitle>
          <DialogDescription>
            Fill in the details below to {service ? 'update your' : 'list a new'} service or offer.
          </DialogDescription>
        </DialogHeader>
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={service?.description}
              className="col-span-3"
              required
            />
          </div>
           {type === 'offer' && (
            <>
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
        <DialogFooter>
          <Button type="submit" form="service-form" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
