import { ServiceCard } from '@/components/service-card';
import { OfferCard } from '@/components/offer-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { services, offers } from '@/lib/placeholder-data';
import { PlusCircle } from 'lucide-react';
import { ManageServiceDialog } from '@/components/manage-service-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


export default function ManageServicesPage() {
    const myServices = services.slice(0, 2);
    const myOffers = offers.slice(0, 2);
  return (
    <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
            <div>
                <CardTitle>Manage Your Services & Offers</CardTitle>
                <CardDescription>Add, edit, or remove your services and special offers.</CardDescription>
            </div>
            <ManageServiceDialog>
                <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New
                </Button>
            </ManageServiceDialog>
            </div>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="offers">
                <TabsList className="mb-4">
                    <TabsTrigger value="offers">Offers</TabsTrigger>
                    <TabsTrigger value="services">Services</TabsTrigger>
                </TabsList>
                <TabsContent value="offers">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myOffers.map((offer) => (
                            <OfferCard key={offer.id} offer={offer} role="vendor" />
                        ))}
                    </div>
                </TabsContent>
                <TabsContent value="services">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myServices.map((service) => (
                            <ServiceCard key={service.id} service={service} role="vendor" />
                        ))}
                        <Card className="flex items-center justify-center border-dashed border-2 h-full min-h-96">
                            <ManageServiceDialog>
                                <Button variant="outline" className="text-lg p-8">
                                    <PlusCircle className="mr-4 h-8 w-8" />
                                    Add New Service/Offer
                                </Button>
                            </ManageServiceDialog>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </CardContent>
    </Card>
  );
}
