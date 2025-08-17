

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { generateVendorCode, getVendorCodes, resetAllPasswords, getAllUsersAndVendors, updateVendorTier } from '@/lib/services';
import type { VendorCode, UserProfile, VendorProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { KeyRound, RefreshCcw, Copy, Loader2, User, Building, UserCog } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type DisplayUser = UserProfile & { role: string, businessName?: string, accountTier?: VendorProfile['accountTier'] };

export default function AdminHomePage() {
  const [codes, setCodes] = useState<VendorCode[]>([]);
  const [users, setUsers] = useState<DisplayUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [vendorCodes, allUsers] = await Promise.all([
        getVendorCodes(),
        getAllUsersAndVendors()
      ]);
      setCodes(vendorCodes);
      setUsers(allUsers as DisplayUser[]);
    } catch (error) {
      toast({ title: "Error", description: "Could not fetch admin data.", variant: "destructive" });
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

  const handleTierChange = async (vendorId: string, tier: VendorProfile['accountTier']) => {
    try {
        await updateVendorTier(vendorId, tier);
        setUsers(prev => prev.map(u => u.id === vendorId ? {...u, accountTier: tier} : u));
        toast({ title: "Tier Updated", description: `Vendor tier has been changed to ${tier}.` });
    } catch (error) {
        toast({ title: "Error", description: "Failed to update vendor tier.", variant: "destructive" });
    }
  }

  const handleResetPassword = (email: string) => {
    toast({ title: "Password Reset Simulated", description: `A password reset email would be sent to ${email}.` });
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
          <CardDescription>Manage users, vendor registrations, and perform administrative tasks.</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="users">
        <TabsList>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="codes">Vendor Codes</TabsTrigger>
            <TabsTrigger value="danger">Danger Zone</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="mt-4">
            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>View and manage all registered clients and vendors.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Tier</TableHead>
                                <TableHead>Date Joined</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><div className="flex items-center gap-2"><Skeleton className="h-8 w-8 rounded-full" /><Skeleton className="h-6 w-32" /></div></TableCell>
                                    <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                                </TableRow>
                                ))
                            ) : users.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            {user.role === 'client' ? <User className="h-5 w-5 text-muted-foreground" /> : <Building className="h-5 w-5 text-muted-foreground" />}
                                            <span className="font-medium">{user.role === 'vendor' ? user.businessName : `${user.firstName} ${user.lastName}`}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === 'vendor' ? 'default' : 'secondary'}>{user.role}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        {user.role === 'vendor' ? (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="outline" size="sm" className="capitalize">
                                                        {user.accountTier}
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    {(['free', 'vip1', 'vip2', 'vip3'] as const).map(tier => (
                                                        <DropdownMenuItem key={tier} onSelect={() => handleTierChange(user.id, tier)}>
                                                            {tier}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        ) : 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{format(new Date(user.createdAt), 'PPP')}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={() => handleResetPassword(user.email)}>
                                            <UserCog className="mr-2 h-4 w-4" />
                                            Reset Password
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                     </Table>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="codes" className="mt-4">
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
                         <TableHead>Date Used</TableHead>
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
                            <TableCell><Skeleton className="h-6 w-40" /></TableCell>
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
                        <TableCell>{code.usedAt ? format(code.usedAt, 'PPP p') : 'N/A'}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </TabsContent>
        
        <TabsContent value="danger" className="mt-4">
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
                                This action is for demonstration only. In a real application, this would trigger a password reset email for ALL users. This cannot be undone.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={resetAllPasswords}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
