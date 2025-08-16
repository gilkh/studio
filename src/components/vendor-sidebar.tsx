
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, Calendar, MessageSquare, Settings, User, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from './logo';
import { Badge } from './ui/badge';
import { quoteRequests } from '@/lib/placeholder-data';

const vendorLinks = [
  { href: '/vendor/home', label: 'Home', icon: Home },
  { href: '/vendor/manage-services', label: 'Manage Services', icon: Briefcase },
  { href: '/vendor/client-requests', label: 'Client Requests', icon: Users, badge: quoteRequests.filter(q => q.status === 'pending').length },
  { href: '/vendor/bookings', label: 'Bookings', icon: Calendar },
  { href: '/vendor/messages', label: 'Messages', icon: MessageSquare },
];

const bottomLinks = [
  { href: '/vendor/settings', label: 'Settings', icon: Settings },
  { href: '/vendor/profile', label: 'Profile', icon: User },
];

export function VendorSidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden border-r bg-card lg:block w-64">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/vendor/home" className="flex items-center gap-2 font-semibold">
            <Logo className="h-6 w-6 text-primary" />
            <span className="">EventEase</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-4 text-sm font-medium">
            {vendorLinks.map(({ href, label, icon: Icon, badge }) => (
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
                {badge && badge > 0 && (
                    <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                        {badge}
                    </Badge>
                )}
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
