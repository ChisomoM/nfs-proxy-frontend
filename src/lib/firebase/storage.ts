// Firebase Storage utilities
// This is optional and can be removed if not needed
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
} from 'firebase/storage';
import { storage } from '../firebase';

export class FirebaseStorage {
  // Upload a file
  static async uploadFile(path: string, file: File) {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  }

  // Get download URL
  static async getFileURL(path: string) {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  }

  // Delete a file
  static async deleteFile(path: string) {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  }

  // List files in a directory
  static async listFiles(path: string) {
    const storageRef = ref(storage, path);
    const result = await listAll(storageRef);
    return result.items.map(item => item.fullPath);
  }
}