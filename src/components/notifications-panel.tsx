
'use client';

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import type { AppNotification } from "@/lib/types";
import { getNotifications } from "@/lib/services";
import { Bell, Check, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";
import { ScrollArea } from "./ui/scroll-area";

const iconMap = {
    "booking": <ShoppingCart className="h-5 w-5 text-primary" />,
    "quote": <User className="h-5 w-5 text-blue-500" />,
    "default": <Bell className="h-5 w-5 text-muted-foreground" />
}

export function NotificationsPanel() {
    const { userId } = useAuth();
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;

        setIsLoading(true);
        const unsubscribe = getNotifications(userId, (notifs) => {
            setNotifications(notifs);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [userId]);

    return (
        <ScrollArea className="h-[400px]">
             <div className="flex flex-col">
                {isLoading ? (
                    <div className="p-4 space-y-4">
                        <Skeleton className="h-14 w-full" />
                        <Skeleton className="h-14 w-full" />
                        <Skeleton className="h-14 w-full" />
                    </div>
                ) : notifications.length > 0 ? (
                    notifications.map(notification => (
                         <div key={notification.id} className={cn("flex items-start gap-4 p-4 border-b", !notification.read && "bg-primary/5")}>
                            <div className="mt-1">
                                {notification.link?.includes('booking') ? iconMap.booking : notification.link?.includes('request') ? iconMap.quote : iconMap.default}
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">{notification.message}</p>
                                <p className="text-sm text-muted-foreground">
                                    {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                                </p>
                                {notification.link && (
                                    <Link href={notification.link} className="text-xs text-blue-600 hover:underline">
                                        View Details
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-muted-foreground p-8">You have no notifications yet.</p>
                )}
             </div>
        </ScrollArea>
    );
}
