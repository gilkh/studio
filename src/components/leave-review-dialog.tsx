
'use client';
import { useState } from 'react';
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
import { Textarea } from './ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Star } from 'lucide-react';
import type { Booking, Review } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { createReview, getUserProfile } from '@/lib/services';
import { cn } from '@/lib/utils';

interface LeaveReviewDialogProps {
  booking: Booking;
  children: React.ReactNode;
  onReviewSubmit: () => void;
}

export function LeaveReviewDialog({ booking, children, onReviewSubmit }: LeaveReviewDialogProps) {
  const { toast } = useToast();
  const { userId } = useAuth();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = async () => {
    if (!userId) {
        toast({ title: "Error", description: "You must be logged in.", variant: "destructive"});
        return;
    }
    if (rating === 0) {
        toast({ title: "Rating required", description: "Please select a star rating.", variant: "destructive"});
        return;
    }
     if (!comment.trim()) {
        toast({ title: "Comment required", description: "Please write a brief comment.", variant: "destructive"});
        return;
    }
    setIsSubmitting(true);
    try {
        const userProfile = await getUserProfile(userId);
        if (!userProfile) throw new Error("Could not find user profile.");

        const reviewData: Omit<Review, 'id' | 'createdAt'> = {
            bookingId: booking.id,
            vendorId: booking.vendorId,
            clientId: userId,
            clientName: `${userProfile.firstName} ${userProfile.lastName}`,
            clientAvatar: userProfile.avatar,
            serviceId: booking.serviceId,
            rating,
            comment,
        }
        
      await createReview(reviewData);
      toast({
        title: 'Review Submitted!',
        description: 'Thank you for your feedback.',
      });
      onReviewSubmit();
      setOpen(false);
      
    } catch (error) {
      console.error("Failed to submit review:", error);
      toast({ title: "Submission Failed", description: "Could not submit your review.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Leave a Review</DialogTitle>
          <DialogDescription>
            Share your experience with <strong>{booking.with}</strong> for their service: <strong>{booking.title}</strong>.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <div className="flex justify-center gap-2" onMouseLeave={() => setHoverRating(0)}>
                {[1,2,3,4,5].map(star => (
                    <Star 
                        key={star}
                        className={cn("h-8 w-8 cursor-pointer transition-colors", 
                            (hoverRating >= star || rating >= star) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
                        )}
                        onMouseEnter={() => setHoverRating(star)}
                        onClick={() => setRating(star)}
                    />
                ))}
            </div>
            <Textarea 
                placeholder="Tell us about your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={5}
            />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
