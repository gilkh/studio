
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, Calendar, MessageSquare, Settings, User, Compass, PenTool } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from './logo';
import { Button } from './ui/button';

const clientLinks = [
  { href: '/client/home', label: 'Home', icon: Home },
  { href: '/client/explore', label: 'Explore Services', icon: Compass },
  { href: '/client/bookings', label: 'My Bookings', icon: Calendar },
  { href: '/client/messages', label: 'Messages', icon: MessageSquare },
  { href: '/client/event-planner', label: 'Event Planner', icon: PenTool },
];

const bottomLinks = [
  { href: '/client/settings', label: 'Settings', icon: Settings },
  { href: '/client/profile', label: 'Profile', icon: User },
];

export function ClientSidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden border-r bg-card lg:block w-64">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/client/home" className="flex items-center gap-2 font-semibold">
            <Logo className="h-6 w-6 text-primary" />
            <span className="">EventEase</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-4 text-sm font-medium">
            {clientLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                  pathname === href && 'bg-muted text-primary'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-4">
            <nav className="grid items-start px-4 text-sm font-medium">
            {bottomLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                  pathname === href && 'bg-muted text-primary'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
