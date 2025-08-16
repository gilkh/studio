
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
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MessageSquare, User, LogOut, Menu, Search } from 'lucide-react';
import { MessagingPanel } from './messaging-panel';
import Link from 'next/link';
import { Input } from './ui/input';
import { ClientSidebar } from './client-sidebar';
import { VendorSidebar } from './vendor-sidebar';
import { usePathname } from 'next/navigation';

export function AppHeader() {
  const loggedIn = true; // Mock state
  const pathname = usePathname();
  const isVendor = pathname.startsWith('/vendor');

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <div className="lg:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 flex flex-col">
                   { isVendor ? <VendorSidebar /> : <ClientSidebar /> }
                </SheetContent>
            </Sheet>
        </div>

        <div className="w-full flex-1">
             <form>
                <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search services..."
                    className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                />
                </div>
            </form>
        </div>

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
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>My Bookings</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
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
    </header>
  );
}
