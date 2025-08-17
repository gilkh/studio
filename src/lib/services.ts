

import { collection, doc, getDoc, setDoc, updateDoc, getDocs, query, where, DocumentData, deleteDoc, addDoc, serverTimestamp, orderBy, arrayUnion, arrayRemove, writeBatch, runTransaction, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import type { UserProfile, VendorProfile, Service, Offer, QuoteRequest, Booking, SavedTimeline, ServiceOrOffer, VendorCode, Chat, ChatMessage, ForwardedItem } from './types';
import { formatItemForMessage } from './utils';

export async function createNewUser(data: {
    accountType: 'client' | 'vendor';
    firstName: string;
    lastName: string;
    email: string;
    businessName?: string;
    vendorCode?: string;
}) {
    const { accountType, firstName, lastName, email, businessName, vendorCode } = data;
    const userId = `${firstName.toLowerCase()}-${lastName.toLowerCase()}`.replace(/\s+/g, '-');

    if (accountType === 'client') {
        const userProfile: Omit<UserProfile, 'id'> = {
            firstName,
            lastName,
            email,
            phone: '',
            createdAt: new Date(),
            savedItemIds: [],
            status: 'active',
        };
        await setDoc(doc(db, 'users', userId), userProfile);
        return { userId, role: 'client' };
    } else if (accountType === 'vendor') {
        if (!vendorCode) {
            throw new Error("A valid vendor code is required to register as a vendor.");
        }

        const codeQuery = query(collection(db, 'vendorCodes'), where('code', '==', vendorCode), where('isUsed', '==', false));
        const codeSnapshot = await getDocs(codeQuery);

        if (codeSnapshot.empty) {
            throw new Error("Invalid or already used vendor code.");
        }
        
        const codeDoc = codeSnapshot.docs[0];

        const userProfile: Omit<UserProfile, 'id'> = {
            firstName,
            lastName,
            email,
            phone: '',
            createdAt: new Date(),
            status: 'active',
        };
        const vendorProfile: Omit<VendorProfile, 'id'> = {
            businessName: businessName || `${firstName}'s Business`,
            email,
            ownerId: userId,
            category: '',
            tagline: '',
            description: '',
            phone: '',
            accountTier: 'free',
            createdAt: new Date(),
            status: 'active',
        };

        const batch = writeBatch(db);
        
        const userDocRef = doc(db, 'users', userId);
        batch.set(userDocRef, userProfile);

        const vendorDocRef = doc(db, 'vendors', userId);
        batch.set(vendorDocRef, vendorProfile);

        const codeDocRef = doc(db, 'vendorCodes', codeDoc.id);
        batch.update(codeDocRef, { isUsed: true, usedBy: userId, usedAt: new Date() });

        await batch.commit();

        return { userId, role: 'vendor' };
    } else {
        throw new Error("Invalid account type specified.");
    }
}


// In a real app, this would also verify password. For now, it just finds a user by email.
export async function signInUser(email: string): Promise<{ role: 'client' | 'vendor' | 'admin'; userId: string } | null> {
    
    if (email.toLowerCase() === 'admin@tradecraft.com') {
        return { role: 'admin', userId: 'admin-user' };
    }
    
    try {
        const userQuery = query(collection(db, 'users'), where('email', '==', email));
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
             const userDoc = userSnapshot.docs[0];
             const userData = userDoc.data() as UserProfile;

             if (userData.status === 'disabled') {
                 console.warn(`Login attempt for disabled user: ${email}`);
                 return null;
             }

             const userId = userDoc.id;
             const vendorCheck = await getDoc(doc(db, 'vendors', userId));
             if (vendorCheck.exists()) {
                const vendorData = vendorCheck.data() as VendorProfile;
                 if (vendorData.status === 'disabled') {
                    console.warn(`Login attempt for disabled vendor: ${email}`);
                    return null;
                 }
                return { role: 'vendor', userId };
             }
             return { role: 'client', userId };
        }
    } catch (e) {
        if ((e as any).code === 'unavailable') {
            console.warn("Firestore is offline, cannot sign in.");
             if (email.toLowerCase() === 'admin@tradecraft.com') return { role: 'admin', userId: 'admin-user' };
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
            return {
                id: docSnap.id,
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
            } as UserProfile;
        }
    } catch (e) {
        console.warn("Firebase error getting user profile:", e);
        if ((e as any).code === 'unavailable') {
            return null;
        }
    }
    return null;
}

export async function createOrUpdateUserProfile(userId: string, data: Partial<Omit<UserProfile, 'id' | 'createdAt'>>) {
    if (!userId) return;
    const docRef = doc(db, 'users', userId);
    await setDoc(docRef, { ...data, lastModified: serverTimestamp() }, { merge: true });
}


