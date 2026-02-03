/**
 * Premium Status Signature Verification
 * 
 * Provides functions for verifying Ed25519 signatures of premium status data
 * Uses Web Crypto API available in modern browsers
 */

export interface PremiumSignatureData {
  data: {
    premium: boolean;
    plan?: string;
    expiresAt?: string;
    purchasedAt?: string;
    timestamp: number;
  };
  signature: string; // Base64 Ed25519 signature
  publicKey: string; // Base64 public key (raw format)
  version: number; // Key version
}

/**
 * Convert base64 string to Uint8Array
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Import Ed25519 public key from base64 string
 * 
 * @param publicKeyBase64 - Base64-encoded public key (raw format)
 * @returns CryptoKey for verification
 */
async function importEd25519PublicKey(publicKeyBase64: string): Promise<CryptoKey> {
  const publicKeyBytes = base64ToUint8Array(publicKeyBase64);

  // Create a new ArrayBuffer to ensure compatibility
  const buffer = new ArrayBuffer(publicKeyBytes.length);
  new Uint8Array(buffer).set(publicKeyBytes);

  const publicKey = await crypto.subtle.importKey(
    'raw',
    buffer,
    {
      name: 'Ed25519',
    },
    false, // not extractable
    ['verify']
  );

  return publicKey;
}

/**
 * Verify Ed25519 signature
 * 
 * @param publicKey - Ed25519 public key (CryptoKey)
 * @param signature - Signature to verify (base64 string or Uint8Array)
 * @param data - Original data (string or Uint8Array)
 * @returns true if signature is valid
 */
async function verifyEd25519Signature(
  publicKey: CryptoKey,
  signature: string | Uint8Array,
  data: string | Uint8Array
): Promise<boolean> {
  const signatureBytes = typeof signature === 'string'
    ? base64ToUint8Array(signature)
    : signature;

  const dataBytes = typeof data === 'string'
    ? new TextEncoder().encode(data)
    : data;

  // Create new ArrayBuffers to ensure compatibility
  const signatureBuffer = new ArrayBuffer(signatureBytes.length);
  new Uint8Array(signatureBuffer).set(signatureBytes);

  const dataBuffer = new ArrayBuffer(dataBytes.length);
  new Uint8Array(dataBuffer).set(dataBytes);

  try {
    const isValid = await crypto.subtle.verify(
      {
        name: 'Ed25519',
      },
      publicKey,
      signatureBuffer,
      dataBuffer
    );

    return isValid;
  } catch (error) {
    console.error('[premiumSignature] Signature verification error:', error);
    return false;
  }
}

/**
 * Verify premium status signature
 * 
 * @param signatureData - Premium signature data from server
 * @returns true if signature is valid
 */
export async function verifyPremiumSignature(
  signatureData: PremiumSignatureData
): Promise<boolean> {
  try {
    // Import public key
    const publicKey = await importEd25519PublicKey(signatureData.publicKey);

    // Create canonical JSON string (same format as server)
    const dataString = JSON.stringify(signatureData.data);

    // Verify signature
    const isValid = await verifyEd25519Signature(
      publicKey,
      signatureData.signature,
      dataString
    );

    if (!isValid) {
      console.warn('[premiumSignature] Invalid signature for premium data:', signatureData.data);
    }

    return isValid;
  } catch (error) {
    console.error('[premiumSignature] Error verifying premium signature:', error);
    return false;
  }
}

/**
 * Load premium signature from localStorage
 * 
 * @returns Premium signature data or null if not found/invalid
 */
export function loadPremiumSignatureFromStorage(): PremiumSignatureData | null {
  try {
    const stored = localStorage.getItem('premium-signature');
    if (!stored) {
      return null;
    }

    const signatureData = JSON.parse(stored) as PremiumSignatureData;

    // Validate structure
    if (
      !signatureData.data ||
      typeof signatureData.data.premium !== 'boolean' ||
      !signatureData.signature ||
      !signatureData.publicKey ||
      typeof signatureData.version !== 'number'
    ) {
      console.warn('[premiumSignature] Invalid signature data structure in localStorage');
      return null;
    }

    return signatureData;
  } catch (error) {
    console.error('[premiumSignature] Error loading signature from localStorage:', error);
    return null;
  }
}

/**
 * Save premium signature to localStorage
 * 
 * @param signatureData - Premium signature data to save
 */
export function savePremiumSignatureToStorage(signatureData: PremiumSignatureData): void {
  try {
    localStorage.setItem('premium-signature', JSON.stringify(signatureData));
  } catch (error) {
    console.error('[premiumSignature] Error saving signature to localStorage:', error);
  }
}

/**
 * Verify and load premium status from localStorage
 * 
 * @returns Premium status if signature is valid, null otherwise
 */
export async function getVerifiedPremiumStatus(): Promise<{
  premium: boolean;
  plan?: string;
  expiresAt?: string;
  purchasedAt?: string;
} | null> {
  const signatureData = loadPremiumSignatureFromStorage();
  if (!signatureData) {
    return null;
  }

  // Verify signature
  const isValid = await verifyPremiumSignature(signatureData);
  if (!isValid) {
    console.warn('[premiumSignature] Signature verification failed, clearing invalid data');
    localStorage.removeItem('premium-signature');
    return null;
  }

  // Check if data is expired (optional - can add expiration check here)
  // For now, we trust the timestamp from server

  return {
    premium: signatureData.data.premium,
    plan: signatureData.data.plan,
    expiresAt: signatureData.data.expiresAt,
    purchasedAt: signatureData.data.purchasedAt,
  };
}

/**
 * Check if Ed25519 is supported in this browser
 * 
 * @returns true if Ed25519 is supported
 */
export function isEd25519Supported(): boolean {
  try {
    // Check if Web Crypto API is available
    if (!crypto || !crypto.subtle) {
      return false;
    }

    // Check if Ed25519 is supported (try to generate a key)
    // Note: This is async, so we'll just check if the API exists
    // Actual support will be checked when trying to use it
    return typeof crypto.subtle.generateKey === 'function';
  } catch {
    return false;
  }
}
