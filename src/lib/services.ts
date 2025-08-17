


import { collection, doc, getDoc, setDoc, updateDoc, getDocs, query, where, DocumentData, deleteDoc, addDoc, serverTimestamp, orderBy, arrayUnion, arrayRemove, writeBatch, runTransaction } from 'firebase/firestore';
import { db } from './firebase';
import type { UserProfile, VendorProfile, Service, Offer, QuoteRequest, Booking, SavedTimeline, ServiceOrOffer, VendorCode } from './types';

export async function createNewUser(data: {
    accountType: 'client' | 'vendor';
    firstName: string;
    lastName: string;
    email: string;
    businessName?: string;
    vendorCode?: string;
}) {
    const { accountType, firstName, lastName, email, businessName, vendorCode } = data;
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
        await setDoc(doc(db, 'users', userId), userProfile);
        return { userId, role: 'client' };
    } else if (accountType === 'vendor') {
        if (!vendorCode) {
            throw new Error("A valid vendor code is required to register as a vendor.");
        }

        // Check if vendor code is valid and not used
        const codeQuery = query(collection(db, 'vendorCodes'), where('code', '==', vendorCode), where('isUsed', '==', false));
        const codeSnapshot = await getDocs(codeQuery);

        if (codeSnapshot.empty) {
            throw new Error("Invalid or already used vendor code.");
        }
        
        const codeDoc = codeSnapshot.docs[0];

        // Create user and vendor profile
        const userProfile: Omit<UserProfile, 'id'> = {
            firstName,
            lastName,
            email,
            phone: '',
            createdAt: new Date(),
        };
        const vendorProfile: Omit<VendorProfile, 'id'> = {
            businessName: businessName || `${firstName}'s Business`,
            email,
            ownerId: userId,
            category: '',
            tagline: '',
            description: '',
            phone: '',
            createdAt: new Date(),
        };

        const batch = writeBatch(db);
        
        const userDocRef = doc(db, 'users', userId);
        batch.set(userDocRef, userProfile);

        const vendorDocRef = doc(db, 'vendors', userId);
        batch.set(vendorDocRef, vendorProfile);

        // Mark code as used
        const codeDocRef = doc(db, 'vendorCodes', codeDoc.id);
        batch.update(codeDocRef, { isUsed: true, usedBy: userId });

        await batch.commit();

        return { userId, role: 'vendor' };
    } else {
        throw new Error("Invalid account type specified.");
    }
}


// In a real app, this would also verify password. For now, it just finds a user by email.
export async function signInUser(email: string): Promise<{ role: 'client' | 'vendor' | 'admin'; userId: string } | null> {
    
    // Hardcoded admin check
    if (email.toLowerCase() === 'admin@tradecraft.com') {
        return { role: 'admin', userId: 'admin-user' };
    }
    
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
             if (email.toLowerCase() === 'admin@tradecraft.com') return { role: 'admin', userId: 'admin-user' };
            if (email.startsWith('vendor')) return { role: 'vendor', userId: email };
            if (email.startsWith('client')) return { role: 'client', userId: email };
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
            const createdAt = data.createdAt?.toDate() || new Date();
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
    await setDoc(docRef, { ...data }, { merge: true });
}


export async function getVendorProfile(vendorId: string): Promise<VendorProfile | null> {
    if (!vendorId) return null;
    try {
        const docRef = doc(db, 'vendors', vendorId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            const createdAt = data.createdAt?.toDate() || new Date();
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
    await setDoc(docRef, { ...data }, { merge: true });
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
async function fetchCollection<T extends {id: string}>(path: string, q?: any, transform?: (data: DocumentData) => T): Promise<T[]> {
    try {
        const querySnapshot = await getDocs(q || collection(db, path));
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
    await addDoc(collection(db, collectionName), item);
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

// Admin Services
export async function generateVendorCode(): Promise<VendorCode> {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newCode: Omit<VendorCode, 'id'> = {
        code,
        isUsed: false,
        createdAt: new Date()
    };
    const docRef = await addDoc(collection(db, 'vendorCodes'), newCode);
    return { id: docRef.id, ...newCode };
}

export async function getVendorCodes(): Promise<VendorCode[]> {
    const q = query(collection(db, 'vendorCodes'), orderBy('createdAt', 'desc'));
    return await fetchCollection<VendorCode>('vendorCodes', q, (data) => ({
        ...data,
        createdAt: data.createdAt.toDate(),
    } as VendorCode));
}

export async function resetAllPasswords() {
    // This is a placeholder for a real password reset flow.
    // In a real Firebase app, you would trigger password reset emails using the Firebase Admin SDK.
    // Since we don't have real auth, this function doesn't do anything to the database.
    console.log("Simulating password reset for all users.");
    // For demonstration, we can clear all users and vendors, but this is destructive.
    //
    // const usersSnapshot = await getDocs(collection(db, "users"));
    // const vendorsSnapshot = await getDocs(collection(db, "vendors"));
    // const batch = writeBatch(db);
    // usersSnapshot.forEach(doc => batch.delete(doc.ref));
    // vendorsSnapshot.forEach(doc => batch.delete(doc.ref));
    // await batch.commit();
    
    return { success: true, message: "Password reset simulation complete. In a real app, emails would be sent." };
}
