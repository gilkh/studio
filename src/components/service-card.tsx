import type { Service } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="p-0 relative">
        <Image
          src={service.image}
          alt={service.title}
          width={600}
          height={400}
          className="w-full h-48 object-cover"
          data-ai-hint="service design"
        />
        <Badge className="absolute top-3 right-3" variant="secondary">
          {service.category}
        </Badge>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={service.vendorAvatar} alt={service.vendorName} />
            <AvatarFallback>{service.vendorName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm">{service.vendorName}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span>{service.rating.toFixed(1)}</span>
              <span>({service.reviewCount} reviews)</span>
            </div>
          </div>
        </div>
        <h3 className="text-lg font-semibold leading-tight mb-2">{service.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div>
          <p className="text-xs text-muted-foreground">Starting from</p>
          <p className="text-xl font-bold text-primary">${service.price}</p>
        </div>
        {role === 'client' ? (
          <QuoteRequestDialog service={service}>
            <Button>Request Quote</Button>
          </QuoteRequestDialog>
        ) : (
          <ManageServiceDialog service={service}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </ManageServiceDialog>
        )}
      </CardFooter>
    </Card>
  );
}
