import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
dotenv.config();

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // Handle newlines in the private key
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

const app = initializeApp({
  credential: cert(serviceAccount)
});

const auth = getAuth(app);
const db = getFirestore(app);

const MOCK_PATIENTS = [
  {
    email: 'mercy@example.com',
    password: 'password123',
    name: 'Mercy Chukwuma',
    age: 25,
    condition: 'Dysmenorrhea',
  },
  {
    email: 'favour@example.com',
    password: 'password123',
    name: 'Favour Ekene',
    age: 30,
    condition: 'Sciatica',
  },
  {
    email: 'cyprian@example.com',
    password: 'password123',
    name: 'Cyprian Agbese',
    age: 45,
    condition: 'Chronic Lower Back Pain',
  }
];

async function run() {
  console.log("Starting mock patient generation using Admin SDK...");
  
  console.log("Setting up Doctor account...");
  const targetDoctorEmail = 'blessingchukwuma240@gmail.com';
  let doctorRecord;
  try {
    doctorRecord = await auth.getUserByEmail(targetDoctorEmail);
  } catch (e) {
    console.log("Doctor auth user not found, creating one...");
    doctorRecord = await auth.createUser({
      email: targetDoctorEmail,
      password: 'password123',
      displayName: 'Dr. Blessing Chukwuma',
    });
  }
  
  const doctorId = doctorRecord.uid;
  const doctorRef = db.collection('doctors').doc(doctorId);
  const docSnap = await doctorRef.get();
  
  if (!docSnap.exists) {
    console.log("Creating doctor profile document...");
    await doctorRef.set({
      id: doctorId,
      name: 'Dr. Blessing Chukwuma',
      email: targetDoctorEmail,
      specialty: 'Neuromodulation & Pain Management',
      createdAt: FieldValue.serverTimestamp()
    });
  }
  console.log(`Using doctor: Dr. Blessing Chukwuma (${doctorId})`);

  for (const patientData of MOCK_PATIENTS) {
    try {
      console.log(`Creating user: ${patientData.name}...`);
      
      let userRecord;
      try {
        userRecord = await auth.getUserByEmail(patientData.email);
        console.log("User already exists, updating...");
      } catch (e) {
        userRecord = await auth.createUser({
          email: patientData.email,
          password: patientData.password,
          displayName: patientData.name,
        });
      }
      const uid = userRecord.uid;

      await db.collection('users').doc(uid).set({
        uid: uid,
        email: patientData.email,
        name: patientData.name,
        role: 'patient',
        createdAt: FieldValue.serverTimestamp(),
        linkedDoctorId: doctorId
      });

      await db.collection('users').doc(uid).collection('profiles').doc('default').set({
        id: 'default',
        name: patientData.name,
        condition: patientData.condition,
        age: patientData.age,
        createdAt: FieldValue.serverTimestamp(),
        sessionHistory: []
      });

      const linkId = `${doctorId}_${uid}`;
      await db.collection('doctorPatientLinks').doc(linkId).set({
        doctorId: doctorId,
        patientId: uid,
        status: 'active',
        linkedAt: FieldValue.serverTimestamp()
      });
      
      console.log(`Generating mock sessions for ${patientData.name}...`);
      
      const sessionRef = db.collection('sessions').doc();
      await sessionRef.set({
        id: sessionRef.id,
        patientId: uid,
        doctorId: doctorId,
        modeId: patientData.condition === 'Dysmenorrhea' ? 'period' : 'general',
        modeName: patientData.condition === 'Dysmenorrhea' ? 'Period Comfort' : 'General Pain Relief',
        duration: 20,
        painBefore: 7,
        painAfter: 3,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      });

      console.log(`Successfully created and linked ${patientData.name}`);
      
    } catch (err) {
      console.error(`Error creating ${patientData.name}:`, err.message);
    }
  }

  console.log("Mock patient generation complete.");
  process.exit(0);
}

run();
