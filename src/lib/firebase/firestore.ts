import { db } from "./config";
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  Timestamp, 
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  where,
  getDoc,
  getDocs,
  arrayUnion,
  writeBatch
} from "firebase/firestore";

export type PinStatus = "want_to_go" | "have_been";
export type PinCategory = "遊び" | "飲食店" | "観光" | "宿泊" | "ショッピング" | "その他";
export type MapType = "personal" | "partner" | "friends";

export interface MapData {
  id: string;
  name: string;
  type: MapType;
  icon?: string;
  members: string[]; // Array of user IDs
  ownerId: string;
  createdAt: Date;
}

export interface Pin {
  id: string;
  mapId: string;
  title: string;
  status: PinStatus;
  category: PinCategory;
  address?: string;
  memo?: string;
  url?: string;
  imageUrl?: string;
  visitedAt?: Date;
  latitude: number;
  longitude: number;
  authorId: string;
  authorName: string;
  createdAt: Date;
}

const COLLECTION_NAME = "pins";
const MAPS_COLLECTION = "maps";
const USERS_COLLECTION = "users";

// ==========================================
// Users Operations
// ==========================================

export interface UserProfile {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
}

export const updateUserDocument = async (uid: string, data: Partial<Omit<UserProfile, "uid">>) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    // getDoc で存在チェックするか、merge: true で setDoc するのが定石
    // ここでは updateDoc でエラーが出た場合（ドキュメントがない場合）にフォールバックするか、
    // あるいは最初から setDoc(..., { merge: true }) を使う。
    const { setDoc } = await import("firebase/firestore");
    await setDoc(userRef, data, { merge: true });
  } catch (error) {
    console.error("Error updating user document: ", error);
    throw error;
  }
};

export const getUsersProfiles = async (uids: string[]): Promise<Record<string, UserProfile>> => {
  if (!uids || uids.length === 0) return {};
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, where("__name__", "in", uids));
    const querySnapshot = await getDocs(q);
    const profiles: Record<string, UserProfile> = {};
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      profiles[doc.id] = {
        uid: doc.id,
        displayName: data.displayName || null,
        photoURL: data.photoURL || null,
      };
    });
    return profiles;
  } catch (error) {
    console.error("Error getting user profiles: ", error);
    throw error;
  }
};

// ==========================================
// Maps Operations
// ==========================================

export const createMap = async (mapData: Omit<MapData, "id" | "createdAt">) => {
  try {
    const docRef = await addDoc(collection(db, MAPS_COLLECTION), {
      ...mapData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating map: ", error);
    throw error;
  }
};

export const getMap = async (mapId: string): Promise<MapData | null> => {
  try {
    const mapRef = doc(db, MAPS_COLLECTION, mapId);
    const snap = await getDoc(mapRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        id: snap.id,
        name: data.name,
        type: data.type,
        icon: data.icon,
        members: data.members || [],
        ownerId: data.ownerId,
        createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : new Date(),
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting map: ", error);
    throw error;
  }
};

export const joinMap = async (mapId: string, userId: string) => {
  try {
    const mapRef = doc(db, MAPS_COLLECTION, mapId);
    await updateDoc(mapRef, {
      members: arrayUnion(userId)
    });
  } catch (error) {
    console.error("Error joining map: ", error);
    throw error;
  }
};

export const removeMemberFromMap = async (mapId: string, userId: string, currentMembers: string[]) => {
  try {
    const mapRef = doc(db, MAPS_COLLECTION, mapId);
    const newMembers = currentMembers.filter(id => id !== userId);
    await updateDoc(mapRef, {
      members: newMembers
    });
  } catch (error) {
    console.error("Error removing member from map: ", error);
    throw error;
  }
};

export const updateMap = async (mapId: string, data: Partial<Omit<MapData, "id" | "createdAt" | "ownerId">>) => {
  try {
    const mapRef = doc(db, MAPS_COLLECTION, mapId);
    await updateDoc(mapRef, data);
  } catch (error) {
    console.error("Error updating map: ", error);
    throw error;
  }
};

export const deleteMap = async (mapId: string) => {
  try {
    const batch = writeBatch(db);
    
    // 1. Delete all pins in the map
    const pinsRef = collection(db, COLLECTION_NAME);
    const q = query(pinsRef, where("mapId", "==", mapId));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    
    // 2. Delete the map itself
    const mapRef = doc(db, MAPS_COLLECTION, mapId);
    batch.delete(mapRef);
    
    await batch.commit();
  } catch (error) {
    console.error("Error deleting map: ", error);
    throw error;
  }
};

export const subscribeToUserMaps = (userId: string, callback: (maps: MapData[]) => void) => {
  if (!userId) {
    callback([]);
    return () => {};
  }
  
  const q = query(
    collection(db, MAPS_COLLECTION),
    where("members", "array-contains", userId),
    orderBy("createdAt", "desc")
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const maps: MapData[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      maps.push({
        id: doc.id,
        name: data.name,
        type: data.type,
        icon: data.icon,
        members: data.members || [],
        ownerId: data.ownerId,
        createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : new Date(),
      });
    });
    callback(maps);
  });
};

// ==========================================
// Pins Operations
// ==========================================

export const addPin = async (
  pinData: Omit<Pin, "id" | "createdAt">
) => {
  try {
    if (!pinData.mapId) throw new Error("mapId is required to add a pin");
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...pinData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding pin: ", error);
    throw error;
  }
};

export const updatePin = async (
  id: string,
  pinData: Partial<Omit<Pin, "id" | "createdAt">>
) => {
  try {
    const pinRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(pinRef, pinData);
  } catch (error) {
    console.error("Error updating pin: ", error);
    throw error;
  }
};

export const deletePin = async (id: string) => {
  try {
    const pinRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(pinRef);
  } catch (error) {
    console.error("Error deleting pin: ", error);
    throw error;
  }
};

export const subscribeToPins = (mapId: string, callback: (pins: Pin[]) => void) => {
  if (!mapId) {
    callback([]);
    return () => {};
  }
  
  const q = query(
    collection(db, COLLECTION_NAME), 
    where("mapId", "==", mapId),
    orderBy("createdAt", "desc")
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const pins: Pin[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      pins.push({
        id: doc.id,
        mapId: data.mapId,
        title: data.title,
        status: data.status || "want_to_go",
        category: data.category || "その他",
        address: data.address,
        memo: data.memo,
        url: data.url,
        imageUrl: data.imageUrl,
        visitedAt: data.visitedAt ? (data.visitedAt as Timestamp).toDate() : undefined,
        latitude: data.latitude,
        longitude: data.longitude,
        authorId: data.authorId,
        authorName: data.authorName,
        createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : new Date(),
      });
    });
    callback(pins);
  });
};
