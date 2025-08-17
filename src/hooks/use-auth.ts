
'use client';

import { useState, useEffect } from 'react';

function getCookie(name: string) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
}


interface AuthInfo {
    userId: string | null;
    role: 'client' | 'vendor' | 'admin' | null;
    isLoading: boolean;
}

export function useAuth(): AuthInfo {
    const [authInfo, setAuthInfo] = useState<AuthInfo>({
        userId: null,
        role: null,
        isLoading: true,
    });

    useEffect(() => {
        // This code runs only on the client side
        try {
            const storedUserId = localStorage.getItem('userId');
            const storedRole = localStorage.getItem('role') as 'client' | 'vendor' | 'admin' | null;

            setAuthInfo({
                userId: storedUserId,
                role: storedRole,
                isLoading: false,
            });
        } catch (error) {
            console.error("Could not access localStorage. Auth state will be null.", error);
            setAuthInfo({ userId: null, role: null, isLoading: false });
        }
    }, []);

    return authInfo;
}

export function logout() {
    try {
        localStorage.removeItem('userId');
        localStorage.removeItem('role');
        // Clear cookie for middleware
        document.cookie = 'role=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    } catch (error) {
        console.error("Could not access localStorage to log out.", error);
    }
}
