

export type ServiceType = 'service' | 'offer';

export interface MediaItem {
  url: string;
  type: 'image' | 'video';
  isThumbnail?: boolean;
}

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
  media?: MediaItem[];
}

export interface Service extends BaseService {
  type: 'service';
  price?: never; // Services don't have a fixed price, they require a quote
  availableDates?: never;
}

export interface Offer extends BaseService {
    type: 'offer';
    price: number; // Offers have a fixed price
    availableDates?: string[]; // Array of available date strings "yyyy-MM-dd"
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
  guestCount: number;
  phone: string;
  status: 'pending' | 'responded' | 'approved' | 'declined';
  createdAt: Date;
  quotePrice?: number;
  quoteResponse?: string;
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

export interface ChatMessage {
  id:string;
  senderId: string;
  text: string;
  timestamp: Date;
}

export interface ChatParticipant {
  id: string;
  name: string;
  avatar: string;
}

export interface Chat {
  id: string;
  participantIds: string[];
  participants: ChatParticipant[];
  lastMessage: string;
  lastMessageSenderId: string;
  lastMessageTimestamp: Date;
  unreadCount?: { [key: string]: number };
}


export interface EventTask {
  id: string;
  task: string;
  deadline: string;
  estimatedCost: number;
  completed: boolean;
  suggestedVendorCategory?: string;
  assignedVendor?: {
    id: string;
    name: string;
    avatar: string;
  };
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
    status: 'active' | 'disabled';
    password?: string;
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
    accountTier: 'free' | 'vip1' | 'vip2' | 'vip3';
    createdAt: Date;
    portfolio?: string[];
    status: 'active' | 'disabled';
}

export interface VendorCode {
    id: string;
    code: string;
    isUsed: boolean;
    createdAt: Date;
    usedBy?: string; // vendorId
    usedAt?: Date;
}

export interface ForwardedItem {
  isForwarded: true;
  isQuoteRequest: boolean;
  title: string;
  image: string;
  vendorName: string;
  price?: number;
  userMessage: string;
  itemId: string;
  itemType: ServiceType;
  // Quote request specific fields
  eventDate?: string;
  guestCount?: number;
  phone?: string;
}
