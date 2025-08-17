
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/logo';
import { Briefcase, CalendarCheck, FileText, Search, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { signInUser } from '@/lib/services';
import { useToast } from '@/hooks/use-toast';
import { logout } from '@/hooks/use-auth';

function setCookie(name: string, value: string, days: number) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}


function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="flex flex-col items-center p-6 text-center bg-card rounded-xl shadow-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
            <div className="flex items-center justify-center w-16 h-16 mb-4 text-primary bg-primary/10 rounded-full">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
        </div>
    )
}

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    // Clear any previous session
    logout();

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string; // In a real app, you'd use the password

    try {
        const result = await signInUser(email);

        if (result) {
            // Save user info to localStorage to simulate a session
            localStorage.setItem('userId', result.userId);
            localStorage.setItem('role', result.role);
            // Set cookie for middleware
            setCookie('role', result.role, 7);

            toast({
                title: 'Sign In Successful!',
                description: `Welcome back! Redirecting to your dashboard...`,
            });
            if (result.role === 'client') {
                router.push('/client/home');
            } else if (result.role === 'vendor') {
                router.push('/vendor/home');
            } else if (result.role === 'admin') {
                router.push('/admin/home');
            }
        } else {
             toast({
                title: 'Sign In Failed',
                description: 'No account found with that email. Please check your credentials or sign up.',
                variant: 'destructive',
            });
        }

    } catch (error) {
        console.error("Login failed:", error);
        toast({
            title: 'Sign In Failed',
            description: 'An error occurred during sign-in. Please try again.',
            variant: 'destructive',
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-background">
      {/* Hero Section */}
      <section className="relative py-20 sm:py-32 bg-gradient-to-br from-primary/10 to-secondary/20">
        <div className="container mx-auto px-4 text-center">
            <div className="flex justify-center items-center gap-4 mb-6">
                <Logo className="h-16 w-16 text-primary" />
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-foreground">
                    TradeCraft
                </h1>
            </div>
          <p className="max-w-3xl mx-auto mt-4 text-lg md:text-xl text-muted-foreground">
            Your all-in-one marketplace for discovering, booking, and managing elite services for your next unforgettable event.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" className="text-lg h-12 px-8" onClick={() => document.getElementById('login-section')?.scrollIntoView({ behavior: 'smooth' })}>
                Get Started
            </Button>
            <Button size="lg" variant="outline" className="text-lg h-12 px-8" onClick={() => document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })}>
                Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features-section" className="py-20 sm:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Why Choose TradeCraft?</h2>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
              We provide the tools and connections you need to create flawless events or grow your service business.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
                icon={<Sparkles className="w-8 h-8" />}
                title="AI Event Planner"
                description="Generate a complete, customized event timeline in seconds. Plan smarter, not harder."
            />
            <FeatureCard 
                icon={<Search className="w-8 h-8" />}
                title="Diverse Marketplace"
                description="Discover a wide range of top-tier services, from catering and photography to entertainment and decor."
            />
             <FeatureCard 
                icon={<Briefcase className="w-8 h-8" />}
                title="Showcase Your Brand"
                description="For vendors: create a stunning profile, upload your portfolio, and connect with a stream of new clients."
            />
            <FeatureCard 
                icon={<FileText className="w-8 h-8" />}
                title="Effortless Quoting"
                description="Request custom quotes from vendors through an integrated messaging system to get the perfect fit for your needs."
            />
            <FeatureCard 
                icon={<CalendarCheck className="w-8 h-8" />}
                title="Seamless Booking"
                description="Book fixed-price offers instantly and manage all your appointments in a centralized calendar."
            />
            <FeatureCard 
                icon={<ShieldCheck className="w-8 h-8" />}
                title="Verified & Trusted"
                description="Work with professionals. Read authentic reviews and see vendor portfolios to make informed decisions."
            />
          </div>
        </div>
      </section>

      {/* Login Section */}
      <section id="login-section" className="py-20 sm:py-24 bg-secondary/50">
        <div className="container mx-auto px-4">
           <Card className="w-full max-w-md mx-auto shadow-2xl">
                <CardHeader className="text-center p-4 sm:p-6">
                    <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
                    <CardDescription>Enter your credentials to access your dashboard. <br /> Use admin@tradecraft.com to log in as admin.</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                    <form onSubmit={handleLogin}>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" name="password" type="password" required />
                            </div>
                        </div>
                        <div className="mt-6">
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Sign In
                            </Button>
                        </div>
                    </form>
                    <div className="mt-6 text-center text-sm">
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="underline">
                            Sign up
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
      </section>

       {/* Footer */}
       <footer className="py-8 bg-background border-t">
            <div className="container mx-auto px-4 text-center text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} TradeCraft. All Rights Reserved.</p>
            </div>
       </footer>
    </div>
  );
}
