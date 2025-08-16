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
import { useToast } from '@/hooks/use-toast';
import type { Offer } from '@/lib/types';
import { Calendar } from './ui/calendar';
import { Badge } from './ui/badge';
import { Clock } from 'lucide-react';

interface BookOfferDialogProps {
  children: React.ReactNode;
  offer: Offer;
}

export function BookOfferDialog({ children, offer }: BookOfferDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast({
      title: 'Booking Successful!',
      description: `Your booking for "${offer.title}" has been confirmed.`,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Book Offer: {offer.title}</DialogTitle>
          <DialogDescription>
            Confirm your booking with {offer.vendorName}.
            <div className="flex items-center gap-2 mt-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground text-sm">Availability: {offer.availability}</span>
            </div>
          </DialogDescription>
        </DialogHeader>
        <form id="book-form" onSubmit={handleSubmit} className="grid gap-6 py-4">
            <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-grow">
                    <Label className="mb-2">Select a Date</Label>
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border"
                    />
                </div>
                <div className="space-y-4 sm:w-2/5">
                    <div>
                        <Label htmlFor="time">Select a Time</Label>
                        <Input id="time" type="time" required />
                    </div>
                     <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" placeholder="John Doe" required/>
                    </div>
                     <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="john.doe@example.com" required/>
                    </div>
                </div>
            </div>
          
        </form>
        <DialogFooter className="flex-col sm:flex-row sm:justify-between items-center sm:items-end w-full">
            <div className="text-left">
                <p className="text-muted-foreground">Total Price</p>
                <p className="text-3xl font-bold text-primary">${offer.price}</p>
            </div>
          <Button type="submit" form="book-form" size="lg">
            Confirm & Book
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
