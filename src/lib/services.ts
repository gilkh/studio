

import { collection, doc, getDoc, setDoc, updateDoc, getDocs, query, where, DocumentData, deleteDoc, addDoc, serverTimestamp, orderBy, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from './firebase';
import type { UserProfile, VendorProfile, Service, Offer, QuoteRequest, Booking, SavedTimeline, ServiceOrOffer } from './types';

const MOCK_USER_ID = 'user123';
const MOCK_VENDOR_ID = 'vendor123';

export async function createNewUser(data: {
    accountType: 'client' | 'vendor';
    firstName: string;
    lastName: string;
    email: string;
    businessName?: string;
}) {
    // In a real app, this would use Firebase Auth to create a user and get a UID
    // For this prototype, we'll generate a random-ish ID
    const userId = `${data.firstName.toLowerCase()}${Math.floor(Math.random() * 1000)}`;

    if (data.accountType === 'client') {
        const userProfile: Omit<UserProfile, 'id' | 'createdAt' | 'savedItemIds'> = {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: '', // Can be added in profile page
        };
        await createOrUpdateUserProfile(userId, userProfile);
    } else {
        const vendorProfile: Omit<VendorProfile, 'id' | 'createdAt' | 'portfolio' | 'ownerId'> = {
            businessName: data.businessName || `${data.firstName} ${data.lastName}`,
            category: 'Uncategorized',
            tagline: '',
            description: '',
            email: data.email,
            phone: '',
        };
        await createOrUpdateVendorProfile(userId, { ...vendorProfile, ownerId: userId });
    }
}


// User Profile Services
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            const createdAt = data.createdAt ? data.createdAt.toDate() : new Date();
            return {
                id: docSnap.id,
                ...data,
                createdAt,
            } as UserProfile;
        }
    } catch (e) {
        console.error("Firebase error getting user profile:", e);
        if ((e as any).code === 'unavailable') {
             // Silently ignore unavailable error on initial load
            return null;
        }
        throw e;
    }
    return null;
}

export async function createOrUpdateUserProfile(userId: string, data: Partial<Omit<UserProfile, 'id' | 'createdAt'>>) {
    const docRef = doc(db, 'users', userId);
    // Use setDoc with merge:true to either create a new doc or update an existing one.
    // This avoids the race condition of reading (getDoc) before the client is online.
    const initialData = { savedItemIds: [] };
    await setDoc(docRef, { ...data, createdAt: serverTimestamp(), ...initialData }, { merge: true });
}


export async function getVendorProfile(vendorId: string): Promise<VendorProfile | null> {
    try {
        const docRef = doc(db, 'vendors', vendorId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            const createdAt = data.createdAt ? data.createdAt.toDate() : new Date();
            return {
                id: docSnap.id,
                ...data,
                createdAt
            } as VendorProfile;
        }
    } catch (e) {
        console.error("Firebase error getting vendor profile:", e);
         if ((e as any).code === 'unavailable') {
            return null;
        }
        throw e;
    }
    return null;
}

export async function createOrUpdateVendorProfile(vendorId: string, data: Partial<Omit<VendorProfile, 'id' | 'createdAt'>>) {
    const docRef = doc(db, 'vendors', vendorId);
     // Use setDoc with merge:true to either create a new doc or update an existing one.
    await setDoc(docRef, { ...data, createdAt: serverTimestamp(), portfolio: [] }, { merge: true });
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
async function fetchCollection<T extends {id: string}>(path: string, transform?: (data: DocumentData) => T): Promise<T[]> {
    try {
        const querySnapshot = await getDocs(collection(db, path));
        return querySnapshot.docs.map(doc => {
            const data = { id: doc.id, ...doc.data() };
            return transform ? transform(data) : data as T;
        });
    } catch (e) {
        console.error(`Firebase error fetching collection ${path}:`, e);
        if ((e as any).code === 'unavailable') {
            return []; // Return empty array if offline
        }
        throw e;
    }
}


// Service and Offer Services
export const getServices = () => fetchCollection<Service>('services');
export const getOffers = () => fetchCollection<Offer>('offers');

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
    try {
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt.toDate(),
            } as QuoteRequest
        });
    } catch(e) {
        console.error("Firebase error getting quote requests:", e);
        if ((e as any).code === 'unavailable') {
            return [];
        }
        throw e;
    }
}


// Booking Services
export async function createBooking(booking: Omit<Booking, 'id'>) {
    await addDoc(collection(db, 'bookings'), booking);
}

export const getBookingsForUser = async(userId: string) => {
    const q = query(collection(db, "bookings"), where("clientId", "==", userId));
    try {
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                date: data.date.toDate(),
            } as Booking;
        });
    } catch(e) {
        console.error("Firebase error getting user bookings:", e);
         if ((e as any).code === 'unavailable') {
            return [];
        }
        throw e;
    }
}
export const getBookingsForVendor = async(vendorId: string) => {
    const q = query(collection(db, "bookings"), where("vendorId", "==", vendorId));
    try {
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                date: data.date.toDate(),
            } as Booking;
        });
    } catch(e) {
        console.error("Firebase error getting vendor bookings:", e);
         if ((e as any).code === 'unavailable') {
            return [];
        }
        throw e;
    }
}


// Saved Items
export async function getSavedItems(userId: string): Promise<ServiceOrOffer[]> {
    const user = await getUserProfile(userId);
    if (!user || !user.savedItemIds || user.savedItemIds.length === 0) {
        return [];
    }
    
    // Firestore 'in' queries are limited to 30 items in an array.
    // For a production app with many saved items, you would paginate this.
    const savedIds = user.savedItemIds;

    const allItems = await getServicesAndOffers();
    return allItems.filter(item => savedIds.includes(item.id));
}

export async function toggleSavedItem(userId: string, itemId: string) {
    const userRef = doc(db, 'users', userId);
    
    const userProfile = await getUserProfile(userId);
    
    if (!userProfile) {
        // Create the user profile if it doesn't exist, and save the item.
        await createOrUpdateUserProfile(userId, { savedItemIds: [itemId] });
        return;
    }
    
    const currentSaved = userProfile.savedItemIds || [];

    if (currentSaved.includes(itemId)) {
        // Atomically remove the item from the array
        await updateDoc(userRef, {
            savedItemIds: arrayRemove(itemId)
        });
    } else {
        // Atomically add the new item to the array
        await updateDoc(userRef, {
            savedItemIds: arrayUnion(itemId)
        });
    }
}
