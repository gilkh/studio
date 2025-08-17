
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { generateVendorCode, getVendorCodes, resetAllPasswords } from '@/lib/services';
import type { VendorCode } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { KeyRound, RefreshCcw, Copy, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function AdminHomePage() {
  const [codes, setCodes] = useState<VendorCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    setIsLoading(true);
    try {
      const vendorCodes = await getVendorCodes();
      setCodes(vendorCodes);
    } catch (error) {
      toast({ title: "Error", description: "Could not fetch vendor codes.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateCode = async () => {
    setIsGenerating(true);
    try {
      const newCode = await generateVendorCode();
      setCodes(prev => [newCode, ...prev]);
      toast({ title: "Code Generated", description: `New code ${newCode.code} has been created.` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate new code.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResetPasswords = async () => {
    setIsResetting(true);
    try {
        const result = await resetAllPasswords();
        if (result.success) {
            toast({ title: "Password Reset Triggered", description: result.message });
        }
    } catch (error) {
        toast({ title: "Error", description: "Failed to reset passwords.", variant: "destructive" });
    } finally {
        setIsResetting(false);
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Code copied to clipboard." });
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
          <CardDescription>Manage vendor registrations and perform administrative tasks.</CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Vendor Registration Codes</CardTitle>
              <CardDescription>Generate and manage codes for new vendors.</CardDescription>
            </div>
            <Button onClick={handleGenerateCode} disabled={isGenerating}>
              {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
              Generate New Code
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Created</TableHead>
                <TableHead>Used By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                  </TableRow>
                ))
              ) : codes.map(code => (
                <TableRow key={code.id}>
                  <TableCell className="font-mono font-semibold">
                    <div className="flex items-center gap-2">
                        {code.code}
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(code.code)}>
                            <Copy className="h-3 w-3" />
                        </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={code.isUsed ? 'secondary' : 'default'}>
                      {code.isUsed ? 'Used' : 'Available'}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(code.createdAt, 'PPP p')}</TableCell>
                  <TableCell>{code.usedBy || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-destructive">
          <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>This is a placeholder for sensitive admin actions.</CardDescription>
          </CardHeader>
          <CardContent>
              <AlertDialog>
                  <AlertDialogTrigger asChild>
                      <Button variant="destructive" disabled={isResetting}>
                         {isResetting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
                         Reset All Passwords (Simulation)
                      </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                      <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                          This action is for demonstration only. In a real application, this would trigger a password reset email for all users. This cannot be undone.
                      </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleResetPasswords}>Continue</AlertDialogAction>
                      </AlertDialogFooter>
                  </AlertDialogContent>
              </AlertDialog>
          </CardContent>
      </Card>

    </div>
  );
}
