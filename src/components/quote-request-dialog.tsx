
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
import { createQuoteRequest } from '@/lib/services';
import { Loader2 } from 'lucide-react';

interface QuoteRequestDialogProps {
  children: React.ReactNode;
  service: Service;
}

const MOCK_USER_ID = 'user123'; // In a real app, this would come from auth

export function QuoteRequestDialog({ children, service }: QuoteRequestDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSending(true);

    const formData = new FormData(event.currentTarget);
    const message = formData.get('message') as string;
    const eventDate = formData.get('date') as string;

    try {
        await createQuoteRequest({
            clientId: MOCK_USER_ID,
            clientName: 'John Doe', // Mock data, get from user profile in real app
            clientAvatar: `https://i.pravatar.cc/150?u=${MOCK_USER_ID}`, // Mock
            vendorId: service.vendorId,
            serviceId: service.id,
            serviceTitle: service.title,
            message,
            eventDate,
            status: 'pending'
        });

        toast({
            title: 'Message Sent!',
            description: `Your request has been sent to ${service.vendorName}. You can see their reply in your Messages.`,
        });
        setOpen(false);
    } catch (error) {
        console.error("Failed to send quote request", error);
        toast({ title: "Send Failed", description: "Could not send your request. Please try again.", variant: "destructive" });
    } finally {
        setIsSending(false);
    }
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
              name="message"
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
            <Input id="date" name="date" type="date" className="col-span-3" required />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="guests" className="text-right">
              Est. Guests
            </Label>
            <Input id="guests" name="guests" type="number" placeholder="e.g., 150" className="col-span-3" />
          </div>
        </form>
        <DialogFooter>
          <Button type="submit" form="quote-form" disabled={isSending}>
            {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
