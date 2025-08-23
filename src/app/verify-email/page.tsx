'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { verifyUserEmail } from '@/lib/services';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useState } from 'react';

function VerifyEmailStatus() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided. The link may be invalid.');
      return;
    }

    async function verify() {
      try {
        await verifyUserEmail(token as string);
        setStatus('success');
        setMessage('Your email has been successfully verified. You can now log in.');
        toast({
          title: 'Email Verified!',
          description: 'You can now log in to your account.',
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        setStatus('error');
        setMessage(errorMessage);
        toast({
          title: 'Verification Failed',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    }
    verify();
  }, [token, toast]);

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {status === 'loading' && <Loader2 className="h-12 w-12 animate-spin text-primary" />}
      {status === 'success' && <CheckCircle className="h-12 w-12 text-green-500" />}
      {status === 'error' && <XCircle className="h-12 w-12 text-destructive" />}
      <p className="text-center text-muted-foreground">{message}</p>
      {status !== 'loading' && (
        <Button asChild>
          <Link href="/login">Proceed to Login</Link>
        </Button>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
          <CardDescription>
            We are confirming your email address. Please wait a moment.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <Suspense fallback={<Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />}>
              <VerifyEmailStatus />
            </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
