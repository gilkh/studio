'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { getUserProfile, updateUserProfile } from '@/lib/services';
import type { UserProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

// Mock user ID for demonstration. In a real app, this would come from auth.
const MOCK_USER_ID = 'user123';

const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email(),
  phone: z.string().min(10, "Please enter a valid phone number"),
});

export default function ClientProfilePage() {
  const { toast } = useToast();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    },
  });

  useEffect(() => {
    async function fetchUser() {
      try {
        const userProfile = await getUserProfile(MOCK_USER_ID);
        if (userProfile) {
          setUser(userProfile);
          form.reset(userProfile);
        } else {
            // If no profile, create one with mock data for the demo
            const newUser = { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', phone: '(123) 456-7890' };
            await updateUserProfile(MOCK_USER_ID, newUser);
            setUser({ id: MOCK_USER_ID, createdAt: new Date(), ...newUser });
            form.reset(newUser);
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        toast({
          title: "Error",
          description: "Could not load your profile. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchUser();
  }, [form, toast]);


  async function onSubmit(values: z.infer<typeof profileFormSchema>) {
    try {
      await updateUserProfile(MOCK_USER_ID, values);
      setUser(prev => prev ? { ...prev, ...values } : null);
      toast({
        title: "Profile Updated",
        description: "Your information has been saved successfully.",
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
       toast({
        title: "Update Failed",
        description: "Could not save your changes. Please try again.",
        variant: "destructive",
      });
    }
  }
  
  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="flex items-center gap-6">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <div>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
                 <div className="grid md:grid-cols-2 gap-6 max-w-3xl">
                    <div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-10 w-full" /></div>
                    <div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-10 w-full" /></div>
                    <div className="space-y-2 md:col-span-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-10 w-full" /></div>
                    <div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-10 w-full" /></div>
                </div>
            </CardContent>
        </Card>
    )
  }

  return (
     <Card>
        <CardHeader>
            <CardTitle>My Profile</CardTitle>
            <CardDescription>View and edit your public profile information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative">
                    <Avatar className="h-24 w-24 border-2 border-primary">
                        <AvatarImage src={`https://i.pravatar.cc/150?u=${MOCK_USER_ID}`} alt={user?.firstName} data-ai-hint="user avatar" />
                        <AvatarFallback>{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="icon" className="absolute -bottom-2 -right-2 rounded-full bg-background h-8 w-8">
                        <Camera className="h-4 w-4"/>
                        <span className="sr-only">Change photo</span>
                    </Button>
                </div>
                <div className="text-center sm:text-left">
                    <h2 className="text-2xl font-bold">{user?.firstName} {user?.lastName}</h2>
                    <p className="text-muted-foreground">Client since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, {month: 'long', year: 'numeric'}) : 'this year'}</p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-6 max-w-3xl">
                     <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                                <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                         <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem className="md:col-span-2">
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="john.doe@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                                <Input type="tel" placeholder="(123) 456-7890" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <div className="md:col-span-2 flex justify-end">
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                             {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Form>
        </CardContent>
    </Card>
  )
}
