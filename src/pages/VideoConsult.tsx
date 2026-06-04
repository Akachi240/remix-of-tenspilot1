import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';

const VideoConsult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Get roomId from navigation state, fallback if directly navigated
  const roomName = location.state?.roomId || `TensPilot_Consult_${user?.uid || 'Unknown'}`;

  useEffect(() => {
    if (location.state?.roomId) {
      // Mark call as active when patient joins
      const consultationRef = doc(db, 'consultations', location.state.roomId);
      setDoc(consultationRef, { status: 'active' }, { merge: true }).catch(console.error);
    }
  }, [location.state?.roomId]);

  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-4 z-10 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 pointer-events-none">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-white hover:bg-black/70 transition-colors backdrop-blur-md pointer-events-auto"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 bg-black/60 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-white text-xs font-medium tracking-wide uppercase">Secure Line</span>
        </div>
        <div className="w-10" />
      </header>

      {/* Real Jitsi Video Area */}
      <div className="flex-1 w-full h-full relative" style={{ height: 'calc(100vh - 64px)' }}>
        <JitsiMeeting
          domain="meet.jit.si"
          roomName={roomName}
          spinner={() => (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
              <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-blue-500 mt-4 animate-pulse font-medium">Connecting to Secure Line...</p>
            </div>
          )}
          configOverwrite={{
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            disableModeratorIndicator: true,
            enableEmailInStats: false,
            prejoinPageEnabled: false
          }}
          interfaceConfigOverwrite={{
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true
          }}
          userInfo={{
            displayName: 'Patient',
            email: ""
          }}
          getIFrameRef={(iframeRef) => {
            if (iframeRef) {
              iframeRef.style.height = '100%';
              iframeRef.style.width = '100%';
              iframeRef.style.border = 'none';
            }
          }}
        />
      </div>

    </div>
  );
};

export default VideoConsult;

