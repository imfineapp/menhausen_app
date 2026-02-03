/**
 * Ed25519 Signature Utilities for Premium Status
 * 
 * Provides functions for generating Ed25519 key pairs, signing data,
 * and verifying signatures using Web Crypto API (available in Deno)
 */

export interface Ed25519KeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

export interface Ed25519KeyPairRaw {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

/**
 * Generate Ed25519 key pair
 * 
 * @returns Ed25519 key pair (public and private keys)
 */
export async function generateEd25519KeyPair(): Promise<Ed25519KeyPair> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'Ed25519',
    },
    true, // extractable
    ['sign', 'verify']
  );

  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
  };
}

/**
 * Export Ed25519 key pair to base64 strings for storage
 * 
 * @param keyPair - Ed25519 key pair
 * @returns Base64-encoded key pair strings
 */
export async function exportEd25519KeyPairBase64(
  keyPair: Ed25519KeyPair
): Promise<{ publicKey: string; privateKey: string }> {
  // Export public key as raw (32 bytes)
  const publicKeyRaw = await crypto.subtle.exportKey('raw', keyPair.publicKey);
  const publicKeyBase64 = uint8ArrayToBase64(new Uint8Array(publicKeyRaw));

  // Export private key as PKCS8 (for storage)
  const privateKeyRaw = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
  const privateKeyBase64 = uint8ArrayToBase64(new Uint8Array(privateKeyRaw));

  return {
    publicKey: publicKeyBase64,
    privateKey: privateKeyBase64,
  };
}

/**
 * Import Ed25519 key pair from base64 strings
 * 
 * @param publicKeyBase64 - Base64-encoded public key (raw format)
 * @param privateKeyBase64 - Base64-encoded private key (PKCS8 format)
 * @returns Ed25519 key pair (CryptoKey)
 */
export async function importEd25519KeyPairBase64(
  publicKeyBase64: string,
  privateKeyBase64: string
): Promise<Ed25519KeyPair> {
  // Import public key from raw format
  const publicKeyBytes = base64ToUint8Array(publicKeyBase64);
  const publicKeyBuffer = new ArrayBuffer(publicKeyBytes.length);
  new Uint8Array(publicKeyBuffer).set(publicKeyBytes);
  
  const publicKey = await crypto.subtle.importKey(
    'raw',
    publicKeyBuffer,
    {
      name: 'Ed25519',
    },
    true, // extractable
    ['verify']
  );

  // Import private key from PKCS8 format
  const privateKeyBytes = base64ToUint8Array(privateKeyBase64);
  const privateKeyBuffer = new ArrayBuffer(privateKeyBytes.length);
  new Uint8Array(privateKeyBuffer).set(privateKeyBytes);
  
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    privateKeyBuffer,
    {
      name: 'Ed25519',
    },
    true, // extractable
    ['sign']
  );

  return {
    publicKey,
    privateKey,
  };
}

/**
 * Sign data with Ed25519 private key
 * 
 * @param privateKey - Ed25519 private key (CryptoKey)
 * @param data - Data to sign (string or Uint8Array)
 * @returns Signature (Uint8Array, 64 bytes)
 */
export async function signEd25519(
  privateKey: CryptoKey,
  data: string | Uint8Array
): Promise<Uint8Array> {
  const dataBytes = typeof data === 'string'
    ? new TextEncoder().encode(data)
    : data;

  // Create ArrayBuffer for data
  const dataBuffer = new ArrayBuffer(dataBytes.length);
  new Uint8Array(dataBuffer).set(dataBytes);

  const signature = await crypto.subtle.sign(
    {
      name: 'Ed25519',
    },
    privateKey,
    dataBuffer
  );

  return new Uint8Array(signature);
}

/**
 * Verify Ed25519 signature
 * 
 * @param publicKey - Ed25519 public key (CryptoKey)
 * @param signature - Signature to verify (Uint8Array or base64 string)
 * @param data - Original data (string or Uint8Array)
 * @returns true if signature is valid
 */
export async function verifyEd25519(
  publicKey: CryptoKey,
  signature: Uint8Array | string,
  data: string | Uint8Array
): Promise<boolean> {
  const signatureBytes = typeof signature === 'string'
    ? base64ToUint8Array(signature)
    : signature;

  const dataBytes = typeof data === 'string'
    ? new TextEncoder().encode(data)
    : data;

  // Create ArrayBuffers for signature and data
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
    console.error('[ed25519-utils] Signature verification error:', error);
    return false;
  }
}

/**
 * Convert Uint8Array to base64 string
 * 
 * @param bytes - Uint8Array to convert
 * @returns Base64 string
 */
export function uint8ArrayToBase64(bytes: Uint8Array): string {
  // Use Deno's built-in base64 encoding
  return btoa(String.fromCharCode(...bytes));
}

/**
 * Convert base64 string to Uint8Array
 * 
 * @param base64 - Base64 string to convert
 * @returns Uint8Array
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Sign premium status data
 * 
 * @param privateKey - Ed25519 private key (CryptoKey)
 * @param premiumData - Premium status data object
 * @returns Base64-encoded signature
 */
export async function signPremiumData(
  privateKey: CryptoKey,
  premiumData: {
    premium: boolean;
    plan?: string;
    expiresAt?: string;
    purchasedAt?: string;
    timestamp: number;
  }
): Promise<string> {
  // Create canonical JSON string for signing
  const dataString = JSON.stringify(premiumData);
  
  // Sign the data
  const signature = await signEd25519(privateKey, dataString);
  
  // Return base64-encoded signature
  return uint8ArrayToBase64(signature);
}

/**
 * Verify premium status signature
 * 
 * @param publicKey - Ed25519 public key (CryptoKey)
 * @param signature - Base64-encoded signature
 * @param premiumData - Premium status data object
 * @returns true if signature is valid
 */
export async function verifyPremiumDataSignature(
  publicKey: CryptoKey,
  signature: string,
  premiumData: {
    premium: boolean;
    plan?: string;
    expiresAt?: string;
    purchasedAt?: string;
    timestamp: number;
  }
): Promise<boolean> {
  // Create canonical JSON string (same as signing)
  const dataString = JSON.stringify(premiumData);
  
  // Verify the signature
  return await verifyEd25519(publicKey, signature, dataString);
}
