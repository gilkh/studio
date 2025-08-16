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
import type { Service } from '@/lib/types';
import { Checkbox } from './ui/checkbox';

interface ManageServiceDialogProps {
  children: React.ReactNode;
  service?: Service;
}

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function ManageServiceDialog({ children, service }: ManageServiceDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = formData.get('title');
    
    toast({
      title: `Service ${service ? 'Updated' : 'Created'}`,
      description: `The service "${title}" has been successfully saved.`,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{service ? 'Edit Service' : 'Create a New Service'}</DialogTitle>
          <DialogDescription>
            Fill in the details below to {service ? 'update your' : 'list a new'} service.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
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
                <SelectItem value="Graphic Design">Graphic Design</SelectItem>
                <SelectItem value="Web Development">Web Development</SelectItem>
                <SelectItem value="Writing">Writing</SelectItem>
                <SelectItem value="Admin Support">Admin Support</SelectItem>
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Price ($)
            </Label>
            <Input
              id="price"
              name="price"
              type="number"
              defaultValue={service?.price}
              className="col-span-3"
              required
            />
          </div>
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
          <Button type="submit" form="service-form" onClick={() => handleSubmit(new Event('submit', { cancelable: true }) as any)}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
