import type { Service, QuoteRequest, Booking, Message, Offer, ServiceOrOffer } from '@/lib/types';

export const services: Service[] = [
  {
    id: 's1',
    type: 'service',
    vendorName: 'Timeless Snaps',
    vendorAvatar: 'https://i.pravatar.cc/150?u=timeless',
    title: 'Creative Wedding & Portrait Photography',
    description: 'Capturing your special moments with artistry and passion. Full-day coverage and printed albums.',
    category: 'Photography',
    rating: 5.0,
    reviewCount: 150,
    image: 'https://placehold.co/600x400.png',
  },
  {
    id: 's2',
    type: 'service',
    vendorName: 'Bloom & Petal',
    vendorAvatar: 'https://i.pravatar.cc/150?u=bloom',
    title: 'Stunning Floral Arrangements',
    description: 'Bespoke floral designs for bouquets, centerpieces, and venue decorations. All styles from classic to modern.',
    category: 'Decor & Floral',
    rating: 4.8,
    reviewCount: 98,
    image: 'https://placehold.co/600x400.png',
  },
];

export const offers: Offer[] = [
    {
        id: 'o1',
        type: 'offer',
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
        id: 'o2',
        type: 'offer',
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
    }
];

export const servicesAndOffers: ServiceOrOffer[] = [...services, ...offers];


export const quoteRequests: QuoteRequest[] = [
  {
    id: 'qr1',
    clientName: 'Eve Adams',
    clientAvatar: 'https://i.pravatar.cc/150?u=eve',
    serviceTitle: 'Creative Wedding & Portrait Photography',
    message: 'I\'m planning a wedding for 150 guests and would love to see your portfolio and get a quote.',
    date: '2024-08-15',
    status: 'pending',
  },
  {
    id: 'qr2',
    clientName: 'Frank Miller',
    clientAvatar: 'https://i.pravatar.cc/150?u=frank',
    serviceTitle: 'Stunning Floral Arrangements',
    message: 'We\'d like to book a full-day wedding package for our date in October.',
    date: '2024-08-14',
    status: 'approved',
  },
  {
    id: 'qr3',
    clientName: 'Grace Lee',
    clientAvatar: 'https://i.pravatar.cc/150?u=grace',
    serviceTitle: 'Creative Wedding & Portrait Photography',
    message: 'Could you provide a quote for a 2-hour engagement shoot?',
    date: '2024-08-12',
    status: 'declined',
  },
];

export const bookings: Booking[] = [
    {
        id: 'b1',
        title: 'Final Tasting Session (Gourmet Catering)',
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
        lastMessage: 'The catering menu looks fantastic! Let\'s book it.',
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
