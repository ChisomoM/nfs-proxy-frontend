// Using CryptoJS for encryption/decryption
import CryptoJS from "crypto-js";

export const Storage = {
  // Encryption secret key - in production, this should be stored securely
  ___: "ff7daf99552e8f884ae28079ba098ef62101bab59d68b160e15e3dde8a56ae9963b8f5618cbf42dce3d4e2b4c999a5c980b46c340be0cc28376e6a6d2462369a",

  // Helper method to encrypt data
  encrypt(data: string): string {
    return CryptoJS.AES.encrypt(data, this.___).toString();
    // return data;
  },

  // Helper method to decrypt data
  decrypt(encryptedData: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.___);
    return bytes.toString(CryptoJS.enc.Utf8);

    // return encryptedData;
  },

  // Store encrypted string data
  setItem(key: string, value: unknown): void {
    try {
      const stringValue = String(value);
      const encryptedValue = this.encrypt(stringValue);
      sessionStorage.setItem(key, encryptedValue);
    } catch {
      throw new Error("Failed to store encrypted data");  
    }
  },

  // Store encrypted JSON data
  setJSON(key: string, value: unknown): void {
    try {
      const jsonString = JSON.stringify(value);
      const encryptedValue = this.encrypt(jsonString);
      sessionStorage.setItem(key, encryptedValue);
    } catch {
      throw new Error("Failed to store encrypted JSON data");
    }
  },

  // Retrieve and decrypt string data
  getItem(key: string): string | null {
    try {
      const encryptedValue = sessionStorage.getItem(key);
      if (!encryptedValue) return null;

      return this.decrypt(encryptedValue);
    } catch {
      throw new Error("Failed to retrieve encrypted data");
    }
  },

  // Retrieve and decrypt JSON data
  getJSON<T>(key: string): T | null {
    try {
      const encryptedValue = sessionStorage.getItem(key);
      if (!encryptedValue) return null;

      const decryptedValue = this.decrypt(encryptedValue);
      return JSON.parse(decryptedValue) as T;
    } catch {
      throw new Error("Failed to retrieve encrypted JSON data");
    }
  },

  // Remove item using encrypted key
  removeItem(key: string): void {
    try {
      const encryptedKey = this.encrypt(key);
      sessionStorage.removeItem(encryptedKey);
    } catch {
      throw new Error("Failed to remove item");
    }
  },

  // Clear all storage
  clear(): void {
    sessionStorage.clear();
  },
};
