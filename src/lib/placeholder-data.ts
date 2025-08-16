import type { Service, QuoteRequest, Booking, Message } from '@/lib/types';

export const services: Service[] = [
  {
    id: '1',
    vendorName: 'Gourmet Catering Co.',
    vendorAvatar: 'https://i.pravatar.cc/150?u=gourmet',
    title: 'Exquisite Wedding & Event Catering',
    description: 'Unforgettable culinary experiences for weddings, corporate events, and private parties. Custom menus available.',
    category: 'Catering',
    rating: 4.9,
    reviewCount: 215,
    price: 75,
    availability: 'Mon-Sun, 8am-10pm',
    image: 'https://placehold.co/600x400.png',
  },
  {
    id: '2',
    vendorName: 'Timeless Snaps',
    vendorAvatar: 'https://i.pravatar.cc/150?u=timeless',
    title: 'Creative Wedding & Portrait Photography',
    description: 'Capturing your special moments with artistry and passion. Full-day coverage and printed albums.',
    category: 'Photography',
    rating: 5.0,
    reviewCount: 150,
    price: 2500,
    availability: 'By appointment',
    image: 'https://placehold.co/600x400.png',
  },
  {
    id: '3',
    vendorName: 'Bloom & Petal',
    vendorAvatar: 'https://i.pravatar.cc/150?u=bloom',
    title: 'Stunning Floral Arrangements',
    description: 'Bespoke floral designs for bouquets, centerpieces, and venue decorations. All styles from classic to modern.',
    category: 'Decor & Floral',
    rating: 4.8,
    reviewCount: 98,
    price: 500,
    availability: 'Tue-Sat, 10am-6pm',
    image: 'https://placehold.co/600x400.png',
  },
  {
    id: '4',
    vendorName: 'Groove Masters DJ',
    vendorAvatar: 'https://i.pravatar.cc/150?u=groove',
    title: 'Pro DJ for Parties & Events',
    description: 'High-energy DJ services with professional sound and lighting to keep your guests dancing all night long.',
    category: 'Music & Entertainment',
    rating: 4.9,
    reviewCount: 180,
    price: 600,
    availability: 'Fri-Sun, 4pm-2am',
    image: 'https://placehold.co/600x400.png',
  },
];

export const quoteRequests: QuoteRequest[] = [
  {
    id: 'qr1',
    clientName: 'Eve Adams',
    clientAvatar: 'https://i.pravatar.cc/150?u=eve',
    serviceTitle: 'Exquisite Wedding & Event Catering',
    message: 'I\'m planning a wedding for 150 guests and would love to see your menu options.',
    date: '2024-08-15',
    status: 'pending',
  },
  {
    id: 'qr2',
    clientName: 'Frank Miller',
    clientAvatar: 'https://i.pravatar.cc/150?u=frank',
    serviceTitle: 'Creative Wedding & Portrait Photography',
    message: 'We\'d like to book a full-day wedding package for our date in October.',
    date: '2024-08-14',
    status: 'approved',
  },
  {
    id: 'qr3',
    clientName: 'Grace Lee',
    clientAvatar: 'https://i.pravatar.cc/150?u=grace',
    serviceTitle: 'Stunning Floral Arrangements',
    message: 'Could you provide a quote for 10 centerpieces and a bridal bouquet?',
    date: '2024-08-12',
    status: 'declined',
  },
];

export const bookings: Booking[] = [
    {
        id: 'b1',
        title: 'Final Tasting Session',
        with: 'Eve Adams',
        date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 2),
        time: '10:00 AM'
    },
    {
        id: 'b2',
        title: 'Wedding Day Photoshoot',
        with: 'Frank Miller',
        date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 5),
        time: '02:30 PM'
    },
     {
        id: 'b3',
        title: 'Venue Decoration Setup',
        with: 'Michael Chen',
        date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 10),
        time: '11:00 AM'
    },
];

export const messages: Message[] = [
    {
        id: 'm1',
        name: 'Eve Adams',
        avatar: 'https://i.pravatar.cc/150?u=eve',
        lastMessage: 'The tasting menu looks fantastic! Let\'s book it.',
        timestamp: '10:42 AM',
        unreadCount: 2
    },
    {
        id: 'm2',
        name: 'Frank Miller',
        avatar: 'https://i.pravatar.cc/150?u=frank',
        lastMessage: 'Just confirming our session for the 25th.',
        timestamp: 'Yesterday',
    },
    {
        id: 'm3',
        name: 'Grace Lee',
        avatar: 'https://i.pravatar.cc/150?u=grace',
        lastMessage: 'Thanks for the quote. We\'ll be in touch.',
        timestamp: '2 days ago',
    }
]
