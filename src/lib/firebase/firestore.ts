// Firebase Firestore utilities
// This is optional and can be removed if not needed
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  type DocumentData,
  type QueryConstraint,
} from 'firebase/firestore';
import { db } from '../firebase';

export class FirebaseFirestore {
  // Get a document by ID
  static async getDocument(collectionName: string, docId: string) {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  }

  // Get all documents in a collection
  static async getCollection(collectionName: string, constraints: QueryConstraint[] = []) {
    const q = query(collection(db, collectionName), ...constraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // Add a new document
  static async addDocument(collectionName: string, data: DocumentData) {
    const docRef = await addDoc(collection(db, collectionName), data);
    return docRef.id;
  }

  // Update a document
  static async updateDocument(collectionName: string, docId: string, data: Partial<DocumentData>) {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, data);
  }

  // Delete a document
  static async deleteDocument(collectionName: string, docId: string) {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  }

  // Query helpers
  static where = where;
  static orderBy = orderBy;
  static limit = limit;
}