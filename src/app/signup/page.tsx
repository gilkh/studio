

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
import { useState } from 'react';

const signupFormSchema = z.object({
  accountType: z.enum(['client', 'vendor'], {
    required_error: "You need to select an account type.",
  }),
  profilePicture: z.any().optional(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  businessName: z.string().optional(),
  vendorCode: z.string().optional(),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string()
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
      confirmPassword: ''
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
  
  const getInitials = () => {
    if (accountType === 'vendor' && businessName) {
        return businessName.substring(0, 2);
    }
    if (firstName && lastName) {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`;
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
                            
                             <FormField
                                control={form.control}
                                name="profilePicture"
                                render={({ field }) => (
                                <FormItem className="flex flex-col items-center">
                                    <FormLabel>Profile Picture (Optional)</FormLabel>
                                    <FormControl>
                                    <div className="relative mt-2">
                                        <Avatar className="h-24 w-24 border-2 border-primary/50">
                                            <AvatarImage src={avatarPreview || undefined} alt="Avatar preview" />
                                            <AvatarFallback>
                                                {getInitials()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <label htmlFor="picture-upload" className="absolute -bottom-2 -right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-background hover:bg-accent">
                                            <Camera className="h-4 w-4" />
                                            <Input 
                                                id="picture-upload"
                                                type="file"
                                                className="sr-only"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        setAvatarPreview(URL.createObjectURL(file));
                                                        field.onChange(file);
                                                    }
                                                }}
                                            />
                                        </label>
                                    </div>
                                    </FormControl>
                                    <FormMessage className="mt-2" />
                                </FormItem>
                                )}
                            />


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
                                        <FormLabel>Vendor Registration Code</FormLabel>
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
