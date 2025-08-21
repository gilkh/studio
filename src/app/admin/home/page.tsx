

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { generateVendorCode, getVendorCodes, resetAllPasswords, getAllUsersAndVendors, updateVendorTier, deleteVendorCode, updateUserStatus, deleteUser, getUpgradeRequests, getPlatformAnalytics, updateUpgradeRequestStatus, updateVendorVerification, getVendorInquiries, updateVendorInquiryStatus } from '@/lib/services';
import type { VendorCode, UserProfile, VendorProfile, UpgradeRequest, PlatformAnalytics, VendorInquiry } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { KeyRound, RefreshCcw, Copy, Loader2, User, Building, UserCog, Trash2, MoreVertical, Ban, CheckCircle, UserX, ShieldCheck, ShieldOff, Gem, Phone, CalendarCheck, Star, MessageSquare, PhoneOff, Hand } from 'lucide-react';
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
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { ResetPasswordDialog } from '@/components/reset-password-dialog';
import { AdminAnalyticsChart } from '@/components/admin-analytics-chart';
import { AdminStatCard } from '@/components/admin-stat-card';
import { MessagingPanel } from '@/components/messaging-panel';
import Link from 'next/link';


type DisplayUser = UserProfile & { role: 'client' | 'vendor', businessName?: string, accountTier?: VendorProfile['accountTier'], rating?: number, reviewCount?: number, verification?: VendorProfile['verification'] };

