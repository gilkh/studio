// @ts-nocheck
'use server';
/**
 * This module handles password hashing and verification using the built-in Node.js crypto library.
 * NOTE: In a production-grade application, it's highly recommended to use a library like 'bcrypt'
 * which is specifically designed for password hashing and is more resistant to brute-force attacks.
 * This implementation uses crypto for demonstration purposes as external dependencies can't be added.
 */
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

/**
 * Hashes a plaintext password.
 * @param password The plaintext password to hash.
 * @returns A promise that resolves to the hashed password string (salt:key).
 */
export async function hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const key = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${salt}:${key.toString('hex')}`;
}

/**
 * Verifies a plaintext password against a stored hash.
 * @param storedPassword The hashed password string from the database (e.g., "salt:key").
 * @param suppliedPassword The plaintext password supplied by the user.
 * @returns A promise that resolves to true if the passwords match, false otherwise.
 */
export async function verifyPassword(storedPassword: string, suppliedPassword: string): Promise<boolean> {
    const [salt, key] = storedPassword.split(':');
    if (!salt || !key) {
        // This handles cases where the stored password is not in the expected format (e.g., old plaintext passwords)
        return false;
    }

    const suppliedKeyBuffer = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;
    const storedKeyBuffer = Buffer.from(key, 'hex');

    if (suppliedKeyBuffer.length !== storedKeyBuffer.length) {
        return false;
    }
    
    // Use timingSafeEqual to prevent timing attacks
    return timingSafeEqual(suppliedKeyBuffer, storedKeyBuffer);
}
