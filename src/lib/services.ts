

import { collection, doc, getDoc, setDoc, updateDoc, getDocs, query, where, DocumentData, deleteDoc, addDoc, serverTimestamp, orderBy, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from './firebase';
import type { UserProfile, VendorProfile, Service, Offer, QuoteRequest, Booking, SavedTimeline, ServiceOrOffer } from './types';

// Mock user ID for prototype. In a real app, this would be the actual logged-in user's ID.
export const MOCK_USER_ID = 'user123';
export const MOCK_VENDOR_ID = 'vendor123';

export async function createNewUser(data: {
    accountType: 'client' | 'vendor';
    firstName: string;
    lastName: string;
    email: string;
    businessName?: string;
}) {
    const { accountType, firstName, lastName, email, businessName } = data;
    // In a real app, this ID would come from Firebase Auth after user creation.
    // For the prototype, we'll create a simple ID.
    const userId = `${firstName.toLowerCase()}-${lastName.toLowerCase()}`;

    if (accountType === 'client') {
        const userProfile: Omit<UserProfile, 'id'> = {
            firstName,
            lastName,
            email,
            phone: '',
            createdAt: new Date(),
            savedItemIds: [],
        };
        // Using setDoc with a specific ID.
        await setDoc(doc(db, 'users', userId), userProfile);
    } else if (accountType === 'vendor') {
        const vendorProfile: Omit<VendorProfile, 'id'> = {
            businessName: businessName || `${firstName}'s Business`,
            email,
            ownerId: userId, // Link to a user profile if needed
            category: '',
            tagline: '',
            description: '',
            phone: '',
            createdAt: new Date(),
        };
        // Vendors also get a user profile for basic info
        const userProfile: Omit<UserProfile, 'id'> = {
            firstName,
            lastName,
            email,
            phone: '',
            createdAt: new Date(),
        };
        await setDoc(doc(db, 'users', userId), userProfile);
        // Using setDoc with a specific ID, which can be the same as the user ID for simplicity.
        await setDoc(doc(db, 'vendors', userId), vendorProfile);
    }
}


// In a real app, this would also verify password. For now, it just finds a user by email.
export async function signInUser(email: string): Promise<{ role: 'client' | 'vendor'; userId: string } | null> {
    try {
        // Check if it's a vendor first
        const vendorQuery = query(collection(db, 'vendors'), where('email', '==', email));
        const vendorSnapshot = await getDocs(vendorQuery);
        if (!vendorSnapshot.empty) {
            return { role: 'vendor', userId: vendorSnapshot.docs[0].id };
        }

        // If not a vendor, check if it's a client
        const userQuery = query(collection(db, 'users'), where('email', '==', email));
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
             const userId = userSnapshot.docs[0].id;
             // Need to make sure this user isn't also a vendor
             const vendorCheck = await getDoc(doc(db, 'vendors', userId));
             if (!vendorCheck.exists()) {
                 return { role: 'client', userId };
             }
        }
    } catch (e) {
        if ((e as any).code === 'unavailable') {
            console.warn("Firestore is offline, cannot sign in.");
            // For prototype, let's allow mock login
            if (email.startsWith('vendor')) return { role: 'vendor', userId: MOCK_VENDOR_ID };
            if (email.startsWith('client')) return { role: 'client', userId: MOCK_USER_ID };
            return null;
        }
        console.error("Sign in error:", e);
        throw e;
    }
    
    return null;
}


// User Profile Services
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    if (!userId) return null;
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
    if (!userId) return;
    const docRef = doc(db, 'users', userId);
    // Use setDoc with merge:true to either create a new doc or update an existing one.
    // This avoids the race condition of reading (getDoc) before the client is online.
    await setDoc(docRef, { ...data, createdAt: serverTimestamp() }, { merge: true });
}


export async function getVendorProfile(vendorId: string): Promise<VendorProfile | null> {
    if (!vendorId) return null;
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
    if (!vendorId) return;
     const docRef = doc(db, 'vendors', vendorId);
     // Use setDoc with merge:true to either create a new doc or update an existing one.
    await setDoc(docRef, { ...data, createdAt: serverTimestamp() }, { merge: true });
}

// Timeline Services
export async function getSavedTimelines(userId: string): Promise<SavedTimeline[]> {
    if (!userId) return [];
    try {
        const q = query(collection(db, `users/${userId}/timelines`));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavedTimeline));
    } catch(e) {
         console.error(`Firebase error getting saved timelines:`, e);
        if ((e as any).code === 'unavailable') {
            return []; // Return empty array if offline
        }
        throw e;
    }
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
     if (!vendorId) return [];
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
    if (!userId) return [];
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
    if (!vendorId) return [];
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
    if (!userId) return [];
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
    if (!userId) return;
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
