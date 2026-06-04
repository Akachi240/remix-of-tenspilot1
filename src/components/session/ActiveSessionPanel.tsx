import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, Check, Play, Pause, Shield, Square, Zap, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ReliefSuccessAnimation } from '@/components/animations/Animations';
import { useProfiles } from '@/context/ProfileContext';
import { useAuth } from '@/hooks/useAuth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const ActiveSessionPanel = () => {
  const { user } = useAuth();
  const [config, setConfig] = useState<any>(null);
  const [status, setStatus] = useState<'idle' | 'running' | 'paused' | 'completed' | 'stopped'>('idle');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [postPainLevel, setPostPainLevel] = useState<number | null>(null);
  const [sessionNotes, setSessionNotes] = useState('');
  const [breathPhase, setBreathPhase] = useState(0);
  const [pulseScale, setPulseScale] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const breathRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { activeProfile, addSession } = useProfiles();

  const breathPhases = ['Inhale', 'Hold', 'Exhale', 'Hold'];

  useEffect(() => {
    const stored = localStorage.getItem('activeSessionConfig');
    if (stored) {
      const parsed = JSON.parse(stored);
      setConfig(parsed);
      const durationMin = parseInt(parsed.data.sessionDuration) || 20;
      const totalSec = durationMin * 60;
      setTotalTime(totalSec);
      setTimeRemaining(totalSec);
    }
  }, []);

  useEffect(() => {
    if (status === 'running' && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setStatus('completed');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [status]);

  useEffect(() => {
    if (status === 'running') {
      pulseRef.current = setInterval(() => {
        setPulseScale(prev => prev === 1 ? 1.04 : 1);
      }, 800);
    } else {
      if (pulseRef.current) clearInterval(pulseRef.current);
      setPulseScale(1);
    }
    return () => { if (pulseRef.current) clearInterval(pulseRef.current); };
  }, [status]);

  useEffect(() => {
    if (status === 'paused') {
      breathRef.current = setInterval(() => {
        setBreathPhase(prev => (prev + 1) % 4);
      }, 2000);
    } else {
      if (breathRef.current) clearInterval(breathRef.current);
      setBreathPhase(0);
    }
    return () => { if (breathRef.current) clearInterval(breathRef.current); };
  }, [status]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const elapsed = totalTime - timeRemaining;
  const elapsedMin = Math.max(1, Math.round(elapsed / 60));
  const progress = totalTime > 0 ? (elapsed / totalTime) * 100 : 0;
  const prePainLevel = config?.data?.painIntensity || 5;
  const reductionPct =
    postPainLevel !== null && prePainLevel > 0
      ? ((prePainLevel - postPainLevel) / prePainLevel) * 100
      : null;
  const roundedReductionPct = reductionPct !== null ? Math.round(reductionPct) : null;

  const getReductionTier = (pct: number) => {
    if (pct >= 76) return { color: '#22c55e', label: 'Excellent Relief' };
    if (pct >= 51) return { color: '#16a34a', label: 'Good Relief' };
    if (pct >= 26) return { color: '#f59e0b', label: 'Moderate Relief' };
    if (pct >= 0)  return { color: '#ef4444', label: 'Mild Relief' };
    return            { color: '#dc2626', label: 'Pain Increased' };
  };

  const handleStart  = () => setStatus('running');
  const handlePause  = () => { setStatus('paused'); if (intervalRef.current) clearInterval(intervalRef.current); };
  const handleResume = () => setStatus('running');

  const handleEmergencyStop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setStatus('stopped');
    toast({ title: 'Session Stopped', description: 'TENS session stopped immediately.', variant: 'destructive' });
  };

  const saveSession = async () => {
    if (postPainLevel === null) {
      toast({
        title: 'Pain score required',
        description: 'Select your pain level after the session before saving.',
      });
      return;
    }

    const timestamp = new Date().toISOString();
    const modeId = config?.data?.settings?.modeId || config?.data?.modeId || 'general';
    const modeName = config?.data?.settings?.modeName || config?.data?.settings?.mode || 'TENS Therapy';
    const painAfter = postPainLevel;
    const durationMinutes = Math.round((elapsed || totalTime) / 60);
    const sessionId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const session = {
      id: sessionId,
      type: 'tens-session',
      timestamp,
      data: {
        id: sessionId,
        modeId,
        modeName,
        mode: config?.data?.settings?.mode || 'Continuous',
        placement: config?.data?.painLocation || 'unknown',
        duration: durationMinutes,
        painBefore: prePainLevel,
        painAfter,
        painReduction: prePainLevel - painAfter,
        intensity: config?.data?.settings?.intensitySetting || 0,
        frequency: config?.data?.settings?.frequencySetting || '',
        pulseDuration: config?.data?.settings?.pulseDuration || '',
        completed: status === 'completed',
        reductionPct: roundedReductionPct,
        notes: sessionNotes,
        profileId: activeProfile?.id || null,
      },
    };

    const historyRecord = {
      id: sessionId,
      timestamp,
      modeId,
      modeName,
      duration: durationMinutes,
      painBefore: prePainLevel,
      painAfter,
      intensity: config?.data?.settings?.intensitySetting || 0,
      placement: config?.data?.painLocation || 'unknown',
      frequency: config?.data?.settings?.frequencySetting || '',
      pulseDuration: config?.data?.settings?.pulseDuration || '',
      reductionPct: roundedReductionPct,
      completed: status === 'completed',
      notes: sessionNotes,
      profileId: activeProfile?.id || null,
    };

    const assessments = JSON.parse(localStorage.getItem('assessments') || '[]');
    assessments.push(session);
    localStorage.setItem('assessments', JSON.stringify(assessments));
    const tensSessions = JSON.parse(localStorage.getItem('tens-sessions') || '[]');
    tensSessions.push(session);
    localStorage.setItem('tens-sessions', JSON.stringify(tensSessions));
    const sessionHistory = JSON.parse(localStorage.getItem('tens-session-history') || '[]');
    sessionHistory.push(historyRecord);
    localStorage.setItem('tens-session-history', JSON.stringify(sessionHistory));

    addSession({
      date: timestamp,
      modeId,
      modeName,
      painType: modeId === 'neuropathy' || modeId === 'period' ? 'Chronic' : 'Acute',
      placement: historyRecord.placement,
      parameters: {
        frequency: historyRecord.frequency,
        pulseDuration: historyRecord.pulseDuration,
        intensity: historyRecord.intensity,
        duration: historyRecord.duration,
      },
      painBefore: prePainLevel,
      painAfter,
      reductionPct: roundedReductionPct ?? 0,
      notes: sessionNotes,
    });

    if (user?.uid) {
      try {
        await addDoc(collection(db, 'sessions'), {
          patientId: user.uid,
          date: timestamp,
          modeId,
          modeName,
          painType: modeId === 'neuropathy' || modeId === 'period' ? 'Chronic' : 'Acute',
          placement: historyRecord.placement,
          parameters: {
            frequency: historyRecord.frequency,
            pulseDuration: historyRecord.pulseDuration,
            intensity: historyRecord.intensity,
            duration: historyRecord.duration,
          },
          painBefore: prePainLevel,
          painAfter,
          reductionPct: roundedReductionPct ?? 0,
          notes: sessionNotes,
          completed: status === 'completed',
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        console.error("Failed to upload session to Firestore:", err);
        // Continue anyway since we saved locally
      }
    }

    toast({ title: 'Session Saved!', description: 'Your TENS session has been recorded.' });
    navigate('/dashboard');
  };

  // ── SVG ring helpers ──────────────────────────────────────
  const RING_R = 120;
  const RING_STROKE = 10;
  const RING_CIRC = 2 * Math.PI * RING_R;
  const ringOffset = RING_CIRC - (progress / 100) * RING_CIRC;

  const targetIntensity = Number(config?.data?.settings?.intensitySetting) || 0;
  const intensity = targetIntensity || '—';
  const freq      = config?.data?.settings?.frequencySetting || '—';
  const pulse     = config?.data?.settings?.pulseDuration    || '—';
  const location  = (config?.data?.painLocation || 'unknown').replace('-', ' ');
  const duration  = config?.data?.sessionDuration || '—';
  const modeName = config?.data?.settings?.modeName || config?.data?.settings?.mode || 'TENS Therapy';
  const summaryRows = [
    { label: 'Mode', value: modeName },
    { label: 'Duration', value: `${elapsedMin} min` },
    { label: 'Intensity', value: `${targetIntensity || 0}/10` },
    { label: 'Pain Before', value: `${prePainLevel}/10` },
    { label: 'Pain After', value: postPainLevel !== null ? `${postPainLevel}/10` : 'Required' },
    {
      label: 'Pain Reduction',
      value: roundedReductionPct !== null ? `${Math.max(0, roundedReductionPct)}%` : 'Pending',
    },
  ];

  // ── No config ─────────────────────────────────────────────
  if (!config) {
    return (
      <div style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        padding: '2rem',
      }}>
        <div style={{
          width: 88, height: 88,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2540 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 0 16px rgba(56,189,248,0.08)',
        }}>
          <Zap style={{ color: '#38bdf8', width: 36, height: 36 }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>No Session Configured</p>
          <p style={{ color: '#64748b', marginTop: '0.5rem', fontSize: '0.95rem' }}>Set up your TENS parameters first.</p>
        </div>
        <Link
          to="/session-setup"
          style={{
            padding: '0.75rem 2rem',
            background: 'linear-gradient(135deg, #0284c7, #0369a1)',
            color: '#fff',
            borderRadius: '999px',
            fontWeight: 700,
            textDecoration: 'none',
            fontSize: '1rem',
          }}
        >
          Set Up Session
        </Link>
      </div>
    );
  }

  // ── Post-session ──────────────────────────────────────────
  if (status === 'completed' || status === 'stopped') {
    const tier = reductionPct !== null ? getReductionTier(reductionPct) : null;
    return (
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '2rem 1rem' }}>
        <ReliefSuccessAnimation
          painReduction={Math.max(0, reductionPct || 0)}
          beforeLevel={prePainLevel}
          afterLevel={postPainLevel ?? prePainLevel}
          isVisible={status === 'completed' && postPainLevel !== null && (reductionPct || 0) > 0}
        />
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 80, height: 80,
            borderRadius: '50%',
            background: status === 'completed' ? 'linear-gradient(135deg, #16a34a, #15803d)' : 'linear-gradient(135deg, #dc2626, #b91c1c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: status === 'completed' ? '0 0 0 12px rgba(34,197,94,0.12)' : '0 0 0 12px rgba(239,68,68,0.12)',
          }}>
            {status === 'completed' ? (
              <Check size={38} strokeWidth={3} style={{ color: '#fff' }} />
            ) : (
              <Square size={34} fill="#fff" strokeWidth={0} style={{ color: '#fff' }} />
            )}
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            {status === 'completed' ? 'Session Complete' : 'Session Stopped'}
          </h2>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
            {elapsedMin} minute{elapsedMin !== 1 ? 's' : ''} of therapy delivered
          </p>
        </div>

        {/* Pain rating */}
        <div style={{
          background: '#f8fafc',
          borderRadius: 20,
          border: '1.5px solid #e2e8f0',
          padding: '1.5rem',
          marginBottom: '1.25rem',
        }}>
          <p style={{ fontWeight: 700, color: '#0f172a', textAlign: 'center', marginBottom: '1.25rem', fontSize: '1rem' }}>
            How do you feel now?
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {Array.from({ length: 11 }, (_, i) => {
              const isSelected = postPainLevel === i;
              const painColor = i <= 3 ? '#22c55e' : i <= 6 ? '#f59e0b' : '#ef4444';
              return (
                <button
                  key={i}
                  onClick={() => setPostPainLevel(i)}
                  style={{
                    width: 48, height: 48,
                    borderRadius: '50%',
                    border: isSelected ? `2.5px solid ${painColor}` : '1.5px solid #e2e8f0',
                    background: isSelected ? painColor : '#fff',
                    color: isSelected ? '#fff' : '#374151',
                    fontWeight: 700,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? `0 4px 12px ${painColor}40` : 'none',
                  }}
                >
                  {i}
                </button>
              );
            })}
          </div>
        </div>

        {/* Clinical summary */}
        <div style={{
          background: '#fff',
          borderRadius: 20,
          border: '1.5px solid #dbeafe',
          padding: '1.25rem',
          marginBottom: '1.25rem',
          boxShadow: '0 10px 28px rgba(15,23,42,0.05)',
        }}>
          <p style={{
            margin: '0 0 1rem',
            color: '#0f172a',
            fontWeight: 800,
            fontSize: '1.05rem',
            textAlign: 'center',
          }}>
            Clinical Session Summary
          </p>
          <div style={{ display: 'grid', gap: 10 }}>
            {summaryRows.map(({ label, value }) => (
              <div
                key={label}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(112px, 1fr) auto',
                  gap: 12,
                  alignItems: 'center',
                  minHeight: 44,
                  padding: '0.75rem 0.85rem',
                  borderRadius: 12,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 700 }}>{label}</span>
                <span style={{
                  color: value === 'Required' ? '#dc2626' : '#0f172a',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  textAlign: 'right',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reduction result */}
        {postPainLevel !== null && reductionPct !== null && tier && (
          <div style={{
            background: '#fff',
            borderRadius: 20,
            border: `2px solid ${tier.color}30`,
            padding: '1.5rem',
            textAlign: 'center',
            marginBottom: '1.25rem',
          }}>
            <p style={{ fontSize: '3rem', fontWeight: 900, color: tier.color, margin: 0, lineHeight: 1 }}>
              {reductionPct > 0 ? '↓' : reductionPct < 0 ? '↑' : '→'}{Math.abs(reductionPct).toFixed(1)}%
            </p>
            <p style={{ fontWeight: 700, color: tier.color, marginTop: '0.5rem', fontSize: '1.1rem' }}>{tier.label}</p>
            <p style={{ color: '#64748b', marginTop: '0.5rem', fontSize: '0.9rem' }}>
              Pain {prePainLevel}/10 → {postPainLevel}/10
            </p>
          </div>
        )}

        {/* Notes */}
        <textarea
          value={sessionNotes}
          onChange={e => setSessionNotes(e.target.value)}
          placeholder="Any notes or side effects? (optional)"
          rows={3}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            borderRadius: 16,
            border: '1.5px solid #e2e8f0',
            padding: '1rem',
            fontSize: '0.95rem',
            resize: 'none',
            marginBottom: '1.25rem',
            outline: 'none',
            fontFamily: 'inherit',
            color: '#0f172a',
          }}
        />

        <button
          onClick={saveSession}
          disabled={postPainLevel === null}
          style={{
            width: '100%',
            padding: '1.1rem',
            background: postPainLevel === null ? '#cbd5e1' : 'linear-gradient(135deg, #0284c7, #0369a1)',
            color: '#fff',
            border: 'none',
            borderRadius: 999,
            fontWeight: 800,
            fontSize: '1.1rem',
            cursor: postPainLevel === null ? 'not-allowed' : 'pointer',
            boxShadow: postPainLevel === null ? 'none' : '0 8px 24px rgba(2,132,199,0.3)',
            letterSpacing: 0.3,
          }}
        >
          {postPainLevel === null ? 'Select Pain After to Save' : 'Save Session to Dashboard'}
        </button>
      </div>
    );
  }

  // ── Active / idle / paused ────────────────────────────────
  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '1rem 1rem 6rem' }}>

      {/* Back link */}
      <button
        onClick={() => navigate('/dashboard')}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none',
          color: '#64748b', cursor: 'pointer',
          fontSize: '0.875rem', fontWeight: 600,
          marginBottom: '1.5rem', padding: 0,
        }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Session info strip */}
      <div style={{
        display: 'flex', gap: 8, flexWrap: 'wrap',
        marginBottom: '2rem',
        justifyContent: 'center',
      }}>
        {[
          { label: 'Mode', value: config.data.settings?.mode || '—' },
          { label: 'Location', value: location },
          { label: 'Freq', value: freq },
          { label: 'Duration', value: `${duration}m` },
        ].map(({ label, value }) => (
          <div key={label} style={{
            background: '#f1f5f9',
            borderRadius: 999,
            padding: '0.35rem 0.9rem',
            fontSize: '0.8rem',
            color: '#475569',
            fontWeight: 600,
          }}>
            <span style={{ color: '#94a3b8', fontWeight: 500 }}>{label} </span>{value}
          </div>
        ))}
      </div>

      {/* ── Central ring ── */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '2.5rem',
      }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          {/* Outer glow ring when running */}
          {status === 'running' && (
            <div style={{
              position: 'absolute',
              inset: -16,
              borderRadius: '50%',
              background: 'rgba(56,189,248,0.08)',
              animation: 'none',
              transform: `scale(${pulseScale})`,
              transition: 'transform 0.8s ease-in-out',
              pointerEvents: 'none',
            }} />
          )}

          <svg
            width={280}
            height={280}
            viewBox="0 0 280 280"
            style={{ display: 'block', transform: 'rotate(-90deg)' }}
          >
            {/* Track */}
            <circle
              cx={140} cy={140} r={RING_R}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth={RING_STROKE}
            />
            {/* Progress arc */}
            <circle
              cx={140} cy={140} r={RING_R}
              fill="none"
              stroke={status === 'paused' ? '#f59e0b' : status === 'running' ? '#0ea5e9' : '#cbd5e1'}
              strokeWidth={RING_STROKE}
              strokeLinecap="round"
              strokeDasharray={RING_CIRC}
              strokeDashoffset={ringOffset}
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.4s ease' }}
            />
          </svg>

          {/* Center content */}
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}>
            {status === 'paused' ? (
              <>
                <div style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: '#f59e0b',
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                }}>
                  {breathPhases[breathPhase]}
                </div>
                <div style={{
                  width: 56, height: 56,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  transform: breathPhase === 0 ? 'scale(1.2)' : breathPhase === 2 ? 'scale(0.8)' : 'scale(1)',
                  transition: 'transform 1.8s ease-in-out',
                  boxShadow: '0 4px 16px rgba(245,158,11,0.4)',
                }} />
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginTop: 4 }}>
                  Box breathing
                </div>
              </>
            ) : (
              <>
                <div style={{
                  fontSize: '3.5rem',
                  fontWeight: 900,
                  color: '#0f172a',
                  letterSpacing: '-2px',
                  lineHeight: 1,
                  fontVariantNumeric: 'tabular-nums',
                  transform: `scale(${pulseScale})`,
                  transition: 'transform 0.8s ease-in-out',
                }}>
                  {formatTime(timeRemaining)}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: 3,
                  textTransform: 'uppercase',
                  color: status === 'running' ? '#0ea5e9' : '#94a3b8',
                }}>
                  {status === 'idle' ? 'Ready' : status === 'running' ? 'Active' : 'Complete'}
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  color: '#94a3b8',
                  fontWeight: 600,
                  marginTop: 4,
                }}>
                  {Math.round(progress)}% complete
                </div>
              </>
            )}
          </div>
        </div>

        {/* Intensity badge */}
        <div style={{
          marginTop: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e3a5f, #0f2540)',
            borderRadius: 999,
            padding: '0.5rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <Zap size={16} style={{ color: '#38bdf8' }} />
            <span style={{
              fontSize: '1.1rem',
              fontWeight: 800,
              color: '#f0f9ff',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {intensity}<span style={{ fontSize: '0.75rem', color: '#7dd3fc', marginLeft: 2 }}>/10</span>
            </span>
            <span style={{ color: '#38bdf8', fontSize: '0.75rem', fontWeight: 600 }}>INTENSITY</span>
          </div>

          <div style={{
            background: '#f1f5f9',
            borderRadius: 999,
            padding: '0.5rem 1.25rem',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: '#475569',
          }}>
            {pulse} μs · {freq}
          </div>
        </div>
      </div>

      {/* ── Controls ── */}
      {(status === 'running' || status === 'paused') && (
        <div style={{ display: 'grid', gap: 12, marginBottom: '1.5rem' }}>
          <div style={{
            border: '1.5px solid #fecaca',
            background: '#fef2f2',
            borderRadius: 18,
            padding: '1rem',
            display: 'grid',
            gap: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <AlertTriangle size={20} style={{ color: '#dc2626', flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ color: '#991b1b', fontWeight: 800, margin: 0 }}>Emergency Stop Available</p>
                <p style={{ color: '#b91c1c', fontSize: '0.8rem', lineHeight: 1.45, margin: '0.25rem 0 0' }}>
                  Stop immediately if you feel burning, sharp discomfort, dizziness, or unusual symptoms.
                </p>
              </div>
            </div>
            <button
              onClick={handleEmergencyStop}
              style={{
                minHeight: 56,
                width: '100%',
                border: 'none',
                borderRadius: 999,
                background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                color: '#fff',
                fontSize: '1rem',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 8px 22px rgba(220,38,38,0.28)',
              }}
            >
              <Square size={18} fill="#fff" />
              Stop Session
            </button>
          </div>

          <div style={{
            border: '1.5px solid #bbf7d0',
            background: '#f0fdf4',
            borderRadius: 18,
            padding: '1rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
          }}>
            <Shield size={20} style={{ color: '#16a34a', flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ color: '#166534', fontWeight: 800, margin: 0 }}>Safety Status</p>
              <p style={{ color: '#15803d', fontSize: '0.82rem', lineHeight: 1.45, margin: '0.25rem 0 0' }}>
                Checklist completed. Timer active. Intensity display matches the configured device setting.
              </p>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {status === 'idle' && (
          <button
            onClick={handleStart}
            style={{
              width: '100%',
              padding: '1.25rem',
              background: 'linear-gradient(135deg, #0284c7, #0369a1)',
              color: '#fff',
              border: 'none',
              borderRadius: 999,
              fontWeight: 800,
              fontSize: '1.15rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              boxShadow: '0 8px 24px rgba(2,132,199,0.35)',
              letterSpacing: 0.3,
            }}
          >
            <Play size={22} fill="#fff" />
            Start Therapy Session
          </button>
        )}

        {status === 'running' && (
          <button
            onClick={handlePause}
            style={{
              width: '100%',
              padding: '1.1rem',
              background: '#fff',
              color: '#0f172a',
              border: '2px solid #e2e8f0',
              borderRadius: 999,
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <Pause size={18} /> Pause
          </button>
        )}

        {status === 'paused' && (
          <button
            onClick={handleResume}
            style={{
              width: '100%',
              padding: '1.1rem',
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              color: '#fff',
              border: 'none',
              borderRadius: 999,
              fontWeight: 800,
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 6px 18px rgba(22,163,74,0.35)',
            }}
          >
            <Play size={18} fill="#fff" /> Resume
          </button>
        )}

        {/* Safety note */}
        <p style={{
          textAlign: 'center',
          fontSize: '0.78rem',
          color: '#94a3b8',
          marginTop: '0.5rem',
          lineHeight: 1.5,
        }}>
          If you experience discomfort, press Emergency Stop immediately and consult your healthcare provider.
        </p>
      </div>

      {/* ── Fixed status bar ── */}
      {status === 'running' && (
        <div style={{
          position: 'fixed',
          bottom: 0, left: 0, right: 0,
          zIndex: 50,
          padding: '0.9rem 1.5rem',
          background: 'linear-gradient(135deg, #0284c7, #0369a1)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          fontWeight: 700,
          fontSize: '0.9rem',
          boxShadow: '0 -4px 20px rgba(2,132,199,0.25)',
        }}>
          <div style={{
            width: 8, height: 8,
            borderRadius: '50%',
            background: '#7dd3fc',
            boxShadow: '0 0 0 4px rgba(125,211,252,0.3)',
          }} />
          Session Active · {formatTime(elapsed)} elapsed
        </div>
      )}

      {status === 'paused' && (
        <div style={{
          position: 'fixed',
          bottom: 0, left: 0, right: 0,
          zIndex: 50,
          padding: '0.9rem 1.5rem',
          background: 'linear-gradient(135deg, #d97706, #b45309)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          fontWeight: 700,
          fontSize: '0.9rem',
        }}>
          <Pause size={16} />
          Session Paused · Tap Resume to continue
        </div>
      )}
    </div>
  );
};

export default ActiveSessionPanel;
