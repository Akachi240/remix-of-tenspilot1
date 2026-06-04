
import React, { useEffect, useState } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import UserDashboard from '@/components/dashboard/UserDashboard';
import { Sparkles, Video, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { collection, query, where, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, linkedDoctorId } = useAuth();
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [doctorSessionActive, setDoctorSessionActive] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (!linkedDoctorId) return;

    const q = query(
      collection(db, 'consultations'),
      where('patientId', '==', user.uid),
      where('status', '==', 'ringing')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        // Just take the first ringing call
        setIncomingCall(snapshot.docs[0].data());
      } else {
        setIncomingCall(null);
      }
    });

    const unsub = onSnapshot(
      doc(db, 'doctorPatientLinks', `${linkedDoctorId}_${user.uid}`),
      (docSnap) => {
        if (docSnap.exists() && docSnap.data().activeSession) {
          setDoctorSessionActive(true)
        } else {
          setDoctorSessionActive(false)
        }
      }
    )

    return () => {
      unsubscribe();
      unsub();
    };
  }, [user, linkedDoctorId]);

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      
      <main className="flex-grow py-8 md:py-12">
        <div className="container px-4 md:px-6">
          <div className="mb-8 text-center flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-medical-900 text-left">Your TENS Therapy Dashboard</h1>
              <p className="mt-2 text-muted-foreground max-w-2xl text-left">
                Track your sessions, view pain relief trends, and monitor your progress over time.
              </p>
            </div>
            {linkedDoctorId && (
              <button
                onClick={async () => {
                  const roomId = `TensPilot_Consult_${linkedDoctorId}_${user.uid}`;
                  const consultationRef = doc(db, 'consultations', roomId);
                  await setDoc(consultationRef, {
                    doctorId: linkedDoctorId,
                    patientId: user.uid,
                    status: 'ringing',
                    initiatedBy: 'patient',
                    timestamp: new Date()
                  }, { merge: true });
                  navigate('/video-consult', { state: { roomId } });
                }}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2"
              >
                <Video className="w-5 h-5" />
                Call Doctor
              </button>
            )}
          </div>
          
          {/* Telehealth Notification Banner */}
          {incomingCall && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
                  <Video className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-600">Incoming Video Consult</h3>
                  <p className="text-sm text-red-600/80">Your doctor is requesting a secure video consultation.</p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/video-consult', { state: { roomId: incomingCall.roomId } })}
                className="w-full sm:w-auto px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-lg shadow-red-500/30 transition-all flex items-center justify-center gap-2"
              >
                Join Call
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* AI Insight Banner */}
          <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 flex items-start gap-4 shadow-sm">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Weekly AI Insight</h3>
              <p className="text-sm text-blue-800/80">
                You've maintained a 0/10 pain level for 14 days while using the "Acupuncture" program. Excellent progress! Consider mentioning this to your doctor in your next chat.
              </p>
            </div>
          </div>
          
          <UserDashboard />
        </div>
      </main>
      
      <footer className="border-t py-4 bg-gray-50">
        <div className="container px-4 md:px-6 text-center">
          <p className="text-sm text-muted-foreground">
            Your session data is stored locally on your device and is not transmitted or saved elsewhere.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
