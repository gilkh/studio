

export type ServiceType = 'service' | 'offer';
export type ServiceCategory = 'Venues' | 'Catering & Sweets' | 'Entertainment' | 'Lighting & Sound' | 'Photography & Videography' | 'Decoration' | 'Beauty & Grooming' | 'Transportation' | 'Invitations & Printables' | 'Rentals & Furniture' | 'Security and Crowd Control';
export type Location = 'Beirut' | 'Mount Lebanon' | 'North Lebanon' | 'South Lebanon' | 'Nabatieh' | 'Beqaa' | 'Baalbek-Hermel' | 'Akkar';

export const locations: Location[] = ['Beirut', 'Mount Lebanon', 'North Lebanon', 'South Lebanon', 'Nabatieh', 'Beqaa', 'Baalbek-Hermel', 'Akkar'];

export interface MediaItem {
  url: string;
  type: 'image' | 'video';
  status: 'pending' | 'approved' | 'rejected';
  isThumbnail?: boolean;
}

export interface ServiceInclusions {
  // Venues
  hasParking?: boolean;
  hasValet?: boolean;
  hasOnSiteCatering?: boolean;
  isOutdoors?: boolean;
  hasPool?: boolean;

  // Catering & Sweets
  offersTastings?: boolean;
  servesAlcohol?: boolean;
  hasVeganOptions?: boolean;
  hasGlutenFreeOptions?: boolean;

  // Entertainment
  providesOwnSoundSystem?: boolean;
  providesOwnLighting?: boolean;

  // Photography & Videography
  offersDroneFootage?: boolean;
  offersSameDayEdit?: boolean;

  // Decoration
  providesSetup?: boolean;
  providesCleanup?: boolean;

  // Beauty & Grooming
  travelsToClient?: boolean;
  offersTrials?: boolean;

  [key: string]: boolean | undefined;
}


export interface BaseService {
  id: string;
  type: ServiceType;
  vendorId: string;
  vendorName: string;
  vendorAvatar?: string;
  vendorVerification?: 'none' | 'verified' | 'trusted';
  title: string;
  description: string;
  category: ServiceCategory;
  rating: number;
  reviewCount: number;
  image: string;
  media?: MediaItem[];
  inclusions?: ServiceInclusions;
  location: Location;
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
  clientAvatar?: string;
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
  lineItems?: LineItem[];
}

export interface Booking {
  id: string;
  title: string;
  with: string;
  clientId: string;
  vendorId: string;
  date: Date;
  time: string;
  serviceId: string; // The ID of the service or offer that was booked
  serviceType: ServiceType;
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
  verification?: 'none' | 'verified' | 'trusted';
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
    avatar?: string;
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
    avatar?: string;
}

export interface VendorProfile {
    id: string;
    businessName: string;
    category: ServiceCategory;
    tagline: string;
    description: string;
    email: string;
    phone: string;
    ownerId: string;
    accountTier: 'free' | 'vip1' | 'vip2' | 'vip3';
    createdAt: Date;
    portfolio?: MediaItem[];
    status: 'active' | 'disabled';
    rating: number;
    reviewCount: number;
    avatar?: string;
    verification?: 'none' | 'verified' | 'trusted';
    location: Location;
}

export interface VendorCode {
    id: string;
    code: string;
    isUsed: boolean;
    createdAt: Date;
    usedBy?: string; // vendorId
    usedAt?: Date;
}

export interface LineItem {
  description: string;
  price: number;
}

export interface ForwardedItem {
  isForwarded: true;
  isQuoteRequest: boolean;
  isQuoteResponse: boolean;
  title: string;
  image?: string;
  vendorName: string;
  price?: number;
  userMessage: string;
  itemId?: string;
  itemType?: ServiceType;
  // Quote request specific fields
  eventDate?: string;
  guestCount?: number;
  phone?: string;
  // Quote response specific fields
  lineItems?: LineItem[];
  total?: number;
  quoteRequestId?: string;
}


export interface UpgradeRequest {
  id: string;
  vendorId: string;
  vendorName: string;
  currentTier: VendorProfile['accountTier'];
  phone: string;
  requestedAt: Date;
  status: 'pending' | 'contacted';
}

export interface VendorInquiry {
  id: string;
  firstName: string;
  lastName: string;
  businessName: string;
  phone: string;
  message: string;
  createdAt: Date;
  status: 'pending' | 'contacted';
}

export interface VendorAnalyticsData {
    month: string;
    quotes: number;
    bookings: number;
}

export interface PlatformAnalytics {
    totalUsers: number;
    totalVendors: number;
    totalBookings: number;
    userSignups: { month: string; Clients: number; Vendors: number }[];
}

export interface Review {
    id: string;
    bookingId: string;
    vendorId: string;
    clientId: string;
    clientName: string;
    clientAvatar?: string;
    serviceId: string;
    rating: number;
    comment: string;
    createdAt: Date;
}
