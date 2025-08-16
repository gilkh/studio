'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import React from 'react';
import type { Booking } from '@/lib/types';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { format } from 'date-fns';

interface CalendarViewProps {
  bookings: Booking[];
}

export function CalendarView({ bookings }: CalendarViewProps) {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  
  const upcomingBookings = bookings.filter(b => b.date >= new Date()).sort((a,b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Booking Calendar</CardTitle>
            <CardDescription>View all your scheduled appointments.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              modifiers={{ booked: bookings.map(b => b.date) }}
              modifiersStyles={{
                booked: { 
                  border: '2px solid hsl(var(--primary))',
                  borderRadius: 'var(--radius)',
                }
              }}
            />
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
            <CardDescription>Your next scheduled events.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingBookings.length > 0 ? upcomingBookings.map(booking => (
                <div key={booking.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                    <div className="text-center w-16 flex-shrink-0">
                        <p className="font-bold text-lg text-primary">{format(booking.date, 'dd')}</p>
                        <p className="text-xs text-muted-foreground uppercase">{format(booking.date, 'MMM')}</p>
                    </div>
                    <div className="flex-grow">
                        <p className="font-semibold">{booking.title}</p>
                        <p className="text-sm text-muted-foreground">With: {booking.with}</p>
                    </div>
                     <Badge variant="outline">{booking.time}</Badge>
                </div>
              )) : (
                <p className="text-center text-muted-foreground py-4">No upcoming bookings.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
