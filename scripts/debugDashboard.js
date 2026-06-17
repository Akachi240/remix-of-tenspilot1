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

async function debugDashboard() {
  const doctorId = 'HCCqumF2fTYp1oXx0QkBpMgC3nk2';
  
  const linksSnap = await db.collection('doctorPatientLinks').where('doctorId', '==', doctorId).where('status', '==', 'active').get();
  console.log('Active Links found:', linksSnap.size);
  const patientIds = linksSnap.docs.map(d => d.data().patientId);
  console.log('Patient IDs in links:', patientIds);
  
  if (patientIds.length > 0) {
    const uQ = await db.collection('users').where('__name__', 'in', patientIds).get();
    console.log('Users found in DB matching these IDs:', uQ.size);
    uQ.docs.forEach(doc => {
      console.log('Matched User:', doc.id, doc.data().name);
    });
  }
  
  process.exit(0);
}
debugDashboard();
