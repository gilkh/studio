import type { Service, QuoteRequest, Booking, Message } from '@/lib/types';

export const services: Service[] = [
  {
    id: '1',
    vendorName: 'Alice Johnson',
    vendorAvatar: 'https://i.pravatar.cc/150?u=alice',
    title: 'Professional Logo Design',
    description: 'High-quality, custom logos for your brand. Unlimited revisions until you are satisfied.',
    category: 'Graphic Design',
    rating: 4.9,
    reviewCount: 120,
    price: 250,
    availability: 'Mon-Fri, 9am-5pm',
    image: 'https://placehold.co/600x400.png',
  },
  {
    id: '2',
    vendorName: 'Bob Williams',
    vendorAvatar: 'https://i.pravatar.cc/150?u=bob',
    title: 'Full-Stack Web Development',
    description: 'Complete web solutions from front-end to back-end. Specialized in React and Node.js.',
    category: 'Web Development',
    rating: 5.0,
    reviewCount: 88,
    price: 3000,
    availability: 'By appointment',
    image: 'https://placehold.co/600x400.png',
  },
  {
    id: '3',
    vendorName: 'Charlie Brown',
    vendorAvatar: 'https://i.pravatar.cc/150?u=charlie',
    title: 'Content Writing & SEO',
    description: 'Engaging articles, blog posts, and website copy that ranks on search engines.',
    category: 'Writing',
    rating: 4.8,
    reviewCount: 250,
    price: 150,
    availability: 'Mon-Sat, 10am-6pm',
    image: 'https://placehold.co/600x400.png',
  },
  {
    id: '4',
    vendorName: 'Diana Prince',
    vendorAvatar: 'https://i.pravatar.cc/150?u=diana',
    title: 'Virtual Assistant Services',
    description: 'Efficient administrative, technical, or creative assistance to clients remotely.',
    category: 'Admin Support',
    rating: 4.9,
    reviewCount: 95,
    price: 30,
    availability: 'Flexible hours',
    image: 'https://placehold.co/600x400.png',
  },
];

export const quoteRequests: QuoteRequest[] = [
  {
    id: 'qr1',
    clientName: 'Eve Adams',
    clientAvatar: 'https://i.pravatar.cc/150?u=eve',
    serviceTitle: 'Professional Logo Design',
    message: 'I need a logo for my new coffee shop. Looking for something modern and minimalist.',
    date: '2024-08-15',
    status: 'pending',
  },
  {
    id: 'qr2',
    clientName: 'Frank Miller',
    clientAvatar: 'https://i.pravatar.cc/150?u=frank',
    serviceTitle: 'Full-Stack Web Development',
    message: 'We need to build an e-commerce platform. Our budget is around $5000.',
    date: '2024-08-14',
    status: 'approved',
  },
  {
    id: 'qr3',
    clientName: 'Grace Lee',
    clientAvatar: 'https://i.pravatar.cc/150?u=grace',
    serviceTitle: 'Content Writing & SEO',
    message: 'Looking for a series of 10 blog posts about sustainable fashion.',
    date: '2024-08-12',
    status: 'declined',
  },
];

export const bookings: Booking[] = [
    {
        id: 'b1',
        title: 'Project Kickoff: E-commerce Platform',
        with: 'Frank Miller',
        date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 2),
        time: '10:00 AM'
    },
    {
        id: 'b2',
        title: 'Design Consultation',
        with: 'Sophia Loren',
        date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 5),
        time: '02:30 PM'
    },
     {
        id: 'b3',
        title: 'Final Review: Logo Concepts',
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
        lastMessage: 'Thanks for the quick response! I will review...',
        timestamp: '10:42 AM',
        unreadCount: 2
    },
    {
        id: 'm2',
        name: 'Frank Miller',
        avatar: 'https://i.pravatar.cc/150?u=frank',
        lastMessage: 'The contract is signed. We are ready to start.',
        timestamp: 'Yesterday',
    },
    {
        id: 'm3',
        name: 'Grace Lee',
        avatar: 'https://i.pravatar.cc/150?u=grace',
        lastMessage: 'Understood. Thanks for letting me know.',
        timestamp: '2 days ago',
    }
]
