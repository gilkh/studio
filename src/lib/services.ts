
import { collection, doc, getDoc, setDoc, updateDoc, getDocs, query, where, DocumentData } from 'firebase/firestore';
import { db } from './firebase';
import type { UserProfile, VendorProfile, Service, Offer, QuoteRequest, Booking, SavedTimeline } from './types';

// User Profile Services
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
    }
    return null;
}

export async function updateUserProfile(userId: string, data: Partial<UserProfile>) {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, data);
}

export async function getVendorProfile(vendorId: string): Promise<VendorProfile | null> {
    const docRef = doc(db, 'vendors', vendorId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data() as VendorProfile;
    }
    return null;
}

export async function updateVendorProfile(vendorId: string, data: Partial<VendorProfile>) {
    const docRef = doc(db, 'vendors', vendorId);
    await updateDoc(docRef, data);
}

// Timeline Services
export async function getSavedTimelines(userId: string): Promise<SavedTimeline[]> {
    const q = query(collection(db, `users/${userId}/timelines`));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavedTimeline));
}

export async function saveTimeline(userId: string, timeline: Omit<SavedTimeline, 'id'>): Promise<string> {
    const docRef = doc(collection(db, `users/${userId}/timelines`));
    await setDoc(docRef, timeline);
    return docRef.id;
}

export async function updateTimeline(userId: string, timelineId: string, timeline: SavedTimeline) {
    const docRef = doc(db, `users/${userId}/timelines`, timelineId);
    await setDoc(docRef, timeline);
}

export async function deleteTimeline(userId: string, timelineId: string) {
    const docRef = doc(db, `users/${userId}/timelines`, timelineId);
    // In a real app, you might want to soft delete instead.
    // For now, we'll just delete the document.
    await updateDoc(docRef, { deleted: true }); 
}

// Generic function to fetch data and transform to a specific type
async function fetchCollection<T>(path: string, transform: (data: DocumentData) => T): Promise<T[]> {
    const querySnapshot = await getDocs(collection(db, path));
    return querySnapshot.docs.map(doc => transform({ id: doc.id, ...doc.data() }));
}


// Service and Offer Services
export const getServices = () => fetchCollection('services', (d) => d as Service);
export const getOffers = () => fetchCollection('offers', (d) => d as Offer);
export const getServicesAndOffers = async () => {
    const services = await getServices();
    const offers = await getOffers();
    return [...services, ...offers];
}

// Quote Request Services
export const getQuoteRequests = () => fetchCollection('quoteRequests', (d) => d as QuoteRequest);

// Booking Services
export const getBookings = () => fetchCollection('bookings', (d) => ({
    ...d,
    date: (d.date as any).toDate(), // Convert Firestore Timestamp to Date
}) as Booking);
