
import { getServiceOrOfferById } from '@/lib/services';
import type { Offer } from '@/lib/types';
import { OfferDetailView } from '@/components/offer-detail-view';
import { getServicesAndOffers } from '@/lib/services';

// THIS IS THE MAIN SERVER COMPONENT FOR THE PAGE
export default async function OfferDetailPage({ params }: { params: { id: string } }) {
  // Data fetching happens on the server
  const offer = (await getServiceOrOfferById(params.id)) as Offer | null;
  
  // The interactive UI is in a separate client component
  return <OfferDetailView offer={offer} id={params.id} />;
}


// This function tells Next.js which pages to pre-render at build time.
// It runs only on the server.
export async function generateStaticParams() {
  const allItems = await getServicesAndOffers();
  const offers = allItems.filter(item => item.type === 'offer');
  return offers.map((offer) => ({
    id: offer.id,
  }));
}
