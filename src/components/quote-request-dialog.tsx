
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
import type { Service, UserProfile, Offer } from '@/lib/types';
import { createQuoteRequest, getUserProfile } from '@/lib/services';
import { Loader2, MessageSquare, Send } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface QuoteRequestDialogProps {
  children: React.ReactNode;
  service: Service | Offer;
}

export function QuoteRequestDialog({ children, service }: QuoteRequestDialogProps) {
  const { userId } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);

  React.useEffect(() => {
    if (userId) {
        getUserProfile(userId).then(setUserProfile);
    }
  }, [userId])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userId || !userProfile) {
        toast({ title: "Not Logged In", description: "You must be logged in to request a quote.", variant: "destructive" });
        return;
    }
    setIsSending(true);

    const formData = new FormData(event.currentTarget);
    const message = formData.get('message') as string;
    const eventDate = formData.get('date') as string;

    try {
        await createQuoteRequest({
            clientId: userId,
            clientName: `${userProfile.firstName} ${userProfile.lastName}`,
            clientAvatar: `https://i.pravatar.cc/150?u=${userId}`,
            vendorId: service.vendorId,
            serviceId: service.id,
            serviceTitle: service.title,
            message,
            eventDate,
            status: 'pending',
            item: service, // Pass the full service/offer object
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
  
  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    e.preventDefault(); 
    setOpen(true);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div onClick={handleTriggerClick}>
        {children}
      </div>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Contact {service.vendorName}</DialogTitle>
          <DialogDescription>
            Send a message regarding "{service.title}". This will start a new conversation in your messages.
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
              placeholder="Hi, I'm interested in this. Could you tell me more about..."
              className="col-span-3"
              rows={5}
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Event Date
            </Label>
            <Input id="date" name="date" type="date" className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="guests" className="text-right">
              Est. Guests
            </Label>
            <Input id="guests" name="guests" type="number" placeholder="e.g., 150" className="col-span-3" />
          </div>
        </form>
        <DialogFooter>
          <Button type="submit" form="quote-form" disabled={isSending} className="w-full sm:w-auto">
            {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Send Message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
