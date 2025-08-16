'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { bookings, quoteRequests, services } from '@/lib/placeholder-data';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { PlusCircle, Check, X } from 'lucide-react';
import { ServiceCard } from './service-card';
import { CalendarView } from './calendar-view';
import { ManageServiceDialog } from './manage-service-dialog';

export function VendorDashboard() {
  const myServices = services.slice(0, 2); // Assume first two services belong to this vendor

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendor Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Manage your services, requests, and bookings.</p>
        </div>
      </div>

      <Tabs defaultValue="services" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="services">My Services</TabsTrigger>
          <TabsTrigger value="requests">
            Quote Requests <Badge className="ml-2">{quoteRequests.filter(q => q.status === 'pending').length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="calendar">Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                    <CardTitle>Your Service Offerings</CardTitle>
                    <CardDescription>Add, edit, or remove your services.</CardDescription>
                </div>
                <ManageServiceDialog>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Service
                  </Button>
                </ManageServiceDialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myServices.map((service) => (
                  <ServiceCard key={service.id} service={service} role="vendor" />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
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
        </TabsContent>
        
        <TabsContent value="calendar" className="mt-6">
            <CalendarView bookings={bookings} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
