

























import { collection, doc, getDoc, setDoc, updateDoc, getDocs, query, where, DocumentData, deleteDoc, addDoc, serverTimestamp, orderBy, onSnapshot, limit, increment, writeBatch, runTransaction, arrayUnion, arrayRemove,getCountFromServer } from 'firebase/firestore';
import { db } from './firebase';
import type { UserProfile, VendorProfile, Service, Offer, QuoteRequest, Booking, SavedTimeline, ServiceOrOffer, VendorCode, Chat, ChatMessage, ForwardedItem, MediaItem, UpgradeRequest, VendorAnalyticsData, PlatformAnalytics, Review, LineItem } from './types';
import { formatItemForMessage, formatQuoteResponseMessage, parseForwardedMessage } from './utils';
import { hashPassword, verifyPassword } from './crypto';
import { subMonths, format, startOfMonth } from 'date-fns';

export async function createNewUser(data: {
    accountType: 'client' | 'vendor';
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    businessName?: string;
    vendorCode?: string;
    avatar?: string;
}) {
    const { accountType, firstName, lastName, email, password, businessName, vendorCode, avatar } = data;
    const userId = `${firstName.toLowerCase()}-${lastName.toLowerCase()}`.replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');

    if (!password) {
        throw new Error("Password is required to create a new user.");
    }
    
    // Hash the password securely before storing it.
    const hashedPassword = await hashPassword(password);

    const userProfile: Omit<UserProfile, 'id'> = {
        firstName,
        lastName,
        email,
        phone: '',
        createdAt: new Date(),
        savedItemIds: [],
        status: 'active',
        password: hashedPassword,
        avatar: avatar || '',
    };

    if (accountType === 'client') {
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

        const vendorProfile: Omit<VendorProfile, 'id'> = {
            businessName: businessName || `${firstName}'s Business`,
            email,
            ownerId: userId,
            category: 'Venues', // Default category
            tagline: '',
            description: '',
            phone: '',
            accountTier: 'free',
            createdAt: new Date(),
            status: 'active',
            rating: 0,
            reviewCount: 0,
            avatar: avatar || '',
            portfolio: [],
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


export async function signInUser(email: string, password?: string): Promise<{ role: 'client' | 'vendor' | 'admin'; userId: string } | null> {
    
    if (email.toLowerCase() === 'admin@tradecraft.com') {
        if (password === 'admin@tradecraft.com') {
            return { role: 'admin', userId: 'admin-user' };
        } else {
            return null; // Correct email, wrong password for admin
        }
    }
    
    try {
        const userQuery = query(collection(db, 'users'), where('email', '==', email));
        const userSnapshot = await getDocs(userQuery);
        
        if (userSnapshot.empty) {
            console.log(`No user found with email: ${email}`);
            return null; // No user found
        }
        
        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data() as UserProfile;
        
        if (!password || !userData.password) {
            console.warn(`Login attempt without password for user: ${email}`);
            return null;
        }

        const isPasswordCorrect = await verifyPassword(userData.password, password);

        if (!isPasswordCorrect) {
            console.warn(`Password mismatch for user: ${email}`);
            return null; // Invalid password
        }

        if (userData.status === 'disabled') {
            console.warn(`Login attempt for disabled user: ${email}`);
            throw new Error('Your account has been disabled. Please contact support.');
        }

        const userId = userDoc.id;
        const vendorCheck = await getDoc(doc(db, 'vendors', userId));

        if (vendorCheck.exists()) {
            const vendorData = vendorCheck.data() as VendorProfile;
            if (vendorData.status === 'disabled') {
                console.warn(`Login attempt for disabled vendor: ${email}`);
                throw new Error('Your account has been disabled. Please contact support.');
            }
            return { role: 'vendor', userId };
        }
        
        return { role: 'client', userId };

    } catch (e: any) {
        if (e.code === 'unavailable') {
            console.warn("Firestore is offline, cannot sign in.");
            return null;
        }
        console.error("Sign in error:", e.message);
        throw e; // Re-throw the error to be caught by the UI
    }
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
export const getServices = (vendorId?: string, count?: number) => {
    let q = query(collection(db, 'services'));
    if (vendorId) q = query(q, where('vendorId', '==', vendorId));
    if (count) q = query(q, limit(count));
    return fetchCollection<Service>('services', q);
}

export const getOffers = (vendorId?: string, count?: number) => {
    let q = query(collection(db, 'offers'));
    if (vendorId) q = query(q, where('vendorId', '==', vendorId));
    if (count) q = query(q, limit(count));
    return fetchCollection<Offer>('offers', q);
}


export const getServicesAndOffers = async (vendorId?: string, count?: number): Promise<ServiceOrOffer[]> => {
    const servicesQuery = collection(db, 'services');
    const offersQuery = collection(db, 'offers');

    const queries = [];

    if (vendorId) {
        queries.push(query(servicesQuery, where('vendorId', '==', vendorId)));
        queries.push(query(offersQuery, where('vendorId', '==', vendorId)));
    } else {
        queries.push(query(servicesQuery));
        queries.push(query(offersQuery));
    }
    
    if (count) {
        queries[0] = query(queries[0], limit(count));
        queries[1] = query(queries[1], limit(count));
    }
    
    try {
        const [servicesSnapshot, offersSnapshot] = await Promise.all([
            getDocs(queries[0]),
            getDocs(queries[1])
        ]);

        const services = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
        const offers = offersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Offer));
        
        let combined = [...services, ...offers];
        if (count) {
            // This sort is arbitrary for now, can be improved with timestamps
            combined = combined.slice(0, count);
        }
        return combined;
    } catch(e) {
         console.warn(`Firebase error getting services/offers:`, e);
        if ((e as any).code === 'unavailable') {
            return [];
        }
        throw e;
    }
}

export async function getServiceOrOfferById(id: string): Promise<ServiceOrOffer | null> {
    if (!id) return null;
    try {
        // Check services collection first
        let docRef = doc(db, 'services', id);
        let docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Service;
        }

        // If not found in services, check offers collection
        docRef = doc(db, 'offers', id);
        docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Offer;
        }
        
        // If not found in either
        return null;

    } catch (e) {
        console.warn(`Firebase error getting item by ID ${id}:`, e);
        if ((e as any).code === 'unavailable') {
            return null;
        }
        throw e;
    }
}


