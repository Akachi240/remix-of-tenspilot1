import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';



const VideoConsult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jitsiApiRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const roomName = location.state?.roomId || `TensPilot_Consult_${user?.uid || 'Unknown'}`;

  useEffect(() => {
    if (location.state?.roomId) {
      const consultationRef = doc(db, 'consultations', location.state.roomId);
      setDoc(consultationRef, { status: 'active' }, { merge: true }).catch(console.error);
    }
  }, [location.state?.roomId]);

  useEffect(() => {
    // Load Jitsi External API script
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;

    script.onload = () => {
      if (!jitsiContainerRef.current) return;
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const api = new (window as any).JitsiMeetExternalAPI('meet.jit.si', {
          roomName: roomName,
          parentNode: jitsiContainerRef.current,
          width: '100%',
          height: '100%',
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            disableModeratorIndicator: true,
            enableEmailInStats: false,
            prejoinPageEnabled: false,
          },
          interfaceConfigOverwrite: {
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
            MOBILE_APP_PROMO: false,
          },
          userInfo: {
            displayName: 'Patient',
            email: '',
          },
        });

        api.addListener('videoConferenceJoined', () => setLoading(false));
        api.addListener('readyToClose', () => navigate(-1));

        jitsiApiRef.current = api;
      } catch (err) {
        console.error('Failed to initialize Jitsi:', err);
        setError('Failed to start video call. Please try again.');
        setLoading(false);
      }
    };

    script.onerror = () => {
      // Fallback: try meet.jit.si domain
      const fallbackScript = document.createElement('script');
      fallbackScript.src = 'https://meet.jit.si/external_api.js';
      fallbackScript.async = true;

      fallbackScript.onload = () => {
        if (!jitsiContainerRef.current) return;
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const api = new (window as any).JitsiMeetExternalAPI('meet.jit.si', {
            roomName: roomName,
            parentNode: jitsiContainerRef.current,
            width: '100%',
            height: '100%',
            configOverwrite: {
              startWithAudioMuted: false,
              startWithVideoMuted: false,
              disableModeratorIndicator: true,
              prejoinPageEnabled: false,
            },
            interfaceConfigOverwrite: {
              DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
              MOBILE_APP_PROMO: false,
            },
            userInfo: {
              displayName: 'Patient',
              email: '',
            },
          });

          api.addListener('videoConferenceJoined', () => setLoading(false));
          api.addListener('readyToClose', () => navigate(-1));
          jitsiApiRef.current = api;
        } catch (err) {
          console.error('Fallback Jitsi init failed:', err);
          setError('Failed to start video call. Please try again.');
          setLoading(false);
        }
      };

      fallbackScript.onerror = () => {
        setError('Could not load video calling service. Check your connection.');
        setLoading(false);
      };

      document.head.appendChild(fallbackScript);
    };

    document.head.appendChild(script);

    return () => {
      jitsiApiRef.current?.dispose();
      // Clean up scripts
      document.querySelectorAll('script[src*="external_api.js"]').forEach(s => s.remove());
    };
  }, [roomName, navigate]);

  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-4 z-10 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 pointer-events-none">
        <button
          onClick={() => {
            jitsiApiRef.current?.dispose();
            navigate(-1);
          }}
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

      {/* Video Area */}
      <div className="flex-1 w-full relative" style={{ height: 'calc(100vh - 64px)' }}>
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10">
            <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-blue-500 mt-4 animate-pulse font-medium">Connecting to Secure Line...</p>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10">
            <p className="text-red-400 font-medium">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              Go Back
            </button>
          </div>
        )}
        <div ref={jitsiContainerRef} className="w-full h-full" />
      </div>
    </div>
  );
};

export default VideoConsult;
