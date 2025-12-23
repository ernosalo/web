
/**
 * ERA TYCOON CRYPTOGRAPHY MODULE
 * Standardized on V15 encryption protocol for full archive interoperability.
 */

const CIPHER_KEY = [0x54, 0x65, 0x6D, 0x70, 0x6F, 0x72, 0x61, 0x6C];

/**
 * Standard V15 Pack logic.
 * String -> URI Component -> XOR Scramble -> Base64
 */
export const pack = (str: string): string => {
  try {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(encodeURIComponent(str));
    const scrambled = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) {
      scrambled[i] = bytes[i] ^ CIPHER_KEY[i % CIPHER_KEY.length];
    }
    let binaryString = '';
    for (let i = 0; i < scrambled.length; i++) {
      binaryString += String.fromCharCode(scrambled[i]);
    }
    return btoa(binaryString);
  } catch (e) {
    console.error("Cryptographic pack failed", e);
    return "";
  }
};

/**
 * Standard V15 Unpack logic with multi-mode recovery.
 * Supports URI-encoded and raw variants of the V15 protocol.
 */
export const unpack = (str: string): string => {
  if (!str) return "";

  const performUnpack = (input: string, useURI: boolean): string | null => {
    try {
      // Input sanitization: V15 archives can sometimes contain newlines or spaces
      const cleaned = input.trim().replace(/\s/g, '');
      const binaryString = atob(cleaned);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i) ^ CIPHER_KEY[i % CIPHER_KEY.length];
      }
      const decodedString = new TextDecoder().decode(bytes);
      return useURI ? decodeURIComponent(decodedString) : decodedString;
    } catch (e) {
      return null;
    }
  };

  // 1. Try URI-encoded (Official V15 standard)
  let result = performUnpack(str, true);
  if (result) return result;

  // 2. Try raw string (Legacy developer variant)
  result = performUnpack(str, false);
  if (result) return result;

  return "";
};
