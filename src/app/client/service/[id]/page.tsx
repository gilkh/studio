
import { getServicesAndOffers } from '@/lib/services';
import type { Service } from '@/lib/types';
import { ServiceDetailView } from '@/components/service-detail-view';


// THIS IS THE MAIN SERVER COMPONENT FOR THE PAGE
export default async function ServiceDetailPage({ params }: { params: { id: string } }) {
  // Data fetching happens on the server
  const allItems = await getServicesAndOffers();
  const service = allItems.find((item) => item.id === params.id && item.type === 'service') as Service | undefined;
  
  // The interactive UI is in a separate client component
  return <ServiceDetailView service={service ?? null} id={params.id} />;
}

// This function tells Next.js which pages to pre-render at build time.
// It runs only on the server.
export async function generateStaticParams() {
  const allItems = await getServicesAndOffers();
  const services = allItems.filter(item => item.type === 'service');
  return services.map((service) => ({
    id: service.id,
  }));
}
