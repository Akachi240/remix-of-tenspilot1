import React, { useState, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Download, Image as ImageIcon, Video, X, FileText, Send, User, Pill, Zap, HeartPulse } from 'lucide-react';
import { useProfiles } from '@/context/ProfileContext';
import { RingProgress } from '@/components/ui/ring-progress';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const UserDashboard = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { activeProfile } = useProfiles();
  const [clinicalMedia, setClinicalMedia] = useState<{ url: string; type: string }[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const avgReduction = useMemo(() => {
    if (!activeProfile?.sessionHistory || activeProfile.sessionHistory.length === 0) return 0;
    const totalReduction = activeProfile.sessionHistory.reduce(
      (sum, log) => sum + (log.painBefore - log.painAfter), 0
    );
    return totalReduction / activeProfile.sessionHistory.length;
  }, [activeProfile?.sessionHistory]);

  const sessionHistory = useMemo(() => {
    return [...(activeProfile?.sessionHistory || [])].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [activeProfile?.sessionHistory]);

  const bestReduction = useMemo(() => sessionHistory.reduce(
    (best, session) => Math.max(best, session.painBefore - session.painAfter), 0
  ), [sessionHistory]);

  const totalDuration = useMemo(() => sessionHistory.reduce((sum, session) => sum + (session.parameters?.duration || 0), 0), [sessionHistory]);

  const trendSessions = useMemo(() => [...sessionHistory].reverse().slice(-8), [sessionHistory]);

  const trendPoints = useMemo(() => trendSessions.map((session, index) => {
    const x = trendSessions.length <= 1 ? 150 : 16 + index * (268 / (trendSessions.length - 1));
    const y = 124 - (Math.max(0, Math.min(10, session.painAfter)) / 10) * 96;
    return `${x},${y}`;
  }).join(' '), [trendSessions]);

  if (!activeProfile) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="h-20 w-20 rounded-full bg-blue-50 flex items-center justify-center">
          <User className="h-10 w-10 text-blue-300" />
        </div>
        <p className="text-slate-500 text-lg font-medium">No profile selected.</p>
        <p className="text-slate-400 text-sm">Go to Settings to create a patient profile.</p>
        <Button onClick={() => navigate('/settings')} className="mt-2 bg-blue-600 hover:bg-blue-700 rounded-xl">
          Go to Settings
        </Button>
      </div>
    );
  }

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newMedia = Array.from(files).map(file => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' : 'image'
    }));
    setClinicalMedia(prev => [...prev, ...newMedia]);
  };

  const removeMedia = (index: number) => {
    setClinicalMedia(prev => prev.filter((_, i) => i !== index));
  };

  // Convert avg pain reduction (0–10 scale) to a ring percentage (0–100)
  const painRingValue = Math.min(100, (avgReduction / 10) * 100);
  const formatSessionDate = (date: string) =>
    new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  const generateReport = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      let yPosition = 20;
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;

      doc.setFontSize(22);
      doc.setTextColor(46, 111, 170);
      doc.text("TensPilot+ Clinical Report", margin, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, margin, yPosition);
      yPosition += 15;

      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("PATIENT PROFILE", margin, yPosition);
      yPosition += 8;

      doc.setFontSize(11);
      doc.setTextColor(50, 50, 50);
      doc.text(`Name: ${activeProfile.name}`, margin, yPosition);
      yPosition += 6;
      if (activeProfile.age) { doc.text(`Age: ${activeProfile.age} years`, margin, yPosition); yPosition += 6; }
      if (activeProfile.dateOfBirth) { doc.text(`Date of Birth: ${activeProfile.dateOfBirth}`, margin, yPosition); yPosition += 6; }
      if (activeProfile.supervisingPhysician) { doc.text(`Supervising Physician: ${activeProfile.supervisingPhysician}`, margin, yPosition); yPosition += 6; }
      yPosition += 6;

      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("THERAPY OVERVIEW", margin, yPosition);
      yPosition += 8;

      doc.setFontSize(11);
      doc.text(`Total Sessions: ${activeProfile.sessionHistory?.length || 0}`, margin, yPosition);
      yPosition += 6;
      doc.text(`Average Pain Reduction: ${avgReduction.toFixed(1)} points`, margin, yPosition);
      yPosition += 6;
      const totalDuration = activeProfile.sessionHistory?.reduce((sum, s) => sum + (s.parameters?.duration || 0), 0) || 0;
      doc.text(`Total Duration: ${totalDuration} minutes`, margin, yPosition);
      yPosition += 12;

      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("SESSION JOURNAL", margin, yPosition);
      yPosition += 8;

      if (activeProfile.sessionHistory && activeProfile.sessionHistory.length > 0) {
        doc.setFontSize(9);
        activeProfile.sessionHistory.forEach((session, index) => {
          if (yPosition > pageHeight - 30) { doc.addPage(); yPosition = margin; }
          doc.text(`Session ${index + 1}: ${session.date}`, margin, yPosition);
          yPosition += 4;
          doc.text(`Area: ${session.placement} | Pain: ${session.painBefore}/10 → ${session.painAfter}/10`, margin, yPosition);
          yPosition += 6;
        });
      } else {
        doc.setFontSize(9);
        doc.text("No sessions recorded.", margin, yPosition);
        yPosition += 4;
      }
      yPosition += 8;

      if (activeProfile.medications && activeProfile.medications.length > 0) {
        if (yPosition > pageHeight - 40) { doc.addPage(); yPosition = margin; }
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text("MEDICATIONS", margin, yPosition);
        yPosition += 8;
        doc.setFontSize(10);
        activeProfile.medications.forEach((med, index) => {
          if (yPosition > pageHeight - 20) { doc.addPage(); yPosition = margin; }
          doc.text(`${index + 1}. ${med}`, margin, yPosition);
          yPosition += 5;
        });
      }

      doc.save(`TensPilot_Report_${activeProfile.name.replace(/\s/g, '_')}.pdf`);
      toast({ title: 'Report downloaded', description: 'The clinical PDF is ready for review or sharing.' });
      return true;
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({ title: 'Export failed', description: 'The clinical report could not be generated.', variant: 'destructive' });
      return false;
    }
  };

  const handleSendToDoctor = async () => {
    try {
      const reportReady = await generateReport();
      if (!reportReady) return;
      const fileName = `TensPilot_Report_${activeProfile.name.replace(/\s/g, '_')}.pdf`;
      const subject = encodeURIComponent(`TensPilot+ Clinical Report - ${activeProfile.name}`);
      const body = encodeURIComponent(
        `Dear Doctor,\n\nPlease find attached my TensPilot+ clinical report.\n\nPatient: ${activeProfile.name}\nTotal sessions: ${sessionHistory.length}\nAverage relief: ${avgReduction.toFixed(1)} points\n\nThe report has been downloaded as ${fileName}. Please attach it to this email before sending.\n\nRegards,\n${activeProfile.name}`
      );
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
      toast({ title: 'Email draft opened', description: 'Attach the downloaded PDF before sending it to your doctor.' });
    } catch (error) {
      console.error('Doctor share error:', error);
      toast({ title: 'Share failed', description: 'The clinical report could not be prepared for sharing.', variant: 'destructive' });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-20 px-4 mt-6">

      {/* ── Profile Header ── */}
      <Card className="rounded-3xl border border-white/30 bg-gradient-to-br from-white to-blue-50 shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0 shadow-inner">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{activeProfile.name}</h2>
                <p className="text-slate-500 text-sm mt-0.5">{activeProfile.primaryCondition}</p>
                {activeProfile.supervisingPhysician && (
                  <p className="text-xs text-slate-400 mt-1">Dr. {activeProfile.supervisingPhysician}</p>
                )}
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Button onClick={generateReport} variant="outline" className="border-blue-200 text-blue-700 rounded-xl">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button onClick={handleSendToDoctor} className="bg-blue-600 hover:bg-blue-700 rounded-xl">
                <Send className="h-4 w-4 mr-2" />
                Send to Doctor
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <button
          onClick={() => navigate('/pain-tracker')}
          className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-left"
        >
          <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
            <HeartPulse className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">Track Pain</p>
            <p className="text-xs text-slate-400">Log pain level</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/session-setup')}
          className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-left"
        >
          <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Zap className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">Start Session</p>
            <p className="text-xs text-slate-400">Begin therapy</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/report')}
          className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-left col-span-2 md:col-span-1"
        >
          <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
            <FileText className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">View Reports</p>
            <p className="text-xs text-slate-400">Full history</p>
          </div>
        </button>
      </div>

      {/* ── Stats + Media ── */}
      <Card className="rounded-3xl border border-white/30 bg-white/90 shadow-xl">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
            <Activity className="h-5 w-5 text-blue-500" />
            Session History Dashboard
          </CardTitle>
          <CardDescription className="text-slate-400">
            Completed TENS sessions with pain outcomes and therapy adherence.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Total Sessions</p>
              <p className="mt-1 text-3xl font-bold text-slate-900 tabular-nums">{sessionHistory.length}</p>
            </div>
            <div className="rounded-2xl border border-green-100 bg-green-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Average Relief</p>
              <p className="mt-1 text-3xl font-bold text-green-600 tabular-nums">{avgReduction.toFixed(1)} pts</p>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Best Session</p>
              <p className="mt-1 text-3xl font-bold text-blue-600 tabular-nums">{bestReduction.toFixed(1)} pts</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            <div className="lg:col-span-2 rounded-2xl border border-slate-100 bg-white p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <p className="font-semibold text-slate-800">Pain Trend</p>
                  <p className="text-xs text-slate-400">After-session score, lower is better</p>
                </div>
                <p className="text-xs font-semibold text-slate-400">{totalDuration} min total</p>
              </div>
              <svg viewBox="0 0 300 140" className="w-full h-36" role="img" aria-label="Pain trend over time">
                <line x1="16" y1="28" x2="284" y2="28" stroke="#e2e8f0" strokeWidth="1" />
                <line x1="16" y1="76" x2="284" y2="76" stroke="#e2e8f0" strokeWidth="1" />
                <line x1="16" y1="124" x2="284" y2="124" stroke="#e2e8f0" strokeWidth="1" />
                {trendPoints && (
                  <>
                    <polyline points={trendPoints} fill="none" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    {trendSessions.map((session, index) => {
                      const x = trendSessions.length <= 1 ? 150 : 16 + index * (268 / (trendSessions.length - 1));
                      const y = 124 - (Math.max(0, Math.min(10, session.painAfter)) / 10) * 96;
                      return <circle key={`${session.date}-${index}`} cx={x} cy={y} r="5" fill="#0284c7" stroke="#fff" strokeWidth="2" />;
                    })}
                  </>
                )}
              </svg>
            </div>

            <div className="lg:col-span-3 rounded-2xl border border-slate-100 bg-white overflow-hidden">
              <div className="hidden md:grid grid-cols-7 gap-2 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                <span>Date</span>
                <span>Mode</span>
                <span>Location</span>
                <span>Duration</span>
                <span className="text-center">Before</span>
                <span className="text-center">After</span>
                <span className="text-right">Relief</span>
              </div>
              <div className="divide-y divide-slate-100">
                {sessionHistory.length > 0 ? (
                  sessionHistory.slice(0, 6).map((session, index) => {
                    const relief = session.painBefore - session.painAfter;
                    return (
                      <div key={`${session.date}-${index}`} className="grid grid-cols-2 md:grid-cols-7 gap-2 px-4 py-3 text-sm">
                        <div>
                          <p className="md:hidden text-xs font-semibold text-slate-400">Date</p>
                          <p className="font-semibold text-slate-800">{formatSessionDate(session.date)}</p>
                        </div>
                        <div>
                          <p className="md:hidden text-xs font-semibold text-slate-400">Mode</p>
                          <p className="text-slate-700">{session.modeName || session.painType}</p>
                        </div>
                        <div>
                          <p className="md:hidden text-xs font-semibold text-slate-400">Location</p>
                          <p className="capitalize text-slate-600">{session.placement?.replace('-', ' ') || 'Unknown'}</p>
                        </div>
                        <div>
                          <p className="md:hidden text-xs font-semibold text-slate-400">Duration</p>
                          <p className="text-slate-600 tabular-nums">{session.parameters?.duration || 0} min</p>
                        </div>
                        <div className="md:text-center">
                          <p className="md:hidden text-xs font-semibold text-slate-400">Before</p>
                          <p className="font-semibold text-slate-700 tabular-nums">{session.painBefore}/10</p>
                        </div>
                        <div className="md:text-center">
                          <p className="md:hidden text-xs font-semibold text-slate-400">After</p>
                          <p className="font-semibold text-slate-700 tabular-nums">{session.painAfter}/10</p>
                        </div>
                        <div className="md:text-right">
                          <p className="md:hidden text-xs font-semibold text-slate-400">Relief</p>
                          <p className={`font-bold tabular-nums ${relief > 0 ? 'text-green-600' : relief < 0 ? 'text-red-600' : 'text-slate-500'}`}>
                            {relief > 0 ? '-' : relief < 0 ? '+' : ''}{Math.abs(relief)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-4 py-10 text-center">
                    <p className="font-semibold text-slate-600">No completed sessions yet</p>
                    <p className="text-sm text-slate-400 mt-1">Saved therapy sessions will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Left Column */}
        <div className="md:col-span-1 space-y-6">

          {/* KPI Stats */}
          <Card className="rounded-3xl border border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-slate-700">
                <Activity className="h-4 w-4 text-blue-500" />
                Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 text-center">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Sessions</p>
                  <p className="text-4xl font-bold text-slate-900 mt-1 tabular-nums">
                    {activeProfile.sessionHistory?.length || 0}
                  </p>
                </div>
                <div className="rounded-2xl bg-green-50 border border-green-100 p-4 text-center">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Avg Pain Relief</p>
                  <p className="text-4xl font-bold text-green-600 mt-1 tabular-nums">
                    {avgReduction.toFixed(1)}
                    <span className="text-base font-normal text-green-400"> pts</span>
                  </p>
                </div>
                <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4 text-center">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Medications</p>
                  <p className="text-4xl font-bold text-blue-600 mt-1 tabular-nums">
                    {activeProfile.medications?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pain Relief Ring */}
          <Card className="rounded-3xl border border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
            <CardContent className="p-6 flex flex-col items-center gap-2">
              <p className="text-sm font-semibold text-slate-500 mb-2">Pain Reduction</p>
              <RingProgress
                value={painRingValue}
                size={140}
                strokeWidth={12}
                label="avg relief"
                sublabel="/ 10 pts"
                color="var(--ring-fill, #22c55e)"
                live={avgReduction > 0}
              >
                <span className="text-3xl font-bold tabular-nums text-slate-800">
                  {avgReduction.toFixed(1)}
                </span>
                <span className="text-xs text-slate-400">/ 10 pts</span>
              </RingProgress>
            </CardContent>
          </Card>

          {/* Meds */}
          <Card className="rounded-3xl border border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-slate-700">
                <Pill className="h-4 w-4 text-slate-400" />
                Medications
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              {activeProfile.medications && activeProfile.medications.length > 0 ? (
                activeProfile.medications.slice(0, 4).map((med, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100 text-sm">
                    <div className="h-2 w-2 rounded-full bg-blue-400 flex-shrink-0" />
                    <p className="font-medium text-slate-700">{med}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-3">No medications recorded</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column — Clinical Media */}
        <div className="md:col-span-2">
          <Card className="rounded-3xl border border-white/30 bg-white/80 backdrop-blur-xl shadow-xl h-full">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                <FileText className="h-5 w-5 text-blue-500" />
                Clinical Media
              </CardTitle>
              <CardDescription className="text-slate-400">
                Upload pad placement photos or motor threshold videos.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-3xl border-2 border-dashed border-blue-300 bg-gradient-to-br from-blue-50 to-white p-10 flex flex-col items-center justify-center cursor-pointer hover:shadow-lg hover:border-blue-400 transition-all"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleMediaUpload}
                  className="hidden"
                />
                <div className="flex gap-4 mb-3 text-blue-400">
                  <ImageIcon className="h-8 w-8" />
                  <Video className="h-8 w-8" />
                </div>
                <p className="font-bold text-blue-700">Tap to upload</p>
                <p className="text-xs text-slate-400 mt-1">Photos or videos of pad placement</p>
              </div>

              {clinicalMedia.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-700">Evidence ({clinicalMedia.length})</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {clinicalMedia.map((file, index) => (
                      <div key={index} className="relative group rounded-2xl overflow-hidden border border-slate-100 aspect-square bg-slate-50 shadow-sm">
                        {file.type === 'image' ? (
                          <img src={file.url} alt="Evidence" className="w-full h-full object-cover" />
                        ) : (
                          <video src={file.url} className="w-full h-full object-cover" controls />
                        )}
                        <button
                          onClick={() => removeMedia(index)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
