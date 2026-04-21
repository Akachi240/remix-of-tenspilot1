import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Clock, BarChart, BarChart3, TrendingDown, BookOpen, Home, User, Settings } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useIsMobile } from '@/hooks/use-mobile';

interface JournalEntry {
  id: string;
  date: string;
  painLevel: number;
  notes: string;
  createdAt: string;
}

interface TensSession {
  type: string;
  timestamp: string;
  data: {
    mode: string;
    placement: string;
    duration: number;
    painBefore: number;
    painAfter: number;
    painReduction: number;
    intensity: number;
    frequency: string;
    completed: boolean;
    reductionPct?: number | null;
    painTypeMode?: string | null;
    notes?: string;
  };
}

interface ChartPoint {
  date: string;
  painBefore: number;
  painAfter: number;
}

const getReductionTier = (pct: number) => {
  if (pct >= 76) return { border: 'border-green-500', bg: 'bg-green-50', text: 'text-green-700', label: '⭐ Excellent' };
  if (pct >= 51) return { border: 'border-green-400', bg: 'bg-green-50', text: 'text-green-700', label: '✅ Good' };
  if (pct >= 26) return { border: 'border-amber-400', bg: 'bg-amber-50', text: 'text-amber-700', label: '🟡 Moderate' };
  if (pct >= 0) return { border: 'border-red-400', bg: 'bg-red-50', text: 'text-red-600', label: '🔴 Mild' };
  return { border: 'border-red-600', bg: 'bg-red-50', text: 'text-red-700', label: '⚠️ Increased' };
};

const getArrow = (pct: number) => pct > 0 ? '↓' : pct < 0 ? '↑' : '→';

