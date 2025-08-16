
'use client';
import { CalendarView } from '@/components/calendar-view';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getBookingsForVendor } from '@/lib/services';
import type { Booking } from '@/lib/types';
import { useEffect, useState } from 'react';

const MOCK_VENDOR_ID = 'vendor123';

export default function VendorBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadBookings() {
            setIsLoading(true);
            try {
                const vendorBookings = await getBookingsForVendor(MOCK_VENDOR_ID);
                setBookings(vendorBookings);
            } catch(error) {
                console.error("Failed to load bookings", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadBookings();
    }, []);

  return (
    <div>
        <Card className="mb-8">
            <CardHeader>
                <CardTitle>My Bookings</CardTitle>
                <CardDescription>An overview of all your scheduled events and appointments.</CardDescription>
            </CardHeader>
        </Card>
        <CalendarView bookings={bookings} isLoading={isLoading} />
    </div>
  )
}
