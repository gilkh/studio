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
import { useToast } from '@/hooks/use-toast';
import type { Service } from '@/lib/types';

interface QuoteRequestDialogProps {
  children: React.ReactNode;
  service: Service;
}

export function QuoteRequestDialog({ children, service }: QuoteRequestDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast({
      title: 'Quote Request Sent!',
      description: `Your request for "${service.title}" has been sent to ${service.vendorName}.`,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request a Quote</DialogTitle>
          <DialogDescription>
            Send a message to {service.vendorName} about the service: "{service.title}".
          </DialogDescription>
        </DialogHeader>
        <form id="quote-form" onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="message" className="text-right">
              Message
            </Label>
            <Textarea
              id="message"
              placeholder="Hi, I'm interested in your service. I'd like to discuss my event needs..."
              className="col-span-3"
              rows={5}
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Event Date
            </Label>
            <Input id="date" type="date" className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="guests" className="text-right">
              Est. Guests
            </Label>
            <Input id="guests" type="number" placeholder="e.g., 150" className="col-span-3" />
          </div>
        </form>
        <DialogFooter>
          <Button type="submit" form="quote-form">
            Send Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