const UserDashboard = () => {
  const [sessions, setSessions] = useState<TensSession[]>([]);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Mobile tab
  const [mobileTab, setMobileTab] = useState<'home' | 'history' | 'charts' | 'profile'>('home');

  // Journal state
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [journalDate, setJournalDate] = useState(new Date().toISOString().split('T')[0]);
  const [journalPain, setJournalPain] = useState<number | null>(null);
  const [journalNotes, setJournalNotes] = useState('');

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('assessments') || '[]');
    const tensSessions = stored
      .filter((a: TensSession) => a.type === 'tens-session')
      .sort((a: TensSession, b: TensSession) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    setSessions(tensSessions);

    setChartData(
      tensSessions.slice().reverse().map((s: TensSession) => ({
        date: new Date(s.timestamp).toLocaleDateString(),
        painBefore: s.data.painBefore,
        painAfter: s.data.painAfter,
      }))
    );
  }, []);

  // Load journal
  useEffect(() => {
    try {
      setJournalEntries(JSON.parse(localStorage.getItem('tenspilot-journal') || '[]'));
    } catch { setJournalEntries([]); }
  }, []);

  const saveJournalEntry = () => {
    if (journalPain === null) return;
    const entry: JournalEntry = {
      id: crypto.randomUUID(),
      date: journalDate,
      painLevel: journalPain,
      notes: journalNotes,
      createdAt: new Date().toISOString(),
    };
    const updated = [entry, ...journalEntries];
    setJournalEntries(updated);
    localStorage.setItem('tenspilot-journal', JSON.stringify(updated));
    setJournalPain(null);
    setJournalNotes('');
    setJournalDate(new Date().toISOString().split('T')[0]);
  };

  // Progress milestones
  const getMilestones = () => {
    const pcts = sessions.map(s => s.data.reductionPct).filter((p): p is number => p != null);
    const meanPct = pcts.length > 0 ? pcts.reduce((a, b) => a + b, 0) / pcts.length : 0;
    const bestPct = pcts.length > 0 ? Math.max(...pcts) : 0;

    const uniqueDays = [...new Set(sessions.map(s => new Date(s.timestamp).toISOString().split('T')[0]))].sort();
    let hasStreak = false;
    if (uniqueDays.length >= 7) {
      for (let i = 0; i <= uniqueDays.length - 7; i++) {
        const start = new Date(uniqueDays[i]).getTime();
        const end = new Date(uniqueDays[i + 6]).getTime();
        if (end - start === 6 * 86400000) { hasStreak = true; break; }
      }
    }

    return [
      { emoji: '🎉', title: 'First Session', earned: sessions.length >= 1 },
      { emoji: '🏅', title: '5 Sessions', earned: sessions.length >= 5 },
      { emoji: '🏆', title: '10 Sessions', earned: sessions.length >= 10 },
      { emoji: '📈', title: '50% Avg Relief', earned: meanPct >= 50 },
      { emoji: '⭐', title: `Best Session${bestPct > 0 ? ` (${bestPct}%)` : ''}`, earned: bestPct > 0 },
      { emoji: '🔥', title: '7-Day Streak', earned: hasStreak },
    ];
  };
  const milestones = getMilestones();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const totalSessions = sessions.length;
  const avgReduction = totalSessions > 0
    ? (sessions.reduce((sum, s) => sum + s.data.painReduction, 0) / totalSessions).toFixed(1)
    : '0';
  const latestSession = sessions[0] || null;

  // Therapy Insights
  const getInsights = () => {
    if (sessions.length < 3) return null;
    const placementCounts: Record<string, number> = {};
    const modeGroups: Record<string, number[]> = {};
    let totalPct = 0;
    let pctCount = 0;

    sessions.forEach(s => {
      placementCounts[s.data.placement] = (placementCounts[s.data.placement] || 0) + 1;
      const mode = s.data.painTypeMode || 'unknown';
      if (!modeGroups[mode]) modeGroups[mode] = [];
      if (s.data.reductionPct != null) {
        modeGroups[mode].push(s.data.reductionPct);
        totalPct += s.data.reductionPct;
        pctCount++;
      }
    });

    const mostTreatedLocation = Object.entries(placementCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    
    let bestMode = 'N/A';
    let bestModeAvg = -Infinity;
    Object.entries(modeGroups).forEach(([mode, pcts]) => {
      if (pcts.length > 0) {
        const avg = pcts.reduce((a, b) => a + b, 0) / pcts.length;
        if (avg > bestModeAvg) { bestModeAvg = avg; bestMode = mode; }
      }
    });
    const modeLabel = bestMode === 'acute' ? 'Conventional TENS' : bestMode === 'chronic' ? 'Acupuncture-like TENS' : bestMode;
    const avgPct = pctCount > 0 ? (totalPct / pctCount) : 0;

    return { mostTreatedLocation, modeLabel, avgPct };
  };

  const insights = getInsights();

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all session data? This cannot be undone.')) {
      localStorage.removeItem('assessments');
      localStorage.removeItem('activeSessionConfig');
      setSessions([]);
      setChartData([]);
    }
  };

  // ─── Shared content sections ───

  const StatsCards = () => (
    <div className="grid grid-cols-3 gap-2 sm:gap-4">
      <Card className="animate-in relative overflow-hidden medical-card">
        <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: 'var(--accent-hex)' }} />
        <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
          <CardDescription className="text-xs">Total Sessions</CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0">
          <p className="text-xl sm:text-3xl font-bold stat-number" style={{ color: 'var(--ink)' }}>{totalSessions}</p>
        </CardContent>
      </Card>
      <Card className="animate-in relative overflow-hidden medical-card">
        <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: '#4ade80' }} />
        <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
          <CardDescription className="text-xs">Avg Reduction</CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0">
          <p className="text-xl sm:text-3xl font-bold stat-number flex items-center gap-1" style={{ color: 'var(--ink)' }}>
            <TrendingDown className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" /> {avgReduction}
          </p>
        </CardContent>
      </Card>
      <Card className="animate-in relative overflow-hidden medical-card">
        <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: '#f59e0b' }} />
        <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
          <CardDescription className="text-xs">Last Session</CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0">
          <p className="text-xs sm:text-sm font-medium">{latestSession ? formatDate(latestSession.timestamp) : '—'}</p>
          {latestSession && (
            <Badge className={latestSession.data.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
              {latestSession.data.completed ? 'Completed' : 'Stopped Early'}
            </Badge>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const HistoryList = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-medium">Session History</h3>
      </div>
      <div className="space-y-4">
        {sessions.map((session, index) => {
          const rPct = session.data.reductionPct;
          const tier = rPct != null ? getReductionTier(rPct) : null;
          return (
            <div key={index} className="border rounded-lg p-3 sm:p-4 medical-card">
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-medium">📍 {session.data.placement?.replace('-', ' ')}</h4>
                    {session.data.painTypeMode === 'acute' && (
                      <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: 'rgba(74,143,196,0.1)', color: 'var(--accent-dark)', border: '1px solid rgba(74,143,196,0.2)' }}>🦴 Musculoskeletal</span>
                    )}
                    {session.data.painTypeMode === 'chronic' && (
                      <span className="bg-purple-100 text-purple-700 border border-purple-200 rounded-full px-2 py-0.5 text-xs font-medium">⚡ Neuropathic</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{formatDate(session.timestamp)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {tier && rPct != null && (
                    <span className={`${tier.bg} ${tier.text} ${tier.border} border rounded-full px-2 py-0.5 text-xs font-medium`}>
                      {getArrow(rPct)}{rPct}% · {tier.label}
                    </span>
                  )}
                  <Badge className={session.data.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {session.data.completed ? 'Completed' : 'Stopped'}
                  </Badge>
                </div>
              </div>
              <div className="mt-2 text-xs sm:text-sm grid grid-cols-2 gap-x-3 gap-y-1">
                <span>Mode: {session.data.mode}</span>
                <span>Intensity: {session.data.intensity}/10</span>
                <span>Duration: {session.data.duration} min</span>
                <span>Pain: {session.data.painBefore} → {session.data.painAfter} (-{session.data.painReduction})</span>
              </div>
              {session.data.notes && (
                <p className="text-xs text-muted-foreground mt-2 italic">📝 {session.data.notes}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const ChartsSection = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-medium">Pain Relief Trend</h3>
      </div>
      {chartData.length > 1 ? (
        <div className="h-48 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Area type="monotone" dataKey="painBefore" stroke="#f87171" fill="#fecaca" name="Pain Before" />
              <Area type="monotone" dataKey="painAfter" stroke="#0ea5e9" fill="#bae6fd" name="Pain After" />
            </AreaChart>
          </ResponsiveContainer>
          <p className="text-center text-sm text-muted-foreground mt-2">
            Red = pain before session, Blue = pain after session
          </p>
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg medical-card">
          <p className="text-muted-foreground mb-3">
            {chartData.length === 0 ? 'No session data yet' : 'Complete more sessions to see trends'}
          </p>
        </div>
      )}

      {/* Insights */}
      {insights && (
        <Card className="animate-in medical-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">💡 Therapy Insights</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-2">
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <div>
                <p className="text-xs text-muted-foreground">📍 Most Treated Location</p>
                <p className="text-base sm:text-xl font-bold capitalize" style={{ color: 'var(--ink)' }}>{insights.mostTreatedLocation.replace('-', ' ')}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">⚡ Most Effective Mode</p>
                <p className="text-base sm:text-xl font-bold" style={{ color: 'var(--ink)' }}>{insights.modeLabel}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const ProfileSection = () => (
    <div className="space-y-4">
      {/* Journal */}
      <h3 className="text-lg font-medium">📔 Pain Journal</h3>
      <div className="medical-card p-4 space-y-3">
        <div>
          <label className="text-sm font-medium mb-1 block">Date</label>
          <input
            type="date"
            value={journalDate}
            onChange={e => setJournalDate(e.target.value)}
            className="w-full rounded-xl border border-border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Pain Level</label>
          <div className="flex flex-wrap justify-center gap-1.5">
            {Array.from({ length: 11 }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setJournalPain(i)}
                className={`w-9 h-9 rounded-full border-2 font-semibold text-xs cursor-pointer transition-all pain-btn ${
                  journalPain === i
                    ? 'pain-btn-selected'
                    : 'border-gray-200 bg-white text-gray-700'
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>
        <Textarea
          placeholder="How are you feeling today?"
          value={journalNotes}
          onChange={e => setJournalNotes(e.target.value)}
          rows={3}
          className="w-full rounded-xl text-sm resize-none"
        />
        <Button
          onClick={saveJournalEntry}
          disabled={journalPain === null}
          className="w-full btn-primary"
        >
          Save Entry
        </Button>
      </div>

      {/* Journal entries */}
      <div className="space-y-3">
        {journalEntries.slice(0, 5).map(entry => {
          const painColor = entry.painLevel <= 3
            ? 'bg-green-100 text-green-700'
            : entry.painLevel <= 6
              ? 'bg-amber-100 text-amber-700'
              : 'bg-red-100 text-red-700';
          return (
            <div key={entry.id} className="medical-card p-3 flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="text-xs font-bold" style={{ color: 'var(--ink)' }}>
                  {new Date(entry.date).toLocaleDateString()}
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs ${painColor} inline-block mt-1`}>
                  {entry.painLevel}/10
                </span>
              </div>
              {entry.notes && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{entry.notes}</p>
              )}
            </div>
          );
        })}
        {journalEntries.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4 italic">
            No journal entries yet. Start tracking how you feel each day.
          </p>
        )}
      </div>

      <Separator />

      {/* Settings */}
      <Button variant="outline" size="sm" onClick={clearAllData} className="w-full btn-outline-ice">
        Clear All Data
      </Button>
    </div>
  );

  // ═══════════════════════════════════════
  // MOBILE LAYOUT
  // ═══════════════════════════════════════
  if (isMobile) {
    if (sessions.length === 0) {
      return (
        <div className="text-center py-12">
          <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-medium mb-2">No Sessions Yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Complete your first TENS therapy session to start tracking your pain relief progress.
          </p>
          <Button asChild className="btn-primary">
            <Link to="/session-setup">Setup First Session</Link>
          </Button>
        </div>
      );
    }

    return (
      <div className="pb-20">
        {/* Tab content */}
        <div className="space-y-4">
          {mobileTab === 'home' && (
            <>
              <h2 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
                Welcome back 👋
              </h2>
              <Button asChild className="w-full btn-primary py-3 rounded-xl">
                <Link to="/session-setup">Start a Session</Link>
              </Button>
              <StatsCards />
            </>
          )}

          {mobileTab === 'history' && <HistoryList />}

          {mobileTab === 'charts' && <ChartsSection />}

          {mobileTab === 'profile' && <ProfileSection />}
        </div>

        {/* Fixed bottom nav */}
        <div
          className="fixed bottom-0 left-0 right-0 flex justify-around items-center py-3 z-50"
          style={{
            background: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderTop: '1px solid rgba(255,255,255,0.6)',
          }}
        >
          {([
            { key: 'home' as const, icon: Home, label: 'Home' },
            { key: 'history' as const, icon: Clock, label: 'History' },
            { key: 'charts' as const, icon: BarChart3, label: 'Charts' },
            { key: 'profile' as const, icon: User, label: 'Profile' },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setMobileTab(tab.key)}
              className="flex flex-col items-center gap-0.5 px-3"
            >
              <tab.icon
                className="h-5 w-5"
                style={{ color: mobileTab === tab.key ? 'var(--accent-hex)' : 'var(--ink-subtle)' }}
              />
              <span
                className="text-[10px] font-medium"
                style={{ color: mobileTab === tab.key ? 'var(--accent-hex)' : 'var(--ink-subtle)' }}
              >
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // DESKTOP LAYOUT (unchanged)
  // ═══════════════════════════════════════
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>TensPilot+ Dashboard</CardTitle>
            <CardDescription>Track your sessions and pain relief progress</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={clearAllData}>Clear All Data</Button>
        </div>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-medium mb-2">No Sessions Yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Complete your first TENS therapy session to start tracking your pain relief progress.
            </p>
            <Button asChild className="btn-primary">
              <Link to="/session-setup">Setup First Session</Link>
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="summary">
            <TabsList className="grid grid-cols-4 w-full mb-6">
              <TabsTrigger value="summary">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Summary</span>
              </TabsTrigger>
              <TabsTrigger value="history">
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">History</span>
              </TabsTrigger>
              <TabsTrigger value="charts">
                <TrendingDown className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Charts</span>
              </TabsTrigger>
              <TabsTrigger value="journal">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Journal</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Overview</h3>
                <button
                  onClick={() => navigate('/report')}
                  className="text-sm border border-border rounded-xl px-3 py-1.5 hover:bg-accent/10 transition-colors"
                >
                  📄 Export Doctor's Report
                </button>
              </div>

              <StatsCards />

              {insights ? (
                <Card className="animate-in medical-card">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base">💡 Therapy Insights</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 pt-2">
                    <div className="grid grid-cols-2 gap-2 sm:gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">📍 Most Treated Location</p>
                        <p className="text-base sm:text-xl font-bold capitalize" style={{ color: 'var(--ink)' }}>{insights.mostTreatedLocation.replace('-', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">⚡ Most Effective Mode</p>
                        <p className="text-base sm:text-xl font-bold" style={{ color: 'var(--ink)' }}>{insights.modeLabel}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">
                      Your therapy is most effective for {insights.mostTreatedLocation.replace('-', ' ')} pain.
                      Overall, {insights.modeLabel} provides your best results with an average {insights.avgPct.toFixed(1)}% pain reduction.
                    </p>
                  </CardContent>
                </Card>
              ) : sessions.length > 0 && (
                <Card className="medical-card">
                  <CardContent className="py-4">
                    <p className="text-sm text-muted-foreground italic text-center">
                      📊 Complete at least 3 sessions to unlock your personalised therapy insights.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Progress Milestones */}
              <Card className="animate-in medical-card">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base">🏆 Progress Milestones</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-2">
                  <div className="flex flex-wrap gap-2">
                    {milestones.map((m, i) => (
                      <div
                        key={i}
                        className={`rounded-xl border p-3 text-center text-xs ${
                          m.earned
                            ? 'medical-card'
                            : 'bg-gray-50 border-gray-200 opacity-50'
                        }`}
                      >
                        <div className="text-2xl mb-1">{m.emoji}</div>
                        <div className="font-semibold">{m.title}</div>
                        {!m.earned && <div className="text-xs text-gray-400 mt-0.5">🔒 Locked</div>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {latestSession && (
                <Card className="medical-card">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base">Latest Session Details</CardTitle>
                    <CardDescription className="text-xs">{formatDate(latestSession.timestamp)}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-muted-foreground">Location:</span> <strong className="capitalize">{latestSession.data.placement?.replace('-', ' ')}</strong></div>
                      <div><span className="text-muted-foreground">Mode:</span> <strong>{latestSession.data.mode}</strong></div>
                      <div><span className="text-muted-foreground">Intensity:</span> <strong>{latestSession.data.intensity}/10</strong></div>
                      <div><span className="text-muted-foreground">Duration:</span> <strong>{latestSession.data.duration} min</strong></div>
                      <div><span className="text-muted-foreground">Pain Before:</span> <strong>{latestSession.data.painBefore}/10</strong></div>
                      <div><span className="text-muted-foreground">Pain After:</span> <strong>{latestSession.data.painAfter}/10</strong></div>
                    </div>
                    <div className="mt-3 text-center p-3 rounded-lg" style={{ background: 'rgba(74,143,196,0.06)' }}>
                      <span className="text-sm text-muted-foreground">Pain Reduction: </span>
                      <span className="font-bold" style={{ color: 'var(--ink)' }}>{latestSession.data.painReduction} points</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="history">
              <HistoryList />
            </TabsContent>

            <TabsContent value="charts">
              <ChartsSection />
              <Separator className="my-6" />
              <div className="flex justify-center">
                <div className="text-center max-w-md">
                  <h3 className="font-medium mb-2">Track Your Progress</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Regular TENS sessions help identify what settings work best for your pain. Try to log every session for accurate tracking.
                  </p>
                  <Button asChild className="btn-primary">
                    <Link to="/session-setup">New Session</Link>
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="journal">
              <ProfileSection />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="outline" asChild className="btn-outline-ice"><Link to="/">Home</Link></Button>
        <div className="flex gap-3">
          {sessions.length > 0 && (
            <Button variant="outline" asChild className="btn-outline-ice"><Link to="/education">Education Guide</Link></Button>
          )}
          <Button asChild className="btn-primary">
            <Link to="/session-setup">{sessions.length === 0 ? 'Setup First Session' : 'New Session'}</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default UserDashboard;
