import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
dotenv.config();

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

const app = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(app);

async function checkDb() {
  const usersSnap = await db.collection('users').get();
  console.log('\nUsers found:', usersSnap.size);
  usersSnap.forEach(d => {
    console.log('User ID:', d.id, 'Name:', d.data().name, 'Role:', d.data().role, 'UserType:', d.data().userType);
  });
  process.exit(0);
}
checkDb();
