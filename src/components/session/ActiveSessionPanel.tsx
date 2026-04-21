
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Pause, Square, AlertTriangle, Zap, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ActiveSessionPanel = () => {
  const [config, setConfig] = useState<any>(null);
  const [status, setStatus] = useState<'idle' | 'running' | 'paused' | 'completed' | 'stopped'>('idle');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [painBefore, setPainBefore] = useState(5);
  const [postPainLevel, setPostPainLevel] = useState<number | null>(null);
  const [sessionNotes, setSessionNotes] = useState('');
  const [breathPhase, setBreathPhase] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const breathRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const breathPhases = ['Inhale 🫁', 'Hold ⏸', 'Exhale 💨', 'Hold ⏸'];

  useEffect(() => {
    const stored = localStorage.getItem('activeSessionConfig');
    if (stored) {
      const parsed = JSON.parse(stored);
      setConfig(parsed);
      const durationMin = parseInt(parsed.data.sessionDuration) || 20;
      const totalSec = durationMin * 60;
      setTotalTime(totalSec);
      setTimeRemaining(totalSec);
      setPainBefore(parsed.data.painIntensity || 5);
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

  // Breathing animation
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
  const elapsedMin = Math.round(elapsed / 60);
  const progress = totalTime > 0 ? (elapsed / totalTime) * 100 : 0;

  const handleStart = () => setStatus('running');
  const handlePause = () => { setStatus('paused'); if (intervalRef.current) clearInterval(intervalRef.current); };
  const handleResume = () => setStatus('running');

  const handleEmergencyStop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setStatus('stopped');
    toast({ title: 'Session Stopped', description: 'TENS session has been stopped immediately.', variant: 'destructive' });
  };

  const prePainLevel = config?.data?.painIntensity || painBefore;
  const reductionPct = postPainLevel !== null && prePainLevel > 0
    ? ((prePainLevel - postPainLevel) / prePainLevel) * 100
    : null;

  const getReductionTier = (pct: number) => {
    if (pct >= 76) return { border: 'border-green-500', bg: 'bg-green-50', text: 'text-green-700', label: '⭐ Excellent Relief' };
    if (pct >= 51) return { border: 'border-green-400', bg: 'bg-green-50', text: 'text-green-700', label: '✅ Good Relief' };
    if (pct >= 26) return { border: 'border-amber-400', bg: 'bg-amber-50', text: 'text-amber-700', label: '🟡 Moderate Relief' };
    if (pct >= 0) return { border: 'border-red-400', bg: 'bg-red-50', text: 'text-red-600', label: '🔴 Mild Relief' };
    return { border: 'border-red-600', bg: 'bg-red-50', text: 'text-red-700', label: '⚠️ Pain Increased' };
  };

  const getArrow = (pct: number) => pct > 0 ? '↓' : pct < 0 ? '↑' : '→';

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

    const existing = JSON.parse(localStorage.getItem('assessments') || '[]');
    existing.push(session);
    localStorage.setItem('assessments', JSON.stringify(existing));

    toast({ title: 'Session Saved!', description: 'Your TENS session has been recorded to the dashboard.' });
    navigate('/dashboard');
  };

  if (!config) {
    return (
      <Card className="w-full max-w-2xl mx-auto text-center py-12">
        <CardContent>
          <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-medium mb-2">No Session Configured</h3>
          <p className="text-muted-foreground mb-6">Set up your TENS parameters first to start a session.</p>
          <Button asChild className="bg-medical-600 hover:bg-medical-700">
            <Link to="/session-setup">Setup Session</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const freq = config.data.settings?.frequencySetting;
  const pulse = config.data.settings?.pulseDuration;
  const intensity = config.data.settings?.intensitySetting;

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto pb-20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-medical-600" />
            {status === 'completed' ? 'Session Complete' : status === 'stopped' ? 'Session Stopped' : 'Active TENS Session'}
          </CardTitle>
          <CardDescription>
            {config.data.settings?.mode} mode • {config.data.painLocation?.replace('-', ' ')} • Intensity {intensity}/10
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Timer & Controls for active states */}
          {(status === 'idle' || status === 'running' || status === 'paused') && (
            <>
              <div className="text-center">
                <div className="text-7xl sm:text-7xl font-bold tabular-nums text-medical-900 mb-1 timer-display">
                  {formatTime(timeRemaining)}
                </div>
                <p className="text-sm text-muted-foreground text-center mt-1">
                  {freq} · {pulse} · Intensity {intensity}/10
                </p>
                <Progress value={progress} className="h-3 mt-4" />
                <p className="text-sm text-muted-foreground mt-2">
                  {Math.round(progress)}% complete
                </p>
              </div>

              {/* Settings Summary - Desktop */}
              <div className="hidden sm:grid grid-cols-2 gap-3 text-sm border rounded-lg p-4">
                <div><span className="text-muted-foreground">Frequency:</span> <strong>{freq}</strong></div>
                <div><span className="text-muted-foreground">Pulse:</span> <strong>{pulse}</strong></div>
                <div><span className="text-muted-foreground">Duration:</span> <strong>{config.data.sessionDuration} min</strong></div>
                <div><span className="text-muted-foreground">Intensity:</span> <strong>{intensity}/10</strong></div>
              </div>
              {/* Settings Summary - Mobile */}
              <div className="flex sm:hidden flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>Freq: <strong className="text-foreground">{freq}</strong></span>
                <span>Pulse: <strong className="text-foreground">{pulse}</strong></span>
                <span>Dur: <strong className="text-foreground">{config.data.sessionDuration}m</strong></span>
                <span>Int: <strong className="text-foreground">{intensity}/10</strong></span>
              </div>

              {/* Box Breathing on Pause */}
              {status === 'paused' && (
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">{breathPhases[breathPhase]}</p>
                  <div className="breathing-circle w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), #0ea5e9)' }} />
                  <p className="text-xs text-muted-foreground mt-2">Box Breathing — follow the rhythm</p>
                </div>
              )}

              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:justify-center">
                {status === 'idle' && (
                  <Button onClick={handleStart} size="lg" className="bg-medical-600 hover:bg-medical-700 gap-2 w-full sm:w-auto">
                    <Play className="h-5 w-5" /> ▶️ Start Session
                  </Button>
                )}
                {status === 'running' && (
                  <Button onClick={handlePause} size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
                    <Pause className="h-5 w-5" /> ⏸ Pause Session
                  </Button>
                )}
                {status === 'paused' && (
                  <Button onClick={handleResume} size="lg" className="bg-medical-600 hover:bg-medical-700 gap-2 w-full sm:w-auto">
                    <Play className="h-5 w-5" /> ▶️ Resume Session
                  </Button>
                )}
                {(status === 'running' || status === 'paused') && (
                  <Button onClick={handleEmergencyStop} size="lg" variant="destructive" className="gap-2 w-full sm:w-auto">
                    <Square className="h-5 w-5" /> 🛑 Emergency Stop
                  </Button>
                )}
              </div>
            </>
          )}

          {/* Post-session UI */}
          {(status === 'completed' || status === 'stopped') && (
            <div className="space-y-4">
              {/* Header */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 border-2 border-green-500 mx-auto flex items-center justify-center">
                  <span className="text-2xl font-bold text-green-600">✓</span>
                </div>
                <p className="text-xl font-bold text-center mt-3">Session Complete! 🎉</p>
                <p className="text-sm text-muted-foreground text-center">{elapsedMin} minutes of therapy completed</p>
                <p className="text-xs text-muted-foreground text-center mt-1">{freq} · {pulse}</p>
              </div>

              {/* Pain Picker */}
              <div>
                <p className="text-sm font-medium text-center mb-3">How do you feel now? 🩺</p>
                <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                  {Array.from({ length: 11 }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setPostPainLevel(i)}
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 text-xs sm:text-sm cursor-pointer pain-btn ${
                        postPainLevel === i
                          ? 'pain-btn-selected'
                          : 'border-gray-200 bg-white text-gray-700'
                      }`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Reduction Badge */}
              {postPainLevel !== null && prePainLevel > 0 && reductionPct !== null && (() => {
                const tier = getReductionTier(reductionPct);
                const arrow = getArrow(reductionPct);
                return (
                  <div className={`rounded-xl border-2 p-3 sm:p-4 text-center mt-4 transition-all animate-in ${tier.border} ${tier.bg} ${tier.text}`}>
                    <p className="text-2xl sm:text-3xl font-bold tabular-nums reduction-pct">{arrow}{Math.abs(reductionPct).toFixed(1)}%</p>
                    <p className="text-sm font-medium mt-1">{tier.label}</p>
                    <p className="text-xs text-muted-foreground mt-2">(pre − post) ÷ pre × 100 = {reductionPct.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">Pain: {prePainLevel}/10 → {postPainLevel}/10</p>
                  </div>
                );
              })()}

              {postPainLevel !== null && prePainLevel === 0 && (
                <p className="text-sm text-muted-foreground text-center mt-4">N/A — pre-session pain was 0</p>
              )}

              {/* Notes */}
              <textarea
                placeholder="Any side effects or notes... (optional)"
                rows={2}
                value={sessionNotes}
                onChange={e => setSessionNotes(e.target.value)}
                className="w-full rounded-xl border border-border p-3 text-sm resize-none mt-3 focus:outline-none focus:ring-2 focus:ring-medical-500"
              />

              {/* Save */}
              <Button onClick={saveSession} className="w-full bg-medical-600 hover:bg-medical-700 text-white rounded-xl py-3 font-semibold mt-4">
                Save Session & View Dashboard
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-between">
          <Button variant="outline" asChild>
            <Link to="/session-setup">Reconfigure</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/dashboard">Dashboard</Link>
          </Button>
        </CardFooter>
      </Card>

      {/* Bottom Status Bar */}
      {status === 'running' && (
        <div className="fixed bottom-0 left-0 right-0 z-40 py-3 px-4 text-center text-sm font-medium bg-green-600 text-white transition-colors duration-300">
          ● Session Active — {formatTime(elapsed)} therapy completed
        </div>
      )}
      {status === 'paused' && (
        <div className="fixed bottom-0 left-0 right-0 z-40 py-3 px-4 text-center text-sm font-medium bg-amber-500 text-white transition-colors duration-300">
          ⏸ Session Paused
        </div>
      )}
    </>
  );
};

export default ActiveSessionPanel;
