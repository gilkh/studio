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
import { MessageSquare, User, LogIn, UserPlus } from 'lucide-react';
import { Logo } from './logo';
import { MessagingPanel } from './messaging-panel';

export function AppHeader() {
  const loggedIn = false; // Mock state

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground tracking-tight">EventEase</h1>
        </div>
        <div className="flex items-center gap-2">
           {loggedIn ? (
            <>
                <Sheet>
                    <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Messages">
                        <MessageSquare className="h-5 w-5" />
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
                    <DropdownMenuItem>Log out</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </>
           ) : (
             <>
                <Button variant="ghost">
                    <LogIn className="mr-2" />
                    Sign In
                </Button>
                <Button>
                    <UserPlus className="mr-2" />
                    Sign Up
                </Button>
             </>
           )}
        </div>
      </div>
    </header>
  );
}