export async function createServiceOrOffer(item: Omit<Service, 'id'> | Omit<Offer, 'id'>) {
    const collectionName = item.type === 'service' ? 'services' : 'offers';
    await addDoc(collection(db, collectionName), {
        ...item,
        rating: 0,
        reviewCount: 0,
    });
}

export async function updateServiceOrOffer(itemId: string, itemData: Partial<ServiceOrOffer>) {
    const docRef = doc(db, itemData.type === 'service' ? 'services' : 'offers', itemId);
    await updateDoc(docRef, itemData);
}

export async function deleteServiceOrOffer(itemId: string, itemType: 'service' | 'offer') {
    const docRef = doc(db, itemType, itemId);
    await deleteDoc(docRef);
}


// Quote Request Services
export async function createQuoteRequest(request: Omit<QuoteRequest, 'id'| 'status' | 'createdAt'> & { item: ServiceOrOffer }) {
    const { message, item, ...restOfRequest } = request;
    
    const formattedMessage = formatItemForMessage(item, message, true, request);

    const chatId = [request.clientId, request.vendorId].sort().join('_');
    const chatRef = doc(db, 'chats', chatId);

    try {
        await runTransaction(db, async (transaction) => {
            const chatSnap = await transaction.get(chatRef);
            const otherParticipantId = request.vendorId;

            if (!chatSnap.exists()) {
                const clientProfile = await getUserProfile(request.clientId);
                const vendorProfile = await getVendorProfile(request.vendorId);
        
                const newChat: Omit<Chat, 'id'> = {
                    participantIds: [request.clientId, request.vendorId],
                    participants: [
                        { id: request.clientId, name: `${clientProfile?.firstName} ${clientProfile?.lastName}`, avatar: clientProfile?.avatar || '' },
                        { id: request.vendorId, name: vendorProfile?.businessName || 'Vendor', avatar: vendorProfile?.avatar || '' }
                    ],
                    lastMessage: formattedMessage,
                    lastMessageTimestamp: new Date(),
                    lastMessageSenderId: request.clientId,
                    unreadCount: { [otherParticipantId]: 1 }
                }
                transaction.set(chatRef, newChat);
            } else {
                 transaction.update(chatRef, { 
                    lastMessage: formattedMessage,
                    lastMessageTimestamp: new Date(),
                    lastMessageSenderId: request.clientId,
                    [`unreadCount.${otherParticipantId}`]: increment(1)
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
                phone: data.phone || 'Not Provided',
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

export async function respondToQuote(requestId: string, vendorId: string, clientId: string, total: number, response: string, lineItems: LineItem[]) {
    const quoteRef = doc(db, 'quoteRequests', requestId);
    const chatId = [clientId, vendorId].sort().join('_');
    const chatRef = doc(db, 'chats', chatId);

    
    await runTransaction(db, async (transaction) => {
        const quoteSnap = await transaction.get(quoteRef);
        if (!quoteSnap.exists()) throw new Error("Quote request not found");
        const quoteData = quoteSnap.data() as QuoteRequest;

        const responseMessage = formatQuoteResponseMessage(requestId, quoteData.serviceTitle, quoteData.serviceTitle, lineItems, total, response);

        // 1. Update the quote request itself
        transaction.update(quoteRef, {
            status: 'responded',
            quotePrice: total,
            quoteResponse: response,
            lineItems: lineItems
        });
        
        // 2. Send a message to the chat
        const messagesRef = collection(db, `chats/${chatId}/messages`);
        const newMessage: Omit<ChatMessage, 'id'> = {
            senderId: vendorId,
            text: responseMessage,
            timestamp: new Date()
        };
        transaction.set(doc(messagesRef), newMessage);
        
        // 3. Update the chat's last message info
        transaction.update(chatRef, {
            lastMessage: responseMessage,
            lastMessageTimestamp: newMessage.timestamp,
            lastMessageSenderId: vendorId,
            [`unreadCount.${clientId}`]: increment(1)
        });
    });
}


export async function approveQuote(quoteRequestId: string) {
    const quoteRef = doc(db, 'quoteRequests', quoteRequestId);
    
    await runTransaction(db, async(transaction) => {
        const quoteSnap = await transaction.get(quoteRef);
        if (!quoteSnap.exists()) throw new Error("Quote request not found");

        const quote = quoteSnap.data() as QuoteRequest;
        
        if (quote.status !== 'responded') throw new Error("This quote has already been actioned.");

        // Update quote status
        transaction.update(quoteRef, { status: 'approved' });

        // Create booking
        const service = await getServiceOrOfferById(quote.serviceId);
        if (!service) throw new Error("Original service/offer not found");

        const bookingData: Omit<Booking, 'id'> = {
            title: quote.serviceTitle,
            with: quote.clientName,
            clientId: quote.clientId,
            vendorId: quote.vendorId,
            date: new Date(quote.eventDate),
            time: 'N/A', // Time not captured in quote, can be updated later
            serviceId: quote.serviceId,
            serviceType: service.type,
        };
        const bookingRef = doc(collection(db, 'bookings'));
        transaction.set(bookingRef, bookingData);
    });
}


// Booking Services
export async function createBooking(booking: Omit<Booking, 'id'>) {
    const offer = await getServiceOrOfferById(booking.serviceId);
    if (!offer) throw new Error("Service or offer not found");

    const bookingWithDetails = {
        ...booking,
        serviceId: offer.id,
        serviceType: offer.type,
    }

    await addDoc(collection(db, 'bookings'), bookingWithDetails);
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
export async function getSavedItems(userId: string, countOnly = false): Promise<ServiceOrOffer[] | number> {
    if (!userId) return countOnly ? 0 : [];
    const user = await getUserProfile(userId);
    if (!user || !user.savedItemIds || user.savedItemIds.length === 0) {
        return countOnly ? 0 : [];
    }

    if (countOnly) {
        return user.savedItemIds.length;
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

// Review Services
export async function createReview(reviewData: Omit<Review, 'id' | 'createdAt'>) {
    const { vendorId, serviceId, rating } = reviewData;

    const reviewRef = collection(db, 'reviews');
    const vendorRef = doc(db, 'vendors', vendorId);
    
    // The serviceId could be for a service OR an offer, we need to check both
    const serviceDocRef = doc(db, 'services', serviceId);
    const offerDocRef = doc(db, 'offers', serviceId);


    try {
        await runTransaction(db, async (transaction) => {
            const vendorDoc = await transaction.get(vendorRef);
            const serviceDoc = await transaction.get(serviceDocRef);
            const offerDoc = await transaction.get(offerDocRef);

            if (!vendorDoc.exists()) throw new Error("Vendor not found!");
            
            const listingDoc = serviceDoc.exists() ? serviceDoc : offerDoc.exists() ? offerDoc : null;
            if (!listingDoc) throw new Error("Service/Offer not found!");
            
            const vendorData = vendorDoc.data() as VendorProfile;
            const listingData = listingDoc.data() as ServiceOrOffer;

            // Add the new review
            const newReview = { ...reviewData, createdAt: serverTimestamp() };
            transaction.set(doc(reviewRef), newReview);

            // Update vendor's aggregate rating
            const newVendorReviewCount = (vendorData.reviewCount || 0) + 1;
            const newVendorRating = ((vendorData.rating || 0) * (vendorData.reviewCount || 0) + rating) / newVendorReviewCount;
            transaction.update(vendorRef, { 
                reviewCount: newVendorReviewCount,
                rating: newVendorRating 
            });

            // Update service's/offer's aggregate rating
            const newListingReviewCount = (listingData.reviewCount || 0) + 1;
            const newListingRating = ((listingData.rating || 0) * (listingData.reviewCount || 0) + rating) / newListingReviewCount;
            transaction.update(listingDoc.ref, { 
                reviewCount: newListingReviewCount, 
                rating: newListingRating 
            });
        });
    } catch (e) {
        console.error("Review creation transaction failed: ", e);
        throw e;
    }
}

export async function getReviewsForVendor(vendorId: string): Promise<Review[]> {
    if (!vendorId) return [];
    const q = query(collection(db, 'reviews'), where('vendorId', '==', vendorId), orderBy('createdAt', 'desc'));
    const transform = (data: DocumentData): Review => ({
        id: data.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
    } as Review);
    const reviews = await fetchCollection<Review>('reviews', q, transform);
    return reviews.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());
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
            rating: vendorData?.rating,
            reviewCount: vendorData?.reviewCount,
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

export async function updateUserPassword(userId: string, newPassword: string): Promise<void> {
    const hashedPassword = await hashPassword(newPassword);
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { password: hashedPassword });
}

export async function changeUserPassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const userProfile = await getUserProfile(userId);
    if (!userProfile || !userProfile.password) {
        throw new Error("User not found or password not set.");
    }

    const isOldPasswordCorrect = await verifyPassword(userProfile.password, oldPassword);

    if (!isOldPasswordCorrect) {
        throw new Error("The current password you entered is incorrect.");
    }

    await updateUserPassword(userId, newPassword);
}

export async function createUpgradeRequest(request: Omit<UpgradeRequest, 'id'| 'requestedAt' | 'status'>) {
  const docRef = await addDoc(collection(db, 'upgradeRequests'), {
    ...request,
    requestedAt: serverTimestamp(),
    status: 'pending',
  });
  return docRef.id;
}

export async function getUpgradeRequests(): Promise<UpgradeRequest[]> {
    const q = query(collection(db, 'upgradeRequests'), where('status', '==', 'pending'));
    const transform = (data: DocumentData): UpgradeRequest => ({
        id: data.id,
        vendorId: data.vendorId,
        vendorName: data.vendorName,
        currentTier: data.currentTier,
        phone: data.phone,
        status: data.status,
        requestedAt: data.requestedAt?.toDate ? data.requestedAt.toDate() : new Date(),
    });
    return await fetchCollection<UpgradeRequest>('upgradeRequests', q, transform);
}

export async function getVendorAnalytics(vendorId: string): Promise<VendorAnalyticsData[]> {
  if (!vendorId) return [];
  
  try {
    const [quotes, bookings] = await Promise.all([
        getVendorQuoteRequests(vendorId),
        getBookingsForVendor(vendorId)
    ]);
    
    const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5));

    const quotesInDateRange = quotes.filter(q => {
        const createdAtDate = q.createdAt instanceof Date ? q.createdAt : q.createdAt.toDate();
        return createdAtDate >= sixMonthsAgo;
    });

    const bookingsInDateRange = bookings.filter(b => {
        const bookingDate = b.date instanceof Date ? b.date : b.date.toDate();
        return bookingDate >= sixMonthsAgo;
    });
    

    const monthlyData: { [key: string]: { quotes: number; bookings: number } } = {};

    // Initialize last 6 months
    for (let i = 0; i < 6; i++) {
      const monthDate = subMonths(new Date(), i);
      const monthKey = format(monthDate, 'MMM');
      monthlyData[monthKey] = { quotes: 0, bookings: 0 };
    }

    quotesInDateRange.forEach(q => {
      const createdAtDate = q.createdAt instanceof Date ? q.createdAt : q.createdAt.toDate();
      const monthKey = format(createdAtDate, 'MMM');
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].quotes++;
      }
    });

    bookingsInDateRange.forEach(b => {
      const date = b.date instanceof Date ? b.date : b.date.toDate();
      const monthKey = format(date, 'MMM');
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].bookings++;
      }
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({ month, ...data }))
      .reverse(); // To have the current month last

  } catch (e) {
    console.warn("Firebase error getting vendor analytics:", e);
    if ((e as any).code === 'unavailable') {
      return [];
    }
    throw e;
  }
}


export async function getPlatformAnalytics(): Promise<PlatformAnalytics> {
    const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5));

    try {
        const [usersSnapshot, vendorsSnapshot, bookingsSnapshot, recentUsersSnapshot, recentVendorsSnapshot] = await Promise.all([
            getCountFromServer(collection(db, "users")),
            getCountFromServer(collection(db, "vendors")),
            getCountFromServer(collection(db, "bookings")),
            getDocs(query(collection(db, "users"), where("createdAt", ">=", sixMonthsAgo))),
            getDocs(query(collection(db, "vendors"), where("createdAt", ">=", sixMonthsAgo)))
        ]);

        const monthlyData: { [key: string]: { Clients: number; Vendors: number } } = {};

        // Initialize last 6 months
        for (let i = 0; i < 6; i++) {
            const monthDate = subMonths(new Date(), i);
            const monthKey = format(monthDate, 'MMM');
            monthlyData[monthKey] = { Clients: 0, Vendors: 0 };
        }

        const vendorIds = new Set(recentVendorsSnapshot.docs.map(d => d.id));

        recentUsersSnapshot.forEach(doc => {
            const data = doc.data() as UserProfile;
            if (data.createdAt) { // Defensive check
                const createdAtDate = data.createdAt instanceof Date ? data.createdAt : data.createdAt.toDate();
                const monthKey = format(createdAtDate, 'MMM');
                if (monthlyData[monthKey]) {
                    if (vendorIds.has(doc.id)) {
                        monthlyData[monthKey].Vendors++;
                    } else {
                        monthlyData[monthKey].Clients++;
                    }
                }
            }
        });

        const userSignups = Object.entries(monthlyData)
            .map(([month, data]) => ({ month, ...data }))
            .reverse();
            
        return {
            totalUsers: usersSnapshot.data().count,
            totalVendors: vendorsSnapshot.data().count,
            totalBookings: bookingsSnapshot.data().count,
            userSignups,
        };

    } catch (e) {
        console.warn("Firebase error getting platform analytics:", e);
        if ((e as any).code === 'unavailable') {
            return { totalUsers: 0, totalVendors: 0, totalBookings: 0, userSignups: [] };
        }
        throw e;
    }
}


// --- Real-time Messaging Services ---

export function getChatsForUser(userId: string | undefined, callback: (chats: Chat[]) => void): () => void {
    let q;
    if (userId) {
        q = query(collection(db, 'chats'), where('participantIds', 'array-contains', userId));
    } else {
        // For admin, get all chats
        q = query(collection(db, 'chats'));
    }
    
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

    const chatRef = doc(db, 'chats', chatId);
    const messagesRef = collection(db, `chats/${chatId}/messages`);
    
    const newMessage: Omit<ChatMessage, 'id'> = {
        senderId,
        text,
        timestamp: new Date()
    };
    
    try {
        await runTransaction(db, async (transaction) => {
            const chatSnap = await transaction.get(chatRef);
            if (!chatSnap.exists()) {
                throw new Error("Chat does not exist!");
            }
            const chatData = chatSnap.data() as Chat;
            const otherParticipantId = chatData.participantIds.find(id => id !== senderId);

            if (!otherParticipantId) {
                throw new Error("Could not find other participant in chat");
            }

            const isForwarded = parseForwardedMessage(text);
            let lastMessageText = text;

            if (isForwarded?.isQuoteRequest) {
                 lastMessageText = "You sent a quote request."
            } else if (isForwarded) {
                 lastMessageText = "You forwarded an item."
            }

            // Add new message
            transaction.set(doc(messagesRef), newMessage);

            // Update chat document
            transaction.update(chatRef, {
                lastMessage: lastMessageText,
                lastMessageTimestamp: newMessage.timestamp,
                lastMessageSenderId: senderId,
                [`unreadCount.${otherParticipantId}`]: increment(1)
            });
        });
    } catch (error) {
        console.error("Transaction failed: ", error);
        throw error;
    }
}


export async function markChatAsRead(chatId: string, userId: string) {
    if (!chatId || !userId) return;
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
        [`unreadCount.${userId}`]: 0
    });
}
