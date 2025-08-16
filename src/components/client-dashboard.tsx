'use client';

import { services } from '@/lib/placeholder-data';
import { ServiceCard } from './service-card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function ClientDashboard() {
  const categories = ['All Categories', ...Array.from(new Set(services.map((s) => s.category)))];

  return (
    <div className="space-y-8">
      <Card className="shadow-lg border-2 border-primary/20">
        <CardHeader>
            <h2 className="text-2xl font-bold tracking-tight text-center">Find the Perfect Service for Your Event</h2>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search for 'Catering', 'Photography', etc." className="pl-12 h-12 text-lg" />
            </div>
             <Select defaultValue="All Categories">
              <SelectTrigger className="w-full sm:w-[220px] h-12 text-lg">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="lg" className="h-12 text-lg">Search</Button>
          </div>
        </CardContent>
      </Card>
      

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} role="client" />
        ))}
      </div>
    </div>
  );
}
