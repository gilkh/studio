import type { Service } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Edit } from 'lucide-react';
import Image from 'next/image';
import { QuoteRequestDialog } from './quote-request-dialog';
import { ManageServiceDialog } from './manage-service-dialog';

interface ServiceCardProps {
  service: Service;
  role: 'client' | 'vendor';
}

export function ServiceCard({ service, role }: ServiceCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 rounded-xl group">
      <CardHeader className="p-0 relative overflow-hidden">
        <Image
          src={service.image}
          alt={service.title}
          width={600}
          height={400}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
          data-ai-hint="event service"
        />
        <Badge className="absolute top-3 right-3" variant="secondary">
          {service.category}
        </Badge>
      </CardHeader>
      <CardContent className="p-4 flex-grow flex flex-col">
        <h3 className="text-xl font-bold leading-tight mb-2 flex-grow">{service.title}</h3>
        <div className="flex items-center gap-3 mt-auto pt-4">
          <Avatar className="h-10 w-10 border-2 border-background ring-2 ring-primary">
            <AvatarImage src={service.vendorAvatar} alt={service.vendorName} />
            <AvatarFallback>{service.vendorName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm">{service.vendorName}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-bold">{service.rating.toFixed(1)}</span>
              <span>({service.reviewCount} reviews)</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-2 flex justify-between items-center bg-muted/50">
        <div>
          <p className="text-xs text-muted-foreground">From</p>
          <p className="text-2xl font-bold text-primary">${service.price}</p>
        </div>
        {role === 'client' ? (
          <QuoteRequestDialog service={service}>
            <Button size="lg">Get a Quote</Button>
          </QuoteRequestDialog>
        ) : (
          <ManageServiceDialog service={service}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit Service
            </Button>
          </ManageServiceDialog>
        )}
      </CardFooter>
    </Card>
  );
}
