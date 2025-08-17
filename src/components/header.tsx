

'use client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MessageSquare, User, LogOut, Menu, Home, Compass, Calendar, PenTool, Briefcase, Users, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from './logo';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import { useEffect, useState } from 'react';
import { getVendorQuoteRequests, getUserProfile, getVendorProfile, getChatsForUser } from '@/lib/services';
import { useAuth, logout } from '@/hooks/use-auth';
import type { UserProfile, VendorProfile, Chat } from '@/lib/types';


const clientLinks = [
  { href: '/client/home', label: 'Home', icon: Home },
  { href: '/client/explore', label: 'Explore', icon: Compass },
  { href: '/client/bookings', label: 'Bookings', icon: Calendar },
  { href: '/client/event-planner', label: 'Planner', icon: PenTool },
  { href: '/client/messages', label: 'Messages', icon: MessageSquare, 'data-testid': 'messages-link-desktop' },
];

const vendorLinks = [
  { href: '/vendor/home', label: 'Home', icon: Home },
  { href: '/vendor/manage-services', label: 'Services', icon: Briefcase },
  { href: '/vendor/client-requests', label: 'Requests', icon: Users, 'data-testid': 'requests-link-desktop' },
  { href: '/vendor/bookings', label: 'Bookings', icon: Calendar },
  { href: '/vendor/messages', label: 'Messages', icon: MessageSquare, 'data-testid': 'messages-link-desktop' },
];


export function AppHeader() {
  const { userId, role, isLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [pendingRequests, setPendingRequests] = useState(0);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  
  const isVendor = role === 'vendor';
  const links = isVendor ? vendorLinks : clientLinks;

  useEffect(() => {
    async function fetchData() {
        if (!userId) return;

        if (isVendor) {
            getVendorQuoteRequests(userId).then(requests => {
                setPendingRequests(requests.filter(q => q.status === 'pending').length);
            });
            getVendorProfile(userId).then(setVendorProfile);
        }
        
        getUserProfile(userId).then(setUserProfile);
    }
    fetchData();
  }, [userId, isVendor]);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = getChatsForUser(userId, (chats: Chat[]) => {
      const anyUnread = chats.some(chat => (chat.unreadCount?.[userId] || 0) > 0);
      setHasUnreadMessages(anyUnread);
    });

    return () => unsubscribe();
  }, [userId]);


  const handleLogout = () => {
    logout();
    router.push('/login');
  };
  
  const getInitials = () => {
    if (isVendor && vendorProfile?.businessName) {
        return vendorProfile.businessName.substring(0, 2);
    }
    if (userProfile?.firstName && userProfile?.lastName) {
        return `${userProfile.firstName.charAt(0)}${userProfile.lastName.charAt(0)}`;
    }
    return 'U';
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-6">
        <Link href={isVendor ? "/vendor/home" : "/client/home"} className="flex items-center gap-2 font-semibold">
            <Logo className="h-6 w-6 text-primary" />
            <span className="hidden sm:inline-block">TradeCraft</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-4">
            {links.map(({ href, label, ...props }) => (
            <Link
                key={href}
                href={href}
                className={cn(
                'flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary',
                pathname === href ? 'text-primary' : 'text-muted-foreground'
                )}
                {...props}
            >
                {label}
                 {label === 'Requests' && pendingRequests > 0 && (
                    <Badge className="h-5 w-5 shrink-0 justify-center rounded-full p-1 text-xs">
                        {pendingRequests}
                    </Badge>
                )}
            </Link>
            ))}
        </nav>
      </div>

      <div className="flex w-full items-center justify-end gap-4 md:ml-auto md:gap-2 lg:gap-4">
        {!isLoading && userId ? (
        <>
            <Link href={isVendor ? "/vendor/messages" : "/client/messages"}>
                <Button variant="ghost" size="icon" aria-label="Messages" className="relative">
                    <MessageSquare className="h-5 w-5" />
                    {hasUnreadMessages && (
                      <span className="absolute top-0 right-0 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                      </span>
                    )}
                </Button>
            </Link>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                    <AvatarImage src={`https://i.pravatar.cc/150?u=${userId}`} alt="User" />
                    <AvatarFallback>
                        {getInitials()}
                    </AvatarFallback>
                    </Avatar>
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{isVendor ? vendorProfile?.businessName : `${userProfile?.firstName} ${userProfile?.lastName}`}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                        {userProfile?.email}
                    </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href={isVendor ? "/vendor/profile" : "/client/profile"}>Profile</Link>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                    <Link href={isVendor ? "/vendor/bookings" : "/client/bookings"}>My Bookings</Link>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                    <Link href={isVendor ? "/vendor/settings" : "/client/settings"}>Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                 <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
        ) : (
            <Link href="/login">
                <Button>Sign In</Button>
            </Link>
        )}
      </div>
    </header>
  );
}
