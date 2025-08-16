
import { CalendarView } from '@/components/calendar-view';
import { bookings } from '@/lib/placeholder-data';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ClientBookingsPage() {
  return (
    <div>
        <Card className="mb-8">
            <CardHeader>
                <CardTitle>My Bookings</CardTitle>
                <CardDescription>An overview of all your scheduled events and appointments.</CardDescription>
            </CardHeader>
        </Card>
        <CalendarView bookings={bookings} />
    </div>
  )
}
