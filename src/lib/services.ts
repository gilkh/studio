
import { collection, doc, getDoc, setDoc, updateDoc, getDocs, query, where, DocumentData, deleteDoc, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import type { UserProfile, VendorProfile, Service, Offer, QuoteRequest, Booking, SavedTimeline, ServiceOrOffer } from './types';

const MOCK_USER_ID = 'user123';
const MOCK_VENDOR_ID = 'vendor123';

// User Profile Services
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt.toDate(), // Convert Firestore Timestamp to Date
        } as UserProfile;
    }
    return null;
}

export async function createOrUpdateUserProfile(userId: string, data: Partial<UserProfile>) {
    const docRef = doc(db, 'users', userId);
    // Use set with merge:true to create or update document
    await setDoc(docRef, { ...data, createdAt: serverTimestamp() }, { merge: true });
}


export async function getVendorProfile(vendorId: string): Promise<VendorProfile | null> {
    const docRef = doc(db, 'vendors', vendorId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt.toDate(),
        } as VendorProfile;
    }
    return null;
}

export async function createOrUpdateVendorProfile(vendorId: string, data: Partial<VendorProfile>) {
    const docRef = doc(db, 'vendors', vendorId);
    await setDoc(docRef, { ...data, createdAt: serverTimestamp() }, { merge: true });
}

// Timeline Services
export async function getSavedTimelines(userId: string): Promise<SavedTimeline[]> {
    const q = query(collection(db, `users/${userId}/timelines`));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavedTimeline));
}

export async function saveTimeline(userId: string, timeline: Omit<SavedTimeline, 'id'>): Promise<string> {
    const collectionRef = collection(db, `users/${userId}/timelines`);
    const docRef = await addDoc(collectionRef, timeline);
    return docRef.id;
}

export async function updateTimeline(userId: string, timelineId: string, timeline: SavedTimeline) {
    const docRef = doc(db, `users/${userId}/timelines`, timelineId);
    await setDoc(docRef, timeline, { merge: true });
}

export async function deleteTimeline(userId: string, timelineId: string) {
    const docRef = doc(db, `users/${userId}/timelines`, timelineId);
    await deleteDoc(docRef);
}

// Generic function to fetch data and transform to a specific type
async function fetchCollection<T>(path: string, transform: (data: DocumentData) => T): Promise<T[]> {
    const querySnapshot = await getDocs(collection(db, path));
    return querySnapshot.docs.map(doc => transform({ id: doc.id, ...doc.data() }));
}


// Service and Offer Services
export const getServices = () => fetchCollection('services', (d) => d as Service);
export const getOffers = () => fetchCollection('offers', (d) => d as Offer);

export const getServicesAndOffers = async (): Promise<ServiceOrOffer[]> => {
    const services = await getServices();
    const offers = await getOffers();
    return [...services, ...offers];
}

export async function createServiceOrOffer(item: Omit<Service, 'id'> | Omit<Offer, 'id'>) {
    const collectionName = item.type === 'service' ? 'services' : 'offers';
    await addDoc(collection(db, collectionName), {
        ...item,
        vendorId: MOCK_VENDOR_ID, // In a real app, get this from auth
    });
}

// Quote Request Services
export async function createQuoteRequest(request: Omit<QuoteRequest, 'id' | 'createdAt'>) {
    await addDoc(collection(db, 'quoteRequests'), {
        ...request,
        createdAt: serverTimestamp(),
    });
}

export async function getVendorQuoteRequests(vendorId: string): Promise<QuoteRequest[]> {
     const q = query(collection(db, 'quoteRequests'), where('vendorId', '==', vendorId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt.toDate(),
        } as QuoteRequest
    });
}


// Booking Services
export async function createBooking(booking: Omit<Booking, 'id'>) {
    await addDoc(collection(db, 'bookings'), booking);
}

export const getBookingsForUser = async(userId: string) => {
    const q = query(collection(db, "bookings"), where("clientId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            date: data.date.toDate(),
        } as Booking;
    });
}
export const getBookingsForVendor = async(vendorId: string) => {
    const q = query(collection(db, "bookings"), where("vendorId", "==", vendorId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            date: data.date.toDate(),
        } as Booking;
    });
}


// Saved Items
export async function getSavedItems(userId: string): Promise<ServiceOrOffer[]> {
    const user = await getUserProfile(userId);
    if (!user || !user.savedItemIds || user.savedItemIds.length === 0) {
        return [];
    }
    
    // Firestore 'in' queries are limited to 10 items.
    // For a production app with many saved items, you would paginate this.
    // For this prototype, we assume a small number of saved items.
    const savedIds = user.savedItemIds;

    const allItems = await getServicesAndOffers();
    return allItems.filter(item => savedIds.includes(item.id));
}

export async function toggleSavedItem(userId: string, itemId: string) {
    const userRef = doc(db, 'users', userId);
    const user = await getUserProfile(userId);
    const currentSaved = user?.savedItemIds || [];

    if (currentSaved.includes(itemId)) {
        // Remove item
        await updateDoc(userRef, {
            savedItemIds: currentSaved.filter(id => id !== itemId)
        });
    } else {
        // Add item
        await updateDoc(userRef, {
            savedItemIds: [...currentSaved, itemId]
        });
    }
}
