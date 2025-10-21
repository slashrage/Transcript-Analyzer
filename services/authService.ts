// A simple, browser-based hashing utility for demonstration purposes.
// Uses the Web Crypto API available in modern browsers.

/**
 * Hashes a password using SHA-256.
 * @param password The plain-text password to hash.
 * @returns A promise that resolves to the hex-encoded hash string.
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Verifies a password against a stored hash.
 * @param password The plain-text password to verify.
 * @param storedHash The stored hash to compare against.
 * @returns A promise that resolves to true if the password is correct, false otherwise.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const hashOfInput = await hashPassword(password);
  return hashOfInput === storedHash;
}
