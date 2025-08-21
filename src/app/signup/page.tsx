

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { createNewUser } from '@/lib/services';
import { Camera, Loader2, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { UserProfile } from '@/lib/types';
import { VendorInquiryDialog } from '@/components/vendor-inquiry-dialog';


const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];


const signupFormSchema = z.object({
  accountType: z.enum(['client', 'vendor'], {
    required_error: "You need to select an account type.",
  }),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  businessName: z.string().optional(),
  vendorCode: z.string().optional(),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string(),
  avatar: z.string().optional(),
}).refine(data => {
    if (data.accountType === 'vendor') {
        return !!data.businessName && data.businessName.length > 0;
    }
    return true;
}, {
    message: "Business name is required for vendors",
    path: ["businessName"],
}).refine(data => {
    if (data.accountType === 'vendor') {
        return !!data.vendorCode && data.vendorCode.length > 0;
    }
    return true;
}, {
    message: "A registration code is required for vendors",
    path: ["vendorCode"],
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});


export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarFileRef = useRef<HTMLInputElement>(null);
  
  const form = useForm<z.infer<typeof signupFormSchema>>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      accountType: 'client',
      firstName: '',
      lastName: '',
      businessName: '',
      vendorCode: '',
      email: '',
      password: '',
      confirmPassword: '',
      avatar: '',
    },
  });

  const accountType = form.watch('accountType');
  const firstName = form.watch('firstName');
  const lastName = form.watch('lastName');
  const businessName = form.watch('businessName');

  async function onSubmit(values: z.infer<typeof signupFormSchema>) {
    form.clearErrors();
    try {
        const result = await createNewUser(values);

        if (result) {
            localStorage.setItem('userId', result.userId);
            localStorage.setItem('role', result.role);

            toast({
                title: "Account Created!",
                description: "Welcome to Farhetkoun. Redirecting you to your new dashboard.",
            });

            // Redirect to the appropriate dashboard
            if (result.role === 'client') {
                router.push('/client/home');
            } else {
                router.push('/vendor/home');
            }
        }

    } catch(error) {
        console.error("Signup failed", error);
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred. Please try again.";
        toast({
            title: "Sign-up Failed",
            description: errorMessage,
            variant: "destructive",
        });
    }
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
                const MAX_WIDTH = 256;
                const MAX_HEIGHT = 256;
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
                resolve(canvas.toDataURL('image/jpeg', 0.9)); // 90% quality JPEG
            };
        };
        reader.onerror = (error) => reject(error);
    });
  }
  
  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (file.size > MAX_FILE_SIZE) {
          toast({ title: 'File too large', description: 'Image must be less than 5MB.', variant: 'destructive' });
          return;
      }
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
          toast({ title: 'Invalid file type', description: 'Please select a JPG, PNG, or WEBP image.', variant: 'destructive' });
          return;
      }

      try {
        const compressedDataUrl = await compressImage(file);
        setAvatarPreview(compressedDataUrl);
        form.setValue('avatar', compressedDataUrl);
      } catch (error) {
        console.error("Image processing failed", error);
        toast({ title: 'Image Error', description: 'Could not process the image.', variant: 'destructive' });
      }
  }

  
  const getInitials = () => {
    if (accountType === 'vendor' && businessName) {
        return businessName.substring(0, 2).toUpperCase();
    }
    if (firstName && lastName) {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    return <User />;
  }

  return (
     <div className="w-full min-h-screen bg-secondary/50 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
             <Link href="/login" className="flex justify-center items-center gap-4 mb-6">
                <Logo className="h-12 w-12 text-primary" />
                <h1 className="text-4xl font-extrabold tracking-tighter text-foreground">
                    Farhetkoun
                </h1>
            </Link>
           <Card className="shadow-2xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
                    <CardDescription>Join our community to start planning or providing services.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                             <FormField
                                control={form.control}
                                name="accountType"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                    <FormLabel>I am a...</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex gap-4"
                                        >
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="client" />
                                            </FormControl>
                                            <FormLabel className="font-normal">Client (Planning an event)</FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl>
                                            <RadioGroupItem value="vendor" />
                                            </FormControl>
                                            <FormLabel className="font-normal">Vendor (Providing services)</FormLabel>
                                        </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                            
                             <div className="flex flex-col items-center">
                                <Label htmlFor="avatar-upload" className="cursor-pointer">Profile Picture</Label>
                                 <Input 
                                      id="avatar-upload"
                                      type="file"
                                      accept="image/*"
                                      ref={avatarFileRef}
                                      onChange={handleAvatarChange}
                                      className="hidden" 
                                  />
                                <div className="relative mt-2" onClick={() => avatarFileRef.current?.click()}>
                                    <Avatar className="h-24 w-24 border-2 border-primary/50">
                                        <AvatarImage src={avatarPreview || undefined} alt="Avatar preview" />
                                        <AvatarFallback className="text-3xl">
                                            {getInitials()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute bottom-0 right-0 flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground border-2 border-background">
                                        <Camera className="h-4 w-4" />
                                    </div>
                                </div>
                             </div>


                            <div className="grid grid-cols-2 gap-4">
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
                            </div>

                            {accountType === 'vendor' && (
                                <>
                                 <FormField
                                    control={form.control}
                                    name="businessName"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Business Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Timeless Snaps" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="vendorCode"
                                    render={({ field }) => (
                                        <FormItem>
                                        <div className="flex justify-between items-center">
                                            <FormLabel>Vendor Registration Code</FormLabel>
                                            <VendorInquiryDialog>
                                                <button type="button" className="text-xs text-primary hover:underline">Request a code</button>
                                            </VendorInquiryDialog>
                                        </div>
                                        <FormControl>
                                            <Input placeholder="Enter code provided by admin" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                </>
                            )}

                             <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="john.doe@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                             <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />

                            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                               {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                               Create Account
                            </Button>
                        </form>
                    </Form>
                     <div className="mt-6 text-center text-sm">
                        Already have an account?{' '}
                        <Link href="/login" className="underline">
                            Sign in
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
