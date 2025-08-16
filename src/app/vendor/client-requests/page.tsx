
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { quoteRequests } from '@/lib/placeholder-data';
import { Check, X } from 'lucide-react';


export default function ClientRequestsPage() {
  return (
     <Card>
        <CardHeader>
            <CardTitle>Incoming Quote Requests</CardTitle>
            <CardDescription>Review and respond to new client inquiries.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {quoteRequests.map((request) => (
                <TableRow key={request.id}>
                    <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                        <AvatarImage src={request.clientAvatar} alt={request.clientName} />
                        <AvatarFallback>{request.clientName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {request.clientName}
                    </div>
                    </TableCell>
                    <TableCell>{request.serviceTitle}</TableCell>
                    <TableCell className="max-w-sm truncate">{request.message}</TableCell>
                    <TableCell>
                    <Badge
                        variant={
                        request.status === 'pending'
                            ? 'secondary'
                            : request.status === 'approved'
                            ? 'default'
                            : 'destructive'
                        }
                        className={request.status === 'approved' ? 'bg-green-500 hover:bg-green-600' : ''}
                    >
                        {request.status}
                    </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                    {request.status === 'pending' && (
                        <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="icon" className="h-8 w-8 text-green-600 border-green-600 hover:bg-green-100 hover:text-green-700">
                            <Check className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8 text-red-600 border-red-600 hover:bg-red-100 hover:text-red-700">
                            <X className="h-4 w-4" />
                        </Button>
                        </div>
                    )}
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </CardContent>
    </Card>
  );
}
