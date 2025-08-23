
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
import { createNewUser, signInWithGoogle, signInWithApple } from '@/lib/services';
import { Camera, Loader2, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { UserProfile } from '@/lib/types';
import { VendorInquiryDialog } from '@/components/vendor-inquiry-dialog';
import { Separator } from '@/components/ui/separator';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.657-3.356-11.303-7.918l-6.573,4.817C9.656,39.663,16.318,44,24,44z" />
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,34.551,44,29.865,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
        </svg>
    );
}

function AppleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M12.01,2.025c-2.42,0-4.79,1.24-6.13,3.19c-1.48,2.14-1.39,5.04,0.36,6.91c1.1,1.19,2.67,1.88,4.24,1.82 c0.33-0.01,0.65-0.02,0.98-0.02c1.6,0,3.13-0.65,4.25-1.85c0.88-0.96,1.4-2.14,1.52-3.39c-0.01-0.04-0.02-0.08-0.04-0.12 c-0.69-1.95-2.27-3.32-4.2-3.54C12.89,2.015,12.45,2.025,12.01,2.025z M13.19,15.225c-0.12,0.33-0.24,0.66-0.4,0.98 c-0.56,1.11-1.33,2.12-2.28,2.98c-0.59,0.53-1.25,0.98-1.99,1.32c-1.34,0.62-2.88,0.7-4.29,0.2c-0.01,0-0.02-0.01-0.03-0.01 c-0.14-0.06-0.28-0.12-0.41-0.19c-0.01,0-0.02,0-0.03-0.01c-1.63-0.8-2.61-2.43-2.73-4.21c-0.06-0.85,0.06-1.7,0.34-2.5 c0.87-2.43,2.97-4.14,5.43-4.52c0.32-0.05,0.64-0.08,0.96-0.08c0.41,0,0.82,0.04,1.22,0.11c-0.09,0.52-0.13,1.06-0.13,1.6 c0,1.55,0.51,3.01,1.42,4.19C12.56,15.235,12.87,15.225,13.19,15.225z" />
        </svg>
    )
}

function setCookie(name: string, value: string, days: number) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

const signupFormSchema = z.object({
  accountType: z.enum(['client', 'vendor'], {
    required_error: "You need to select an account type.",
  }),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(10, "Please enter a valid phone number"),
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
  const [isSocialLoading, setIsSocialLoading] = useState<false | 'google' | 'apple'>(false);
  
  const form = useForm<z.infer<typeof signupFormSchema>>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      accountType: 'client',
      firstName: '',
      lastName: '',
      phone: '',
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

    const onSocialLoginSuccess = (role: 'client' | 'vendor' | 'admin') => {
      toast({
          title: 'Sign Up Successful!',
          description: `Welcome! Redirecting to your dashboard...`,
      });
      if (role === 'client') {
          router.push('/client/home');
      } else if (role === 'vendor') {
          router.push('/vendor/home');
      }
  };

   const handleSocialLogin = async (provider: 'google' | 'apple') => {
      setIsSocialLoading(provider);
      try {
          const result = provider === 'google' ? await signInWithGoogle() : await signInWithApple();
          if (result.success) {
            localStorage.setItem('userId', result.userId);
            localStorage.setItem('role', result.role);
            setCookie('role', result.role, 7);
            setCookie('userId', result.userId, 7);
            onSocialLoginSuccess(result.role);
          } else {
              toast({ title: 'Sign Up Failed', description: result.message, variant: 'destructive' });
          }
      } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An error occurred during sign-up.';
          toast({ title: 'Sign Up Failed', description: errorMessage, variant: 'destructive' });
      } finally {
          setIsSocialLoading(false);
      }
  }


  async function onSubmit(values: z.infer<typeof signupFormSchema>) {
    form.clearErrors();
    try {
        const result = await createNewUser(values);

        if (result.success) {
            if (result.role === 'client') {
                toast({
                    title: "Account Created! Please Verify Your Email",
                    description: "We've sent a verification link to your email address. Please check your inbox to continue.",
                    duration: 10000,
                });
                router.push('/login'); 
            } else { // Vendor or other roles
                 localStorage.setItem('userId', result.userId);
                 localStorage.setItem('role', result.role);
                toast({
                    title: "Account Created!",
                    description: "Welcome to Farhetkoun. Redirecting you to your new dashboard.",
                });
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
     <div className="w-full min-h-screen bg-background flex items-center justify-center p-4">
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
                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" onClick={() => handleSocialLogin('google')} disabled={!!isSocialLoading}>
                             {isSocialLoading === 'google' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2 h-5 w-5" />}
                            Google
                        </Button>
                        <Button variant="outline" onClick={() => handleSocialLogin('apple')} disabled={!!isSocialLoading}>
                            {isSocialLoading === 'apple' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AppleIcon className="mr-2 h-5 w-5" />}
                            Apple
                        </Button>
                    </div>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                            Or continue with email
                            </span>
                        </div>
                    </div>


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

                            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting || !!isSocialLoading}>
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

    