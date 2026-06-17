import React, { useState, useRef, useEffect, useMemo } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import { Send, Bot, Stethoscope, ArrowRight, AlertTriangle, Activity, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { collection, addDoc, serverTimestamp, doc, setDoc, getDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';
import { getAIResponse, PatientContext } from '@/lib/groq-service';
import { useProfiles } from '@/context/ProfileContext';
import { useTranslation } from 'react-i18next';
import { useSpeech } from '@/hooks/useSpeech';
import { analyzePatientInput } from '@/lib/safety-filter';
import { savePainLog } from '@/lib/pain';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'ai' | 'doctor' | 'patient';
  timestamp: Date;
  riskLevel?: 'low' | 'medium' | 'high';
  actions?: string[];
  escalated?: boolean;
}

const Chat = () => {
  const { user, linkedDoctorId } = useAuth();
  const { activeProfile } = useProfiles();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [mode, setMode] = useState<'ai' | 'doctor'>('ai');
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [doctorName, setDoctorName] = useState('Your Doctor');

  useEffect(() => {
    if (!linkedDoctorId) return;
    const fetchDoctorName = async () => {
      try {
        const doctorDoc = await getDoc(doc(db, 'users', linkedDoctorId));
        const data = doctorDoc.data();
        if (data) {
          setDoctorName(data.name || data.displayName || 'Your Doctor');
        }
        // Also try the doctors collection
        if (!data?.name && !data?.displayName) {
          const doctorDoc2 = await getDoc(doc(db, 'doctors', linkedDoctorId));
          const data2 = doctorDoc2.data();
          if (data2) {
            setDoctorName(data2.name || 'Your Doctor');
          }
        }
      } catch (err) {
        console.error('Error fetching doctor name:', err);
      }
    };
    fetchDoctorName();
  }, [linkedDoctorId]);
  
  // VoiceCare Features
  const { isListening, isSpeaking, startListening, speak } = useSpeech();
  const [voiceCareMode, setVoiceCareMode] = useState(false);

  // Build RAG patient context from active profile
  const patientContext = useMemo<PatientContext | undefined>(() => {
    if (!activeProfile) return undefined;
    const recentSessions = (activeProfile.sessionHistory || [])
      .slice(-5)
      .map(s => ({
        date: s.date,
        modeName: s.modeName || s.modeId || 'Unknown',
        painBefore: s.painBefore,
        painAfter: s.painAfter,
        reliefPct: s.reductionPct,
      }));
    return {
      name: activeProfile.name,
      primaryCondition: activeProfile.primaryCondition,
      medications: activeProfile.medications || [],
      recentSessions,
      supervisingPhysician: activeProfile.supervisingPhysician,
      age: activeProfile.age,
    };
  }, [activeProfile]);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      text: "Hi! I'm the TensPilot+ AI Clinical Assistant. I can help you with pad placement, device settings, or general questions, and monitor your symptoms. How can I assist you today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Real-time listener for doctor messages
  useEffect(() => {
    if (!user?.uid || !linkedDoctorId) return;

    const q = query(
      collection(db, `doctorPatientLinks/${linkedDoctorId}_${user.uid}/messages`),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(prev => {
        const newMessages = [...prev];
        let changed = false;

        snapshot.docs.forEach(docSnap => {
          const data = docSnap.data();
          // Prevent duplicates (local optimistic vs remote)
          const isLocal = prev.some(m => 
            m.id === docSnap.id || 
            (m.text === data.text && Math.abs(m.timestamp.getTime() - (data.timestamp?.toMillis() || Date.now())) < 5000)
          );

          if (!isLocal) {
            newMessages.push({
              id: docSnap.id,
              text: data.text,
              sender: data.senderRole === 'patient' ? 'patient' : 'doctor',
              timestamp: data.timestamp?.toDate() || new Date(),
            });
            changed = true;
          }
        });

        if (changed) {
          // Sort by time to ensure proper order
          newMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
          return newMessages;
        }
        return prev;
      });
    });

    return () => unsubscribe();
  }, [user?.uid, linkedDoctorId]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userText = inputText;
    const newMsg: Message = {
      id: Date.now().toString(),
      text: userText,
      sender: 'patient',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    if (mode === 'ai') {
      setIsTyping(true);
      const history = messages
        .filter(m => m.id !== 'm1') // Exclude initial greeting to maintain strict user/model alternation
        .filter(m => m.sender === 'ai' || m.sender === 'patient')
        .map(m => ({
          role: m.sender === 'patient' ? 'user' as const : 'model' as const,
          parts: [{ text: m.text }]
        }));

      // 1. Local Safety & Pain Logging Interceptor
      const safetyCheck = analyzePatientInput(userText, i18n.language);
      
      if (!safetyCheck.isSafe) {
        setIsTyping(false);
        const warningResponse = safetyCheck.warningMessage || "Safety warning triggered.";
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: warningResponse,
          sender: 'ai',
          timestamp: new Date(),
          riskLevel: 'high'
        }]);
        if (voiceCareMode) speak(warningResponse, i18n.language);
        return;
      }
      
      if (safetyCheck.isPainLog && activeProfile && user?.uid) {
        // Simple pain log interception
        console.log("Logged pain level:", safetyCheck.painLevel);
        savePainLog(
          user.uid,
          safetyCheck.painLevel || 0,
          activeProfile.primaryCondition || 'General',
          userText
        ).catch(err => console.error('Failed to save pain log:', err));
      }

      try {
        const result = await getAIResponse(userText, history, patientContext, i18n.language);

        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: result.response,
          sender: 'ai',
          timestamp: new Date(),
          riskLevel: result.riskLevel,
          actions: result.actions,
          escalated: result.escalateToDoctor
        }]);
        
        // Auto-play if VoiceCare Mode is active
        if (voiceCareMode) {
          speak(result.response, i18n.language);
        }

        // Handle escalation client-side (replaces server-side Firebase Admin actions)
        if (result.escalateToDoctor && linkedDoctorId) {
          addDoc(collection(db, 'alerts'), {
            patientId: user?.uid,
            doctorId: linkedDoctorId,
            message: userText,
            aiResponse: result.response,
            riskLevel: result.riskLevel,
            createdAt: serverTimestamp(),
            status: 'unread'
          }).catch(err => console.error('Failed to create alert:', err));
        }

        if (result.actions.includes('create_consultation') && linkedDoctorId) {
          const roomId = `TensPilot_Consult_${linkedDoctorId}_${user?.uid}`;
          setDoc(doc(db, 'consultations', roomId), {
            id: roomId,
            roomId,
            patientId: user?.uid,
            doctorId: linkedDoctorId,
            status: 'ringing',
            initiatedBy: 'patient_ai_escalation',
            timestamp: serverTimestamp(),
            reason: userText
          }, { merge: true }).catch(err => console.error('Failed to create consultation:', err));
        }
      } catch (error) {
        console.error("Failed to get AI response:", error);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: 'Sorry, I encountered an error. Please check your connection and try again.',
          sender: 'ai',
          timestamp: new Date()
        }]);
      } finally {
        setIsTyping(false);
      }
    } else if (linkedDoctorId) {
      // Send to Doctor (Real Firestore)
      try {
        await addDoc(collection(db, `doctorPatientLinks/${linkedDoctorId}_${user?.uid}/messages`), {
          text: userText,
          senderId: user?.uid,
          senderRole: 'patient',
          timestamp: serverTimestamp()
        });
      } catch (err) {
        console.error("Failed to send message to doctor", err);
      }
    }
  };

  const switchToDoctor = async () => {
    if (!linkedDoctorId) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: "It seems your account isn't linked to a doctor yet! Please go to Settings to link your account to a clinic first before contacting a doctor.",
        sender: 'ai',
        timestamp: new Date()
      }]);
      return;
    }

    setMode('doctor');
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text: "Connecting to your doctor... Escaping AI Assistant.",
      sender: 'doctor',
      timestamp: new Date()
    }]);

    if (linkedDoctorId) {
      const chatRef = doc(db, 'chats', `${linkedDoctorId}_${user?.uid}`);
      await setDoc(chatRef, {
        patientId: user?.uid,
        doctorId: linkedDoctorId,
        lastMessage: "Patient escalated from AI",
        lastMessageTime: serverTimestamp(),
        unreadCount: 1
      }, { merge: true });
    }
  };

  const joinConsultation = () => {
    if (linkedDoctorId) {
      const roomId = `TensPilot_Consult_${linkedDoctorId}_${user?.uid}`;
      navigate('/video-consult', { state: { roomId } });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AppHeader />
      
      <main className="flex-grow flex flex-col container max-w-3xl mx-auto px-0 md:px-4 py-0 md:py-6">
        <div className="bg-white flex-grow flex flex-col shadow-sm md:rounded-2xl border-x md:border border-gray-200 overflow-hidden relative">
          
          {/* Chat Header */}
          <div className="h-16 px-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-white",
                mode === 'ai' ? "bg-purple-500" : "bg-blue-600"
              )}>
                {mode === 'ai' ? <Bot className="w-5 h-5" /> : <Stethoscope className="w-5 h-5" />}
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">
                  {mode === 'ai' ? 'Clinical AI Agent' : doctorName}
                </h2>
                <p className="text-xs text-green-600 font-medium">Online</p>
              </div>
            </div>

            {mode === 'ai' && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setVoiceCareMode(!voiceCareMode)}
                  className={cn(
                    "text-xs font-medium px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5",
                    voiceCareMode ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                  title="VoiceCare Accessibility Mode"
                >
                  {voiceCareMode ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">VoiceCare Mode</span>
                </button>
                <button 
                  onClick={switchToDoctor}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                >
                  Contact Doctor <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Messages Area */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {messages.map(msg => {
              const isMe = msg.sender === 'patient';
              const isAi = msg.sender === 'ai';
              
              return (
                <div key={msg.id} className={cn("flex flex-col max-w-[85%]", isMe ? "ml-auto items-end" : "mr-auto items-start")}>
                  {/* AI Output Rendering */}
                  <div className={cn(
                    "px-4 py-3 rounded-2xl shadow-sm text-sm whitespace-pre-wrap",
                    isMe 
                      ? "bg-medical-600 text-white rounded-tr-sm" 
                      : isAi 
                        ? cn(
                            "border rounded-tl-sm",
                            msg.riskLevel === 'high' ? "bg-red-50 text-red-900 border-red-200" :
                            msg.riskLevel === 'medium' ? "bg-amber-50 text-amber-900 border-amber-200" :
                            "bg-purple-50 text-purple-900 border-purple-100"
                          )
                        : "bg-gray-100 text-gray-900 rounded-tl-sm"
                  )}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                      {isAi && (
                        <button 
                          onClick={() => speak(msg.text, i18n.language)}
                          className={cn(
                            "p-1.5 rounded-md hover:bg-black/5 transition-colors shrink-0",
                            isSpeaking ? "text-purple-600 animate-pulse" : "text-gray-400"
                          )}
                          title="Read aloud"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    {/* Render Structured AI Actions */}
                    {isAi && msg.actions && msg.actions.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-purple-200/50 flex flex-col gap-2">
                        {msg.escalated && (
                          <div className="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-100/50 px-2 py-1 rounded">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Doctor Notified
                          </div>
                        )}
                        {msg.actions.includes("create_consultation") && (
                          <button 
                            onClick={joinConsultation}
                            className="flex items-center justify-center gap-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-md shadow-sm transition-colors mt-1"
                          >
                            <Video className="w-4 h-4" />
                            Join Video Consultation Now
                          </button>
                        )}
                        {msg.actions.includes("suggest_adjustment") && (
                          <div className="flex flex-col gap-2 mt-2 border-t border-purple-200/50 pt-2">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-100/50 px-2 py-1 rounded w-fit">
                              <Activity className="w-3.5 h-3.5" />
                              Therapy Adjustment Suggested
                            </div>
                            <button
                              onClick={() => {
                                const confirmText = "I have manually adjusted my device to the suggested settings.";
                                setMessages(prev => [...prev, {
                                  id: Date.now().toString(),
                                  text: confirmText,
                                  sender: 'patient',
                                  timestamp: new Date()
                                }]);
                                if (linkedDoctorId && user?.uid) {
                                  addDoc(collection(db, `doctorPatientLinks/${linkedDoctorId}_${user.uid}/messages`), {
                                    text: confirmText,
                                    senderId: user.uid,
                                    senderRole: 'patient',
                                    timestamp: serverTimestamp()
                                  }).catch(err => console.error("Failed to send adjustment confirmation", err));
                                }
                              }}
                              className="self-start px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md shadow-sm transition-colors"
                            >
                              I have adjusted my device
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 px-1 flex gap-2">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {msg.riskLevel && msg.riskLevel !== 'low' && (
                      <span className={msg.riskLevel === 'high' ? "text-red-500 font-medium" : "text-amber-500"}>
                        {msg.riskLevel.toUpperCase()} RISK
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
            
            {isTyping && (
              <div className="mr-auto items-start max-w-[80%]">
                <div className="px-4 py-3 rounded-2xl bg-purple-50 border border-purple-100 rounded-tl-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2">
              <input 
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={mode === 'ai' ? "Describe your symptoms or ask a question..." : "Message your doctor..."}
                className="flex-grow bg-gray-50 border border-gray-200 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-medical-500/20 focus:border-medical-500 transition-all"
                disabled={isTyping || isListening}
              />
              {mode === 'ai' && (
                <button
                  type="button"
                  onClick={() => {
                    if (isListening) return;
                    startListening((text) => {
                      setInputText(prev => prev + (prev ? ' ' : '') + text);
                    });
                  }}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all shrink-0 shadow-sm",
                    isListening ? "bg-red-500 text-white animate-pulse" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                  title="Voice input"
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              )}
              <button 
                onClick={handleSend}
                disabled={!inputText.trim() || isTyping}
                className="w-12 h-12 bg-medical-600 text-white rounded-full flex items-center justify-center hover:bg-medical-700 disabled:opacity-50 transition-colors shrink-0 shadow-md"
              >
                <Send className="w-5 h-5 -ml-1" />
              </button>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
};

export default Chat;
