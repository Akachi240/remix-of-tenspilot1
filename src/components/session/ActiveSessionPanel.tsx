import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Pause, Square, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ActiveSessionPanel = () => {
  const [config, setConfig] = useState<any>(null);
  const [status, setStatus] = useState<'idle' | 'running' | 'paused' | 'completed' | 'stopped'>('idle');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [postPainLevel, setPostPainLevel] = useState<number | null>(null);
  const [sessionNotes, setSessionNotes] = useState('');
  const [breathPhase, setBreathPhase] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const breathRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const breathPhases = ['Inhale 🫁', 'Hold ⏸', 'Exhale 💨', 'Hold ⏸'];

  // ─── Load config from localStorage ────────────────────────
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

  // ─── Timer ────────────────────────────────────────────────
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

  // ─── Breathing animation (on pause) ───────────────────────
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

  // ─── Helpers ──────────────────────────────────────────────
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

  const getReductionTier = (pct: number) => {
    if (pct >= 76) return { border: 'border-green-500', bg: 'bg-green-50', text: 'text-green-700', label: '⭐ Excellent Relief' };
    if (pct >= 51) return { border: 'border-green-400', bg: 'bg-green-50', text: 'text-green-700', label: '✅ Good Relief' };
    if (pct >= 26) return { border: 'border-amber-400', bg: 'bg-amber-50', text: 'text-amber-700', label: '🟡 Moderate Relief' };
    if (pct >= 0)  return { border: 'border-red-400',   bg: 'bg-red-50',   text: 'text-red-600',   label: '🔴 Mild Relief' };
    return            { border: 'border-red-600',   bg: 'bg-red-50',   text: 'text-red-700',   label: '⚠️ Pain Increased' };
  };

  // ─── Controls ─────────────────────────────────────────────
  const handleStart   = () => setStatus('running');
  const handlePause   = () => { setStatus('paused'); if (intervalRef.current) clearInterval(intervalRef.current); };
  const handleResume  = () => setStatus('running');

  const handleEmergencyStop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setStatus('stopped');
    toast({ title: 'Session Stopped', description: 'TENS session stopped immediately.', variant: 'destructive' });
  };

  // ─── Save session to localStorage ─────────────────────────
  const saveSession = () => {
    const session = {
      type: 'tens-session',
      timestamp: new Date().toISOString(),
      data: {
        mode: config?.data?.settings?.mode || 'Continuous',
        placement: config?.data?.painLocation || 'unknown',
        duration: totalTime / 60,
        painBefore: prePainLevel,
        painAfter: postPainLevel ?? prePainLevel,
        painReduction: prePainLevel - (postPainLevel ?? prePainLevel),
        intensity: config?.data?.settings?.intensitySetting || 0,
        frequency: config?.data?.settings?.frequencySetting || '',
        completed: status === 'completed',
        reductionPct: reductionPct !== null ? Math.round(reductionPct) : null,
        painTypeMode: config?.data?.painTypeMode || null,
        notes: sessionNotes,
      },
    };

    const assessments = JSON.parse(localStorage.getItem('assessments') || '[]');
    assessments.push(session);
    localStorage.setItem('assessments', JSON.stringify(assessments));

    const tensSessions = JSON.parse(localStorage.getItem('tens-sessions') || '[]');
    tensSessions.push(session);
    localStorage.setItem('tens-sessions', JSON.stringify(tensSessions));

    toast({ title: 'Session Saved!', description: 'Your TENS session has been recorded to the dashboard.' });
    navigate('/dashboard');
  };

  // ─── No config state ──────────────────────────────────────
  if (!config) {
    return (
      <Card className="w-full max-w-2xl mx-auto text-center py-12 mt-10">
        <CardContent>
          <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-2">No Session Configured</h3>
          <p className="text-muted-foreground mb-6 text-sm">Set up your TENS parameters first to start a session.</p>
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
            <Link to="/session-setup">Set Up Session</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const freq      = config.data.settings?.frequencySetting || '—';
  const pulse     = config.data.settings?.pulseDuration    || '—';
  const intensity = config.data.settings?.intensitySetting || '—';
  const location  = (config.data.painLocation || 'unknown').replace('-', ' ');

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto pb-6 mt-6">
        <CardHeader className="bg-blue-50 rounded-t-xl border-b border-blue-100">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Zap className="h-5 w-5 text-blue-600" />
            {status === 'completed' ? 'Session Complete 🎉'
              : status === 'stopped' ? 'Session Stopped'
              : 'Active TENS Session'}
          </CardTitle>
          <CardDescription className="text-blue-700 font-medium">
            {config.data.settings?.mode} · {location} · Intensity {intensity}/10
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">

          {/* ── ACTIVE / IDLE / PAUSED ── */}
          {(status === 'idle' || status === 'running' || status === 'paused') && (
            <>
              {/* Timer */}
              <div className="text-center py-4">
                <div className="text-7xl font-bold tabular-nums text-gray-900 mb-2">
                  {formatTime(timeRemaining)}
                </div>
                <Progress value={progress} className="h-4 mt-6 bg-gray-100" indicatorColor="bg-blue-600" />
                <p className="text-sm font-semibold text-gray-500 mt-3">{Math.round(progress)}% complete</p>
              </div>

              {/* Settings summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm border rounded-xl p-4 bg-gray-50">
                <div className="text-center sm:text-left"><span className="text-xs text-gray-500 block uppercase tracking-wide">Freq</span> <strong className="text-lg">{freq}</strong></div>
                <div className="text-center sm:text-left"><span className="text-xs text-gray-500 block uppercase tracking-wide">Pulse</span> <strong className="text-lg">{pulse}</strong></div>
                <div className="text-center sm:text-left"><span className="text-xs text-gray-500 block uppercase tracking-wide">Dur</span> <strong className="text-lg">{config.data.sessionDuration}m</strong></div>
                <div className="text-center sm:text-left"><span className="text-xs text-gray-500 block uppercase tracking-wide">Int</span> <strong className="text-lg">{intensity}/10</strong></div>
              </div>

              {/* Box breathing on pause */}
              {status === 'paused' && (
                <div className="text-center space-y-3 py-6 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-lg font-bold text-blue-900">{breathPhases[breathPhase]}</p>
                  <div
                    className="w-24 h-24 rounded-full mx-auto transition-transform duration-1000 shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, #2563eb, #0ea5e9)',
                      transform: breathPhase === 0 ? 'scale(1.2)' : breathPhase === 2 ? 'scale(0.85)' : 'scale(1)',
                    }}
                  />
                  <p className="text-sm text-blue-700 font-medium">Box Breathing — follow the rhythm while paused</p>
                </div>
              )}

              {/* Controls */}
              <div className="flex flex-col gap-3 mt-4">
                {status === 'idle' && (
                  <Button onClick={handleStart} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white w-full py-8 text-xl">
                    <Play className="h-6 w-6 mr-2" /> Start Therapy Session
                  </Button>
                )}
                
                {status === 'running' && (
                  <div className="flex flex-col sm:flex-row gap-3 w-full">
                      <Button onClick={handlePause} size="lg" variant="outline" className="w-full py-8 text-lg border-2 border-gray-300">
                        <Pause className="h-5 w-5 mr-2" /> Pause 
                      </Button>
                      <Button onClick={handleEmergencyStop} size="lg" variant="destructive" className="w-full py-8 text-lg">
                        <Square className="h-5 w-5 mr-2" /> Stop
                      </Button>
                  </div>
                )}
                
                {status === 'paused' && (
                  <div className="flex flex-col sm:flex-row gap-3 w-full">
                      <Button onClick={handleResume} size="lg" className="w-full py-8 text-lg bg-green-600 hover:bg-green-700 text-white">
                        <Play className="h-5 w-5 mr-2" /> Resume
                      </Button>
                      <Button onClick={handleEmergencyStop} size="lg" variant="destructive" className="w-full py-8 text-lg">
                        <Square className="h-5 w-5 mr-2" /> Stop
                      </Button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── POST SESSION ── */}
          {(status === 'completed' || status === 'stopped') && (
            <div className="space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="text-center pt-4">
                <div className="w-20 h-20 rounded-full bg-green-100 border-4 border-green-500 mx-auto flex items-center justify-center shadow-sm">
                  <span className="text-4xl font-bold text-green-600">✓</span>
                </div>
                <p className="text-2xl font-bold mt-4 text-gray-900">{status === 'completed' ? 'Session Complete!' : 'Session Stopped'}</p>
                <p className="text-base text-gray-500 font-medium">{elapsedMin} minute{elapsedMin !== 1 ? 's' : ''} of therapy delivered</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <p className="text-base font-bold text-center mb-4 text-gray-800">How do you feel now? 🩺</p>
                <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                  {Array.from({ length: 11 }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setPostPainLevel(i)}
                      className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 text-base font-bold transition-all shadow-sm ${
                        postPainLevel === i
                          ? 'border-blue-600 bg-blue-600 text-white scale-110 shadow-md'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400'
                      }`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>

              {postPainLevel !== null && prePainLevel > 0 && reductionPct !== null && (() => {
                const tier = getReductionTier(reductionPct);
                const arrow = reductionPct > 0 ? '↓' : reductionPct < 0 ? '↑' : '→';
                return (
                  <div className={`rounded-2xl border-2 p-6 text-center shadow-sm ${tier.border} ${tier.bg} ${tier.text}`}>
                    <p className="text-4xl font-black tabular-nums tracking-tight">{arrow}{Math.abs(reductionPct).toFixed(1)}%</p>
                    <p className="text-lg font-bold mt-1">{tier.label}</p>
                    <div className="mt-4 inline-block bg-white bg-opacity-60 px-4 py-2 rounded-lg border border-opacity-20 border-current">
                        <p className="text-sm font-semibold">
                        Pain dropped from {prePainLevel}/10 to {postPainLevel}/10
                        </p>
                    </div>
                  </div>
                );
              })()}

              <textarea
                placeholder="Any side effects or notes to remember? (optional)"
                rows={3}
                value={sessionNotes}
                onChange={e => setSessionNotes(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-4 text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />

              <Button
                onClick={saveSession}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-7 text-lg font-bold shadow-md"
              >
                Save Session to Dashboard →
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottom status bar for mobile overlap prevention */}
      {status === 'running' && (
        <div className="fixed bottom-0 left-0 right-0 z-40 py-3 px-4 text-center text-sm font-bold bg-green-600 text-white shadow-lg">
          ● Session Active — {formatTime(elapsed)} elapsed
        </div>
      )}
      {status === 'paused' && (
        <div className="fixed bottom-0 left-0 right-0 z-40 py-3 px-4 text-center text-sm font-bold bg-amber-500 text-white shadow-lg">
          ⏸ Session Paused — tap Resume to continue
        </div>
      )}
    </>
  );
};

export default ActiveSessionPanel;