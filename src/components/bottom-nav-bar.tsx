
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Calendar, MessageSquare, PenTool, Briefcase, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import { useEffect, useState } from 'react';
import { getVendorQuoteRequests } from '@/lib/services';
import { useAuth } from '@/hooks/use-auth';

const clientLinks = [
  { href: '/client/home', label: 'Home', icon: Home },
  { href: '/client/explore', label: 'Explore', icon: Compass },
  { href: '/client/bookings', label: 'Bookings', icon: Calendar },
  { href: '/client/event-planner', label: 'Planner', icon: PenTool },
  { href: '/client/messages', label: 'Messages', icon: MessageSquare },
];

const vendorLinks = [
  { href: '/vendor/home', label: 'Home', icon: Home },
  { href: '/vendor/manage-services', label: 'Services', icon: Briefcase },
  { href: '/vendor/client-requests', label: 'Requests', icon: Users, 'data-testid': 'requests-link' },
  { href: '/vendor/bookings', label: 'Bookings', icon: Calendar },
  { href: '/vendor/messages', label: 'Messages', icon: MessageSquare },
];


export function BottomNavBar() {
  const pathname = usePathname();
  const { userId, role } = useAuth();
  const [pendingRequests, setPendingRequests] = useState(0);
  const isVendor = role === 'vendor';
  
  useEffect(() => {
    if (isVendor && userId) {
      getVendorQuoteRequests(userId).then(requests => {
        setPendingRequests(requests.filter(q => q.status === 'pending').length);
      })
    }
  }, [isVendor, userId]);

  const links = isVendor ? vendorLinks : clientLinks;

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t z-50 lg:hidden">
      <div className="flex justify-around items-center h-full">
        {links.map(({ href, label, icon: Icon, ...props }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center justify-center w-full h-full gap-1 text-xs transition-colors hover:text-primary',
              pathname === href ? 'text-primary' : 'text-muted-foreground'
            )}
            {...props}
          >
            <div className="relative">
                <Icon className="h-6 w-6" />
                {label === 'Requests' && pendingRequests > 0 && (
                    <Badge className="absolute -top-1 -right-2 h-4 w-4 shrink-0 justify-center rounded-full p-1 text-[10px]">
                        {pendingRequests}
                    </Badge>
                )}
                 {label === 'Messages' && (
                    <span className="absolute top-0 right-0 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                 )}
            </div>
            <span className="text-[10px]">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
