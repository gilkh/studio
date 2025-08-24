
'use server';

import { collection, getDocs } from 'firebase/firestore';
import { admin, db } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';

export async function sendPushNotification(target: 'all' | 'clients' | 'vendors', title: string, body: string) {
    try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        let targetUsers = usersSnapshot.docs;

        if (target === 'clients') {
            const vendorsSnapshot = await getDocs(collection(db, "vendors"));
            const vendorIds = new Set(vendorsSnapshot.docs.map(doc => doc.id));
            targetUsers = usersSnapshot.docs.filter(doc => !vendorIds.has(doc.id));
        } else if (target === 'vendors') {
            const vendorsSnapshot = await getDocs(collection(db, "vendors"));
            const vendorIds = new Set(vendorsSnapshot.docs.map(doc => doc.id));
            targetUsers = usersSnapshot.docs.filter(doc => vendorIds.has(doc.id));
        }

        const tokens: string[] = [];
        targetUsers.forEach(doc => {
            const data = doc.data() as UserProfile;
            if (data.fcmTokens && Array.isArray(data.fcmTokens)) {
                tokens.push(...data.fcmTokens);
            }
        });

        if (tokens.length === 0) {
            console.log("No FCM tokens found for the selected target group.");
            return { success: false, message: "No devices to send to." };
        }
        
        // Ensure admin is initialized
        const fcm = admin.messaging();

        const message = {
            notification: { title, body },
            tokens: [...new Set(tokens)], // Remove duplicate tokens
        };

        const response = await fcm.sendEachForMulticast(message);
        console.log(`${response.successCount} messages were sent successfully`);
        
        if (response.failureCount > 0) {
            console.warn("Failed to send to some devices", response.responses);
        }

        return { success: true, message: `${response.successCount} notifications sent.` };

    } catch (error) {
        console.error('Error sending push notification:', error);
        throw error;
    }
}
