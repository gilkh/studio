
export type ServiceType = 'service' | 'offer';

export interface BaseService {
  id: string;
  type: ServiceType;
  vendorId: string;
  vendorName: string;
  vendorAvatar: string;
  title: string;
  description: string;
  category: string;
  rating: number;
  reviewCount: number;
  image: string;
}

export interface Service extends BaseService {
  type: 'service';
  price?: never; // Services don't have a fixed price, they require a quote
  availability?: never;
}

export interface Offer extends BaseService {
    type: 'offer';
    price: number; // Offers have a fixed price
    availability: string;
}

export type ServiceOrOffer = Service | Offer;


export interface QuoteRequest {
  id: string;
  clientId: string;
  clientName: string;
  clientAvatar: string;
  vendorId: string;
  serviceId: string;
  serviceTitle: string;
  message: string;
  eventDate: string;
  status: 'pending' | 'approved' | 'declined';
  createdAt: Date;
}

export interface Booking {
  id: string;
  title: string;
  with: string;
  clientId: string;
  vendorId: string;
  date: Date;
  time: string;
}

export interface Message {
  id:string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
}

export interface EventTask {
  id: string;
  task: string;
  deadline: string;
  estimatedCost: number;
  completed: boolean;
}

export interface GenerateEventPlanInput {
  eventType: string;
  eventDate: string;
  location: string;
  guestCount: number;
  budget: number;
}

export interface SavedTimeline {
    id: string;
    name: string;
    tasks: EventTask[];
    lastModified: string;
}

// Firestore-specific types
export interface UserProfile {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    createdAt: Date;
    savedItemIds?: string[];
}

export interface VendorProfile {
    id: string;
    businessName: string;
    category: string;
    tagline: string;
    description: string;
    email: string;
    phone: string;
    ownerId: string;
    createdAt: Date;
    portfolio?: string[];
}
