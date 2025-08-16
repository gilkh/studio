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
import type { ServiceOrOffer } from '@/lib/types';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { DollarSign } from 'lucide-react';

interface ManageServiceDialogProps {
  children: React.ReactNode;
  service?: ServiceOrOffer;
}

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function ManageServiceDialog({ children, service }: ManageServiceDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [type, setType] = React.useState<string>(service?.type || 'service');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = formData.get('title');
    
    toast({
      title: `${type === 'service' ? 'Service' : 'Offer'} ${service ? 'Updated' : 'Created'}`,
      description: `The ${type} "${title}" has been successfully saved.`,
    });
    setOpen(false);
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
                        <RadioGroupItem value="service" id="r-service" />
                        <Label htmlFor="r-service">Service (Quote-based)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="offer" id="r-offer" />
                        <Label htmlFor="r-offer">Offer (Fixed Price)</Label>
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
           )}
           <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">
              Availability
            </Label>
            <div className="col-span-3 space-y-4">
              <div className="space-y-2">
                 {weekDays.map(day => (
                    <div key={day} className="flex items-center gap-2">
                        <Checkbox id={`day-${day}`} />
                        <Label htmlFor={`day-${day}`} className="font-normal w-24">{day}</Label>
                        <Input type="time" className="h-8" />
                        <span className="text-muted-foreground">-</span>
                        <Input type="time" className="h-8" />
                    </div>
                ))}
              </div>
              <Textarea placeholder="Add any extra availability notes (e.g., 'By appointment only on weekends')..." />
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button type="submit" form="service-form">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