export default function AdminHomePage() {
  const [codes, setCodes] = useState<VendorCode[]>([]);
  const [users, setUsers] = useState<DisplayUser[]>([]);
  const [upgradeRequests, setUpgradeRequests] = useState<UpgradeRequest[]>([]);
  const [vendorInquiries, setVendorInquiries] = useState<VendorInquiry[]>([]);
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
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
      const [vendorCodes, allUsers, requests, platformAnalytics, inquiries] = await Promise.all([
        getVendorCodes(),
        getAllUsersAndVendors(),
        getUpgradeRequests(),
        getPlatformAnalytics(),
        getVendorInquiries(),
      ]);
      setCodes(vendorCodes);
      setUsers(allUsers as DisplayUser[]);
      setUpgradeRequests(requests.sort((a,b) => b.requestedAt.getTime() - a.requestedAt.getTime()));
      setVendorInquiries(inquiries.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()));
      setAnalytics(platformAnalytics);
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
  
  const handleVerificationChange = async (vendorId: string, verification: VendorProfile['verification']) => {
    try {
        await updateVendorVerification(vendorId, verification);
        setUsers(prev => prev.map(u => u.id === vendorId ? {...u, verification } : u));
        toast({ title: "Verification Status Updated", description: `Vendor status has been changed to ${verification}.` });
    } catch (error) {
        toast({ title: "Error", description: "Failed to update vendor verification status.", variant: "destructive" });
    }
  }

  const handleStatusChange = async (user: DisplayUser, status: 'active' | 'disabled') => {
    try {
        await updateUserStatus(user.id, user.role, status);
        setUsers(prev => prev.map(u => u.id === user.id ? {...u, status} : u));
        toast({ title: "Status Updated", description: `${user.firstName}'s account is now ${status}.` });
    } catch (error) {
        toast({ title: "Error", description: "Failed to update user status.", variant: "destructive" });
    }
  }

  const handleDeleteUser = async (user: DisplayUser) => {
    try {
        await deleteUser(user.id, user.role);
        setUsers(prev => prev.filter(u => u.id !== user.id));
        toast({ title: "User Deleted", description: `The user ${user.email} has been permanently deleted.` });
    } catch (error) {
        toast({ title: "Error", description: "Failed to delete the user.", variant: "destructive" });
    }
  }


  const handleDeleteCode = async (codeId: string) => {
    try {
        await deleteVendorCode(codeId);
        setCodes(prev => prev.filter(c => c.id !== codeId));
        toast({ title: "Code Deleted", description: "The vendor code has been removed." });
    } catch (error) {
        toast({ title: "Error", description: "Failed to delete the code.", variant: "destructive" });
    }
  }
  
  const handleUpgradeRequestStatusChange = async (requestId: string, newStatus: UpgradeRequest['status']) => {
    try {
      await updateUpgradeRequestStatus(requestId, newStatus);
      setUpgradeRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: newStatus } : req
      ));
      toast({
        title: 'Request Updated',
        description: `Request marked as ${newStatus}.`
      });
    } catch (error) {
      toast({ title: "Error", description: "Could not update the request status.", variant: "destructive" });
    }
  };

  const handleInquiryStatusChange = async (inquiryId: string, newStatus: VendorInquiry['status']) => {
    try {
      await updateVendorInquiryStatus(inquiryId, newStatus);
      setVendorInquiries(prev => prev.map(req => 
        req.id === inquiryId ? { ...req, status: newStatus } : req
      ));
      toast({
        title: 'Inquiry Updated',
        description: `Inquiry marked as ${newStatus}.`
      });
    } catch (error) {
      toast({ title: "Error", description: "Could not update the inquiry status.", variant: "destructive" });
    }
  };


  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Code copied to clipboard." });
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
          <CardDescription>Manage users, vendor registrations, and view platform analytics.</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-3 sm:flex sm:w-auto">
            <TabsTrigger value="overview">Platform Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
             <TabsTrigger value="inquiries">
                Inquiries
                {vendorInquiries.filter(r => r.status === 'pending').length > 0 && <Badge className="ml-2">{vendorInquiries.filter(r => r.status === 'pending').length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="upgrades">
                Upgrade Requests
                {upgradeRequests.filter(r => r.status === 'pending').length > 0 && <Badge className="ml-2">{upgradeRequests.filter(r => r.status === 'pending').length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="codes">Vendor Codes</TabsTrigger>
            <TabsTrigger value="danger">Danger Zone</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AdminStatCard title="Total Users" value={analytics?.totalUsers} icon={User} isLoading={isLoading} />
            <AdminStatCard title="Total Vendors" value={analytics?.totalVendors} icon={Building} isLoading={isLoading} />
            <AdminStatCard title="Total Bookings" value={analytics?.totalBookings} icon={CalendarCheck} isLoading={isLoading} />
          </div>
          <div className="mt-4">
            <AdminAnalyticsChart data={analytics?.userSignups} isLoading={isLoading} />
          </div>
        </TabsContent>

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
                                <TableHead>Role</TableHead>
                                <TableHead>Tier</TableHead>
                                <TableHead>Verification</TableHead>
                                <TableHead>Rating</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date Joined</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><div className="flex items-center gap-2"><Skeleton className="h-8 w-8 rounded-full" /><Skeleton className="h-6 w-32" /></div></TableCell>
                                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                </TableRow>
                                ))
                            ) : users.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            {user.role === 'client' ? <User className="h-5 w-5 text-muted-foreground" /> : <Building className="h-5 w-5 text-muted-foreground" />}
                                            <div className="flex flex-col">
                                                <Link href={`/admin/user/${user.id}`} className="font-medium hover:underline">
                                                    {user.role === 'vendor' ? user.businessName : `${user.firstName} ${user.lastName}`}
                                                </Link>
                                                 <span className="text-sm text-muted-foreground">{user.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === 'vendor' ? 'default' : 'secondary'}>{user.role}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        {user.role === 'vendor' && user.accountTier ? (
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
                                    <TableCell>
                                        {user.role === 'vendor' ? (
                                             <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                     <Button variant="outline" size="sm" className="capitalize">
                                                        {user.verification || 'none'}
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    {(['none', 'verified', 'trusted'] as const).map(status => (
                                                        <DropdownMenuItem key={status} onSelect={() => handleVerificationChange(user.id, status)}>
                                                            {status}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        ) : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        {user.role === 'vendor' ? (
                                             <div className="flex items-center gap-1.5">
                                                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                                <span className="font-medium">{(user.rating || 0).toFixed(1)}</span>
                                                <span className="text-xs text-muted-foreground">({user.reviewCount || 0})</span>
                                            </div>
                                        ) : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.status === 'active' ? 'default' : 'destructive'} className={user.status === 'active' ? 'bg-green-500' : ''}>
                                            {user.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{user.createdAt ? format(user.createdAt, 'PPP') : 'N/A'}</TableCell>
                                    <TableCell className="text-right">
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <ResetPasswordDialog user={user}>
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                        <UserCog className="mr-2 h-4 w-4" />
                                                        Reset Password
                                                    </DropdownMenuItem>
                                                </ResetPasswordDialog>
                                                {user.status === 'active' ? (
                                                    <DropdownMenuItem onClick={() => handleStatusChange(user, 'disabled')}>
                                                        <Ban className="mr-2 h-4 w-4" />
                                                        Disable Account
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem onClick={() => handleStatusChange(user, 'active')}>
                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                        Enable Account
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:text-red-700 focus:bg-red-50">
                                                            <UserX className="mr-2 h-4 w-4" />
                                                            Delete User
                                                        </DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This action will permanently delete the user <span className="font-semibold">{user.email}</span> and all associated data. This cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteUser(user)}>Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                     </Table>
                </CardContent>
            </Card>
        </TabsContent>
        
        <TabsContent value="messages" className="mt-4 h-[calc(100vh-20rem)]">
            <Card className="h-full">
                <CardContent className="p-0 h-full">
                    <MessagingPanel />
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="inquiries" className="mt-4">
             <Card>
                <CardHeader>
                    <CardTitle>New Vendor Inquiries</CardTitle>
                    <CardDescription>Potential vendors who have requested to join the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Applicant</TableHead>
                                <TableHead>Business Name</TableHead>
                                <TableHead>Contact Phone</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date Received</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                [...Array(2)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-6 w-36" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                                </TableRow>
                                ))
                            ) : vendorInquiries.length > 0 ? vendorInquiries.map(req => (
                                <TableRow key={req.id} className={req.status === 'contacted' ? 'bg-muted/50' : ''}>
                                    <TableCell className="font-medium">{req.firstName} {req.lastName}</TableCell>
                                    <TableCell>{req.businessName}</TableCell>
                                    <TableCell className="text-muted-foreground">{req.phone}</TableCell>
                                    <TableCell>
                                        <Badge variant={req.status === 'pending' ? 'default' : 'secondary'} className={req.status === 'pending' ? 'bg-amber-500' : ''}>
                                            {req.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{format(req.createdAt, 'PPP p')}</TableCell>
                                    <TableCell className="text-right">
                                      {req.status === 'pending' ? (
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => handleInquiryStatusChange(req.id, 'contacted')}
                                        >
                                            <Phone className="mr-2 h-4 w-4" />
                                            Mark as Contacted
                                        </Button>
                                      ) : (
                                        <Button 
                                            variant="secondary" 
                                            size="sm"
                                            onClick={() => handleInquiryStatusChange(req.id, 'pending')}
                                        >
                                            <PhoneOff className="mr-2 h-4 w-4" />
                                            Mark as Pending
                                        </Button>
                                      )}
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground h-24">No pending inquiries.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
             </Card>
        </TabsContent>

        <TabsContent value="upgrades" className="mt-4">
             <Card>
                <CardHeader>
                    <CardTitle>Account Upgrade Requests</CardTitle>
                    <CardDescription>Vendors interested in upgrading their account tier.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Vendor</TableHead>
                                <TableHead>Current Tier</TableHead>
                                <TableHead>Contact Phone</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date Requested</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                [...Array(2)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-6 w-36" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                                </TableRow>
                                ))
                            ) : upgradeRequests.length > 0 ? upgradeRequests.map(req => (
                                <TableRow key={req.id} className={req.status === 'contacted' ? 'bg-muted/50' : ''}>
                                    <TableCell className="font-medium">{req.vendorName}</TableCell>
                                    <TableCell><Badge variant="secondary" className="capitalize">{req.currentTier}</Badge></TableCell>
                                    <TableCell className="text-muted-foreground">{req.phone}</TableCell>
                                    <TableCell>
                                        <Badge variant={req.status === 'pending' ? 'default' : 'secondary'} className={req.status === 'pending' ? 'bg-amber-500' : ''}>
                                            {req.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{format(req.requestedAt, 'PPP p')}</TableCell>
                                    <TableCell className="text-right">
                                      {req.status === 'pending' ? (
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => handleUpgradeRequestStatusChange(req.id, 'contacted')}
                                        >
                                            <Phone className="mr-2 h-4 w-4" />
                                            Mark as Contacted
                                        </Button>
                                      ) : (
                                        <Button 
                                            variant="secondary" 
                                            size="sm"
                                            onClick={() => handleUpgradeRequestStatusChange(req.id, 'pending')}
                                        >
                                            <PhoneOff className="mr-2 h-4 w-4" />
                                            Mark as Pending
                                        </Button>
                                      )}
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground h-24">No pending upgrade requests.</TableCell>
                                </TableRow>
                            )}
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
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {isLoading ? (
                        [...Array(3)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                             <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                        </TableRow>
                        ))
                    ) : codes.map(code => (
                        <TableRow key={code.id} className={code.isUsed ? 'bg-muted/50' : ''}>
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
                        <TableCell>{code.createdAt ? format(code.createdAt, 'PPP p') : 'N/A'}</TableCell>
                        <TableCell>{code.usedBy || 'N/A'}</TableCell>
                        <TableCell>{code.usedAt ? format(code.usedAt, 'PPP p') : 'N/A'}</TableCell>
                        <TableCell className="text-right">
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" disabled={code.isUsed}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action will permanently delete the vendor code <span className="font-mono font-semibold">{code.code}</span>. This cannot be undone.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteCode(code.id)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </TableCell>
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
