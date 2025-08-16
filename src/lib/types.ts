export interface Service {
  id: string;
  vendorName: string;
  vendorAvatar: string;
  title: string;
  description: string;
  category: string;
  rating: number;
  reviewCount: number;
  price: number;
  availability: string;
  image: string;
}

export interface QuoteRequest {
  id: string;
  clientName: string;
  clientAvatar: string;
  serviceTitle: string;
  message: string;
  date: string;
  status: 'pending' | 'approved' | 'declined';
}

export interface Booking {
  id: string;
  title: string;
  with: string;
  date: Date;
  time: string;
}

export interface Message {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
}
