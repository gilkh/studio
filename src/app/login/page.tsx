
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/logo';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (role: 'client' | 'vendor') => {
    // In a real app, you'd handle authentication here.
    // For this prototype, we'll just redirect.
    if (role === 'client') {
      router.push('/client/home');
    } else {
      router.push('/vendor/home');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/50 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center p-4 sm:p-6">
            <div className="flex justify-center items-center gap-3 mb-4">
                 <Logo className="h-10 w-10 text-primary" />
                 <h1 className="text-3xl font-bold text-foreground tracking-tight">EventEase</h1>
            </div>
          <CardTitle className="text-2xl font-bold">Welcome Back!</CardTitle>
          <CardDescription>Sign in to continue to your dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <Button onClick={() => handleLogin('client')} className="w-full py-3 sm:py-6 text-base sm:text-lg">
              Sign In as a Client
            </Button>
            <Button onClick={() => handleLogin('vendor')} variant="secondary" className="w-full py-3 sm:py-6 text-base sm:text-lg">
              Sign In as a Vendor
            </Button>
          </div>
           <div className="mt-6 text-center text-sm">
            Don&apos;t have an account?{' '}
            <a href="#" className="underline">
              Sign up
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
