import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
dotenv.config();

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

const app = initializeApp({ credential: cert(serviceAccount) });
const auth = getAuth(app);
const db = getFirestore(app);

async function listAll() {
  const users = await auth.listUsers(10);
  console.log("AUTH USERS:", users.users.map(u => ({email: u.email, uid: u.uid})));
  
  const docs = await db.collection('doctors').get();
  console.log("DOCTORS COLLECTION:", docs.docs.map(d => ({id: d.id, ...d.data()})));
  
  const usersColl = await db.collection('users').where('role', '==', 'doctor').get();
  console.log("USERS COLLECTION (role: doctor):", usersColl.docs.map(d => ({id: d.id, ...d.data()})));
  
  process.exit(0);
}
listAll();
