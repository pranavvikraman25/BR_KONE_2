// utils/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes } from 'firebase/storage';

// ⚠️ IMPORTANT: Replace with your actual Firebase config
// Get this from: https://console.firebase.google.com
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// ==================== DATABASE FUNCTIONS ====================

// Save maintenance session (visible only to admin)
export async function saveMaintenance Session(sessionData, userId) {
  try {
    const docRef = await addDoc(collection(db, 'maintenance_sessions'), {
      userId,
      elevator: sessionData.elevator,
      floor: sessionData.floor,
      faultCode: sessionData.faultCode,
      startTime: sessionData.startTime,
      endTime: new Date(),
      totalTime: sessionData.totalTime,
      stationaryTime: sessionData.stationaryTime,
      inferredZone: sessionData.inferredZone,
      trajectory: sessionData.trajectory,
      confidence: sessionData.confidence,
      createdAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving session:', error);
    throw error;
  }
}

// Get all sessions (admin only)
export async function getAllSessions() {
  try {
    const querySnapshot = await getDocs(collection(db, 'maintenance_sessions'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }
}

// Get user's sessions
export async function getUserSessions(userId) {
  try {
    const q = query(collection(db, 'maintenance_sessions'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    return [];
  }
}

// Save live elevator data (from IoT later)
export async function saveLiveElevatorData(elevatorId, data) {
  try {
    const docRef = await addDoc(collection(db, 'elevator_live_data'), {
      elevatorId,
      faultCode: data.faultCode,
      safetyInputStatus: data.safetyInputStatus,
      timestamp: new Date(),
      ...data,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving live data:', error);
    throw error;
  }
}

// Get elevator live data (for correlation with maintenance)
export async function getElevatorLiveData(elevatorId) {
  try {
    const q = query(
      collection(db, 'elevator_live_data'),
      where('elevatorId', '==', elevatorId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching elevator data:', error);
    return [];
  }
}
