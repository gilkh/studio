
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
import { Loader2 } from 'lucide-react';

const signupFormSchema = z.object({
  accountType: z.enum(['client', 'vendor'], {
    required_error: "You need to select an account type.",
  }),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  businessName: z.string().optional(),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
}).refine(data => {
    if (data.accountType === 'vendor') {
        return !!data.businessName && data.businessName.length > 0;
    }
    return true;
}, {
    message: "Business name is required for vendors",
    path: ["businessName"],
});


export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof signupFormSchema>>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      accountType: 'client',
      firstName: '',
      lastName: '',
      businessName: '',
      email: '',
      password: '',
    },
  });

  const accountType = form.watch('accountType');

  async function onSubmit(values: z.infer<typeof signupFormSchema>) {
    try {
        await createNewUser(values);
        toast({
            title: "Account Created!",
            description: "Welcome to TradeCraft. You can now sign in.",
        });
        // Redirect to the appropriate dashboard after signup
        if (values.accountType === 'client') {
            router.push('/client/home');
        } else {
            router.push('/vendor/home');
        }
    } catch(error) {
        console.error("Signup failed", error);
         toast({
            title: "Sign-up Failed",
            description: "Could not create your account. Please try again.",
            variant: "destructive",
        });
    }
  }

  return (
     <div className="w-full min-h-screen bg-secondary/50 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
             <Link href="/login" className="flex justify-center items-center gap-4 mb-6">
                <Logo className="h-12 w-12 text-primary" />
                <h1 className="text-4xl font-extrabold tracking-tighter text-foreground">
                    TradeCraft
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