export async function getVendorProfile(vendorId: string): Promise<VendorProfile | null> {
    if (!vendorId) return null;
    try {
        const docRef = doc(db, 'vendors', vendorId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date()
            } as VendorProfile;
        }
    } catch (e) {
        console.warn("Firebase error getting vendor profile:", e);
         if ((e as any).code === 'unavailable') {
            return null;
        }
    }
    return null;
}

export async function createOrUpdateVendorProfile(vendorId: string, data: Partial<Omit<VendorProfile, 'id' | 'createdAt'>>) {
    if (!vendorId) return;
     const docRef = doc(db, 'vendors', vendorId);
    await setDoc(docRef, { ...data, lastModified: serverTimestamp() }, { merge: true });
}

// Timeline Services
export async function getSavedTimelines(userId: string): Promise<SavedTimeline[]> {
    if (!userId) return [];
    try {
        const q = query(collection(db, `users/${userId}/timelines`));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavedTimeline));
    } catch(e) {
         console.warn(`Firebase error getting saved timelines:`, e);
        if ((e as any).code === 'unavailable') {
            return [];
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

async function fetchCollection<T extends {id: string}>(path: string, q?: any, transform?: (data: DocumentData) => T): Promise<T[]> {
    try {
        const querySnapshot = await getDocs(q || collection(db, path));
        return querySnapshot.docs.map(doc => {
            const data = { id: doc.id, ...doc.data() };
            return transform ? transform(data) : data as T;
        });
    } catch (e) {
        console.warn(`Firebase error fetching collection ${path}:`, e);
        if ((e as any).code === 'unavailable') {
            return []; 
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
export async function createQuoteRequest(request: Omit<QuoteRequest, 'id' | 'createdAt' | 'status'> & { item: ServiceOrOffer }) {
    const { message, item, ...restOfRequest } = request;
    
    const formattedMessage = formatItemForMessage(item, message);

    const chatId = [request.clientId, request.vendorId].sort().join('_');
    const chatRef = doc(db, 'chats', chatId);

    try {
        await runTransaction(db, async (transaction) => {
            const chatSnap = await transaction.get(chatRef);

            if (!chatSnap.exists()) {
                const clientProfile = await getUserProfile(request.clientId);
                const vendorProfile = await getVendorProfile(request.vendorId);
        
                const newChat: Omit<Chat, 'id'> = {
                    participantIds: [request.clientId, request.vendorId],
                    participants: [
                        { id: request.clientId, name: `${clientProfile?.firstName} ${clientProfile?.lastName}`, avatar: `https://i.pravatar.cc/150?u=${request.clientId}` },
                        { id: request.vendorId, name: vendorProfile?.businessName || 'Vendor', avatar: `https://i.pravatar.cc/150?u=${request.vendorId}` }
                    ],
                    lastMessage: formattedMessage,
                    lastMessageTimestamp: new Date(),
                    lastMessageSenderId: request.clientId
                }
                transaction.set(chatRef, newChat);
            } else {
                 transaction.update(chatRef, { 
                    lastMessage: formattedMessage,
                    lastMessageTimestamp: new Date(),
                    lastMessageSenderId: request.clientId
                });
            }

            // Add the formatted message to the chat
            const messagesRef = collection(db, `chats/${chatId}/messages`);
            const newMessage: Omit<ChatMessage, 'id'> = {
                senderId: request.clientId,
                text: formattedMessage,
                timestamp: new Date()
            };
            transaction.set(doc(messagesRef), newMessage);

            // Create the quote request document
            const quoteRef = collection(db, 'quoteRequests');
            const newQuoteRequest: Omit<QuoteRequest, 'id'> = {
                ...restOfRequest,
                serviceTitle: item.title,
                message: message, // Save the original, unformatted message here
                status: 'pending',
                createdAt: serverTimestamp()
            }
            transaction.set(doc(quoteRef), newQuoteRequest);
        });
    } catch (error) {
        console.error("Transaction failed: ", error);
        throw error;
    }
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
        console.warn("Firebase error getting quote requests:", e);
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
        console.warn("Firebase error getting user bookings:", e);
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
        console.warn("Firebase error getting vendor bookings:", e);
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
    
    const savedIds = user.savedItemIds.slice(0, 30);

    const allItems = await getServicesAndOffers();
    return allItems.filter(item => savedIds.includes(item.id));
}

export async function toggleSavedItem(userId: string, itemId: string) {
    if (!userId) return;
    const userRef = doc(db, 'users', userId);
    
    try {
        const userProfile = await getDoc(userRef);
    
        if (!userProfile.exists()) {
            await setDoc(userRef, { savedItemIds: [itemId] }, { merge: true });
            return;
        }
        
        const currentSaved = userProfile.data()?.savedItemIds || [];

        if (currentSaved.includes(itemId)) {
            await updateDoc(userRef, { savedItemIds: arrayRemove(itemId) });
        } else {
            await updateDoc(userRef, { savedItemIds: arrayUnion(itemId) });
        }
    } catch (error) {
        console.error("Error toggling saved item, creating user profile as fallback", error);
        await setDoc(userRef, { savedItemIds: [itemId] }, { merge: true });
    }
}

// Admin Services
export async function generateVendorCode(): Promise<VendorCode> {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase() + Math.random().toString(36).substring(2, 8).toUpperCase();
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
    const transform = (data: DocumentData): VendorCode => ({
        id: data.id,
        code: data.code,
        isUsed: data.isUsed,
        usedBy: data.usedBy,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        usedAt: data.usedAt?.toDate ? data.usedAt.toDate() : undefined,
    });
    return await fetchCollection<VendorCode>('vendorCodes', q, transform);
}

export async function deleteVendorCode(codeId: string) {
    if (!codeId) return;
    const docRef = doc(db, 'vendorCodes', codeId);
    await deleteDoc(docRef);
}


export async function getAllUsersAndVendors() {
    const usersSnapshot = await getDocs(collection(db, "users"));
    const vendorsSnapshot = await getDocs(collection(db, "vendors"));

    const vendorsData = new Map(vendorsSnapshot.docs.map(doc => [doc.id, { id: doc.id, ...doc.data()} as VendorProfile]));
    
    const allUsers = usersSnapshot.docs.map(doc => {
        const data = doc.data();
        const userData = { 
            id: doc.id, 
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        } as UserProfile;
        
        const vendorData = vendorsData.get(doc.id);

        return {
            ...userData,
            role: vendorData ? 'vendor' : 'client',
            businessName: vendorData?.businessName,
            accountTier: vendorData?.accountTier,
            status: userData.status,
        }
    });

    return allUsers;
}

export async function updateVendorTier(vendorId: string, tier: VendorProfile['accountTier']) {
    if (!vendorId) return;
    const vendorRef = doc(db, 'vendors', vendorId);
    await updateDoc(vendorRef, { accountTier: tier });
}

export async function updateUserStatus(userId: string, role: 'client' | 'vendor', status: 'active' | 'disabled') {
    const batch = writeBatch(db);
    const userRef = doc(db, 'users', userId);
    batch.update(userRef, { status });

    if (role === 'vendor') {
        const vendorRef = doc(db, 'vendors', userId);
        batch.update(vendorRef, { status });
    }
    await batch.commit();
}

export async function deleteUser(userId: string, role: 'client' | 'vendor') {
    const batch = writeBatch(db);
    const userRef = doc(db, 'users', userId);
    batch.delete(userRef);

    if (role === 'vendor') {
        const vendorRef = doc(db, 'vendors', userId);
        batch.delete(vendorRef);
    }
    // Note: In a real app, you would also need to delete associated data
    // like bookings, messages, timelines etc. This is a simplified version.
    await batch.commit();
}


export async function resetAllPasswords() {
    console.log("Simulating password reset for all users.");
    return { success: true, message: "Password reset simulation complete. In a real app, emails would be sent." };
}


// --- Real-time Messaging Services ---

export function getChatsForUser(userId: string, callback: (chats: Chat[]) => void): () => void {
    const q = query(collection(db, 'chats'), where('participantIds', 'array-contains', userId));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const chats = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                lastMessageTimestamp: data.lastMessageTimestamp.toDate(),
            } as Chat;
        }).sort((a,b) => b.lastMessageTimestamp.getTime() - a.lastMessageTimestamp.getTime());
        callback(chats);
    });

    return unsubscribe;
}

export function getMessagesForChat(chatId: string, callback: (messages: ChatMessage[]) => void): () => void {
    const q = query(collection(db, `chats/${chatId}/messages`), orderBy('timestamp', 'asc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messages = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                timestamp: data.timestamp.toDate(),
            } as ChatMessage;
        });
        callback(messages);
    });

    return unsubscribe;
}

export async function sendMessage(chatId: string, senderId: string, text: string) {
    if (!text.trim()) return;

    const messagesRef = collection(db, `chats/${chatId}/messages`);
    const newMessage: Omit<ChatMessage, 'id'> = {
        senderId,
        text,
        timestamp: new Date()
    };
    
    const chatRef = doc(db, 'chats', chatId);

    const batch = writeBatch(db);
    batch.set(doc(messagesRef), newMessage);
    batch.update(chatRef, {
        lastMessage: text,
        lastMessageTimestamp: newMessage.timestamp,
        lastMessageSenderId: senderId
    });

    await batch.commit();
}
