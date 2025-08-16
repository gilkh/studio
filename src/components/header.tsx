
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
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { MessageSquare, User, LogOut, Menu, Home, Compass, Calendar, PenTool, Briefcase, Users, Settings } from 'lucide-react';
import { MessagingPanel } from './messaging-panel';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './logo';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import { quoteRequests } from '@/lib/placeholder-data';


const clientLinks = [
  { href: '/client/home', label: 'Home', icon: Home },
  { href: '/client/explore', label: 'Explore', icon: Compass },
  { href: '/client/bookings', label: 'Bookings', icon: Calendar },
  { href: '/client/messages', label: 'Messages', icon: MessageSquare },
  { href: '/client/event-planner', label: 'Planner', icon: PenTool },
];

const vendorLinks = [
  { href: '/vendor/home', label: 'Home', icon: Home },
  { href: '/vendor/manage-services', label: 'Services', icon: Briefcase },
  { href: '/vendor/client-requests', label: 'Requests', icon: Users, badge: quoteRequests.filter(q => q.status === 'pending').length },
  { href: '/vendor/bookings', label: 'Bookings', icon: Calendar },
  { href: '/vendor/messages', label: 'Messages', icon: MessageSquare },
];


export function AppHeader() {
  const loggedIn = true; // Mock state
  const pathname = usePathname();
  const isVendor = pathname.startsWith('/vendor');
  const links = isVendor ? vendorLinks : clientLinks;

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-6">
        <Link href={isVendor ? "/vendor/home" : "/client/home"} className="flex items-center gap-2 font-semibold">
            <Logo className="h-6 w-6 text-primary" />
            <span className="hidden sm:inline-block">EventEase</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-4">
            {links.map(({ href, label, badge }) => (
            <Link
                key={href}
                href={href}
                className={cn(
                'flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary',
                pathname === href ? 'text-primary' : 'text-muted-foreground'
                )}
            >
                {label}
                 {badge && badge > 0 && (
                    <Badge className="h-5 w-5 shrink-0 justify-center rounded-full p-1 text-xs">
                        {badge}
                    </Badge>
                )}
            </Link>
            ))}
        </nav>
      </div>

      <div className="flex w-full items-center justify-end gap-4 md:ml-auto md:gap-2 lg:gap-4">
        {loggedIn ? (
        <>
            <Sheet>
                <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Messages" className="relative">
                    <MessageSquare className="h-5 w-5" />
                    <span className="absolute top-0 right-0 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                </Button>
                </SheetTrigger>
                <SheetContent className="w-full max-w-md p-0">
                  <SheetTitle className="sr-only">Messages</SheetTitle>
                  <MessagingPanel />
                </SheetContent>
            </Sheet>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                    <AvatarImage src="https://i.pravatar.cc/150?u=profile" alt="User" />
                    <AvatarFallback>
                        <User className="h-5 w-5" />
                    </AvatarFallback>
                    </Avatar>
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">John Doe</p>
                    <p className="text-xs leading-none text-muted-foreground">
                        john.doe@example.com
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
                 <Link href="/login">
                    <DropdownMenuItem>
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                    </DropdownMenuItem>
                </Link>
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
