import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, User, CheckCircle2, AlertTriangle, CheckCircle, Plus, ChevronLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

const formSchema = z.object({
  painLocation: z.string().min(1, 'Please select a pain location'),
  painIntensity: z.number().min(1).max(10),
  painType: z.string().min(1, 'Please select a pain type'),
  previousTensExperience: z.string().min(1, 'Please select your experience level'),
  skinSensitivity: z.string().min(1, 'Please select skin sensitivity'),
  sessionDuration: z.string().min(1, 'Please select session duration'),
});

type FormData = z.infer<typeof formSchema>;

interface TensSettings {
  electrodePosition: string;
  intensitySetting: number;
  frequencySetting: string;
  pulseDuration: string;
  sessionDuration: string;
  mode: string;
}

interface Profile {
  id: string;
  name: string;
  condition: string;
  medications: string[];
  sessionHistory: any[];
}

const SAFETY_CHECKS = [
  'I do not have a cardiac pacemaker or implantable defibrillator',
  'Electrodes will not be placed over the chest, neck/carotid, or head',
  'Skin at electrode sites is clean, unbroken and dry',
  'I am not in the first trimester of pregnancy',
  'The device power bank is connected and emergency switch is accessible',
];

const DURATION_PRESETS = ['5', '10', '15', '20', '25', '30'];

const SessionSetupForm = () => {
  const [painValue, setPainValue] = useState(5);
  const [settings, setSettings] = useState<TensSettings | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Mobile wizard step
  const [step, setStep] = useState(1);

  // Profile state
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    try { return JSON.parse(localStorage.getItem('tens-companion-profiles') || '[]'); } catch { return []; }
  });
  const [activeProfileId, setActiveProfileId] = useState<string | null>(() =>
    localStorage.getItem('tens-active-profile-id')
  );
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCondition, setNewCondition] = useState('');

  // Safety state
  const [safetyChecks, setSafetyChecks] = useState<boolean[]>([false, false, false, false, false]);
  const [safetyPassed, setSafetyPassed] = useState(false);

  // Pain type mode
  const [painTypeMode, setPainTypeMode] = useState<'acute' | 'chronic' | null>(null);

  // Custom duration
  const [customDuration, setCustomDuration] = useState('');

  const confirmedCount = safetyChecks.filter(Boolean).length;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      painLocation: '',
      painIntensity: 5,
      painType: '',
      previousTensExperience: '',
      skinSensitivity: '',
      sessionDuration: '20',
    },
  });

  const handlePainSliderChange = (value: number[]) => {
    setPainValue(value[0]);
    form.setValue('painIntensity', value[0]);
  };

  const generateSettings = (data: FormData): TensSettings => {
    const placementMap: Record<string, string> = {
      'lower-back': 'Place two electrodes on either side of the spine at the lower back, 2-3 inches apart.',
      'neck': 'Place electrodes on the back of the neck, on either side of the spine. Avoid the front of the throat.',
      'knee': 'Place electrodes above and below the kneecap, or on either side of the joint.',
      'shoulder': 'Place electrodes around the painful area of the shoulder, front and back.',
      'wrist-hand': 'Place small electrodes on either side of the wrist or along the forearm.',
      'foot-ankle': 'Place electrodes on the top and bottom of the foot, or around the ankle.',
      'hip': 'Place electrodes around the hip joint, one on the front and one on the side.',
      'elbow': 'Place electrodes above and below the elbow on the affected side.',
    };

    let frequency = '80-100 Hz';
    let pulse = '150 μs';
    let mode = 'Continuous';

    switch (data.painType) {
      case 'sharp': frequency = '80-120 Hz'; pulse = '60-100 μs'; mode = 'Continuous'; break;
      case 'dull': frequency = '2-10 Hz'; pulse = '200-250 μs'; mode = 'Burst'; break;
      case 'burning': frequency = '2-10 Hz'; pulse = '200 μs'; mode = 'Modulated'; break;
      case 'throbbing': frequency = '35-50 Hz'; pulse = '150-200 μs'; mode = 'Continuous'; break;
      case 'tingling': frequency = '80-100 Hz'; pulse = '60 μs'; mode = 'Continuous'; break;
    }

    let intensity = Math.round(data.painIntensity * 0.8);
    if (data.previousTensExperience === 'experienced') intensity = Math.min(intensity + 1, 10);
    if (data.skinSensitivity === 'sensitive') intensity = Math.max(intensity - 1, 1);
    if (data.skinSensitivity === 'very-sensitive') intensity = Math.max(intensity - 2, 1);

    return {
      electrodePosition: placementMap[data.painLocation] || 'Place electrodes around the painful area.',
      intensitySetting: intensity,
      frequencySetting: frequency,
      pulseDuration: pulse,
      sessionDuration: data.sessionDuration,
      mode,
    };
  };

  const getFrequencyZone = (freq: string) => {
    const match = freq.match(/(\d+)/);
    if (!match) return null;
    const val = parseInt(match[1]);
    if (val <= 10) return 'acupuncture';
    if (val < 20) return 'between';
    return 'conventional';
  };

  const onSubmit = (data: FormData) => {
    const tensSettings = generateSettings(data);
    setSettings(tensSettings);

    const sessionConfig = {
      type: 'tens-session-config',
      timestamp: new Date().toISOString(),
      data: { ...data, settings: tensSettings, painTypeMode },
    };

    localStorage.setItem('activeSessionConfig', JSON.stringify(sessionConfig));

    toast({
      title: 'Session Configured!',
      description: 'Your TENS settings are ready. Start your session or adjust parameters.',
    });
  };

  const addProfile = () => {
    if (!newName.trim()) return;
    const profile: Profile = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      condition: newCondition.trim(),
      medications: [],
      sessionHistory: [],
    };
    const updated = [...profiles, profile];
    setProfiles(updated);
    localStorage.setItem('tens-companion-profiles', JSON.stringify(updated));
    setActiveProfileId(profile.id);
    localStorage.setItem('tens-active-profile-id', profile.id);
    setNewName('');
    setNewCondition('');
    setShowAddProfile(false);
  };

  const selectProfile = (id: string) => {
    setActiveProfileId(id);
    localStorage.setItem('tens-active-profile-id', id);
  };

  const handleDurationPreset = (val: string) => {
    form.setValue('sessionDuration', val);
    setCustomDuration('');
  };

  const handleCustomDuration = () => {
    const v = parseInt(customDuration);
    if (v >= 1 && v <= 120) {
      form.setValue('sessionDuration', String(v));
    }
  };

  const skinOptions = [
    { value: 'normal', emoji: '🙂', label: 'Normal', desc: 'Standard intensity', subtext: '' },
    { value: 'sensitive', emoji: '⚠️', label: 'Sensitive', desc: '-1 intensity', subtext: '(floor: 1)' },
    { value: 'very-sensitive', emoji: '🔴', label: 'Very Sensitive', desc: '-2 intensity', subtext: '(floor: 1)' },
  ];

  const watchDuration = form.watch('sessionDuration');
  const watchSkin = form.watch('skinSensitivity');

  // ─── Mobile Progress Bar ───
  const MobileProgressBar = () => (
    <div className="mb-5">
      <div className="flex gap-2 mb-2">
        {[1, 2, 3].map(s => (
          <div
            key={s}
            className="flex-1 h-1.5 rounded-full transition-colors"
            style={{ background: s <= step ? 'var(--accent-hex)' : '#dce8f5' }}
          />
        ))}
      </div>
      <p className="text-xs text-center" style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-muted)' }}>
        Step {step} of 3
      </p>
    </div>
  );

  // ─── Shared: Profile Selector ───
  const ProfileSelector = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">👤 Select Patient Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {profiles.length === 0 && !showAddProfile && (
          <p className="text-sm text-muted-foreground">No profiles yet — create one below</p>
        )}
        {profiles.map(p => (
          <div
            key={p.id}
            onClick={() => selectProfile(p.id)}
            className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl border cursor-pointer transition-colors ${
              activeProfileId === p.id
                ? 'checkbox-selected'
                : 'border-border hover:border-accent'
            }`}
          >
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.condition}</p>
            </div>
            {activeProfileId === p.id && <CheckCircle2 className="h-5 w-5 ml-auto" style={{ color: 'var(--accent-hex)' }} />}
          </div>
        ))}
        <hr className="my-3" />
        {!showAddProfile ? (
          <Button variant="outline" className="w-full text-sm" onClick={() => setShowAddProfile(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add New Profile
          </Button>
        ) : (
          <div className="space-y-2">
            <input
              placeholder="Patient name"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
            <input
              placeholder="Primary condition"
              value={newCondition}
              onChange={e => setNewCondition(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
            <Button onClick={addProfile} className="btn-primary text-sm">
              Add Profile
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // ─── Shared: Pain Type Mode Selector ───
  const PainTypeModeSelector = () => (
    <div className="mb-6">
      <h3 className="text-sm font-medium mb-3">What type of pain are you managing? 🩺</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          onClick={() => setPainTypeMode('acute')}
          className={`p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all ${
            painTypeMode === 'acute' ? 'checkbox-selected' : 'border-border hover:border-accent'
          }`}
        >
          <p className="font-medium">🦴 Acute / Musculoskeletal Pain</p>
          <p className="text-sm text-muted-foreground mt-1">Joint pain, back pain, post-exercise soreness, muscle tension</p>
        </div>
        <div
          onClick={() => setPainTypeMode('chronic')}
          className={`p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all ${
            painTypeMode === 'chronic' ? 'border-purple-400 bg-purple-50' : 'border-border hover:border-purple-300'
          }`}
        >
          <p className="font-medium">⚡ Chronic / Neuropathic Pain</p>
          <p className="text-sm text-muted-foreground mt-1">Burning, tingling, numbness, diabetic neuropathy, nerve damage</p>
        </div>
      </div>
      {painTypeMode === 'acute' && (
        <div className="border-l-4 rounded-r-xl p-3 mt-2" style={{ borderColor: 'var(--accent-hex)', background: 'rgba(74,143,196,0.06)' }}>
          <p className="text-xs sm:text-sm">✅ Conventional TENS (20–120 Hz) recommended</p>
          <p className="text-xs sm:text-sm">Gate Control mechanism — fast onset 10–20 min</p>
          <p className="text-xs text-muted-foreground italic">(Sluka & Walsh, 2003)</p>
        </div>
      )}
      {painTypeMode === 'chronic' && (
        <div className="border-l-4 border-purple-400 bg-purple-50 rounded-r-xl p-3 mt-2">
          <p className="text-xs sm:text-sm">✅ Acupuncture-like TENS (1–10 Hz) recommended</p>
          <p className="text-xs sm:text-sm">Endorphin release mechanism — sustained relief 90–240 min</p>
          <p className="text-xs text-muted-foreground italic">(Han, 2004)</p>
        </div>
      )}
    </div>
  );

  // ─── Step 1: Pain Area + Type ───
  const Step1Content = () => (
    <div className="space-y-5">
      <PainTypeModeSelector />

      <FormField control={form.control} name="painLocation" render={({ field }) => (
        <FormItem>
          <FormLabel>Pain Location</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl><SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger></FormControl>
            <SelectContent>
              <SelectItem value="lower-back">Lower Back</SelectItem>
              <SelectItem value="neck">Neck</SelectItem>
              <SelectItem value="knee">Knee</SelectItem>
              <SelectItem value="shoulder">Shoulder</SelectItem>
              <SelectItem value="wrist-hand">Wrist / Hand</SelectItem>
              <SelectItem value="foot-ankle">Foot / Ankle</SelectItem>
              <SelectItem value="hip">Hip</SelectItem>
              <SelectItem value="elbow">Elbow</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )} />

      <FormField control={form.control} name="painIntensity" render={() => (
        <FormItem>
          <FormLabel>Pain Intensity: {painValue}/10</FormLabel>
          <FormControl>
            <Slider min={1} max={10} step={1} value={[painValue]} onValueChange={handlePainSliderChange} className="py-4" />
          </FormControl>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Mild</span><span>Moderate</span><span>Severe</span>
          </div>
          <FormMessage />
        </FormItem>
      )} />

      <FormField control={form.control} name="painType" render={({ field }) => (
        <FormItem>
          <FormLabel>Pain Type</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl><SelectTrigger><SelectValue placeholder="Select pain type" /></SelectTrigger></FormControl>
            <SelectContent>
              <SelectItem value="sharp">Sharp / Stabbing</SelectItem>
              <SelectItem value="dull">Dull / Aching</SelectItem>
              <SelectItem value="burning">Burning</SelectItem>
              <SelectItem value="throbbing">Throbbing</SelectItem>
              <SelectItem value="tingling">Tingling / Numbness</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )} />
    </div>
  );

  // ─── Step 2: Parameters ───
  const Step2Content = () => (
    <div className="space-y-5">
      <FormField control={form.control} name="previousTensExperience" render={({ field }) => (
        <FormItem>
          <FormLabel>TENS Experience</FormLabel>
          <FormControl>
            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="exp-none" />
                <Label htmlFor="exp-none">First time user</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="some" id="exp-some" />
                <Label htmlFor="exp-some">Some experience</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="experienced" id="exp-exp" />
                <Label htmlFor="exp-exp">Experienced user</Label>
              </div>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <FormField control={form.control} name="skinSensitivity" render={({ field }) => (
        <FormItem>
          <FormLabel>🧴 Skin Sensitivity</FormLabel>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {skinOptions.map(opt => (
              <div
                key={opt.value}
                onClick={() => field.onChange(opt.value)}
                className={`border rounded-xl p-2 sm:p-3 text-center cursor-pointer transition-all text-sm ${
                  field.value === opt.value
                    ? 'checkbox-selected font-semibold'
                    : 'border-border hover:border-accent'
                }`}
              >
                <div className="text-lg">{opt.emoji}</div>
                <p className="text-xs sm:text-sm font-medium">{opt.label}</p>
                <p className="text-xs text-muted-foreground hidden sm:block">{opt.desc}</p>
                {opt.subtext && <p className="text-xs text-muted-foreground hidden sm:block">{opt.subtext}</p>}
              </div>
            ))}
          </div>
          <FormMessage />
        </FormItem>
      )} />

      <FormField control={form.control} name="sessionDuration" render={({ field }) => (
        <FormItem>
          <FormLabel>⏱️ Session Duration</FormLabel>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {DURATION_PRESETS.map(d => (
              <div
                key={d}
                onClick={() => handleDurationPreset(d)}
                className={`border rounded-xl py-2 sm:py-3 text-center text-sm font-medium cursor-pointer transition-all ${
                  field.value === d
                    ? 'checkbox-selected font-semibold'
                    : 'border-border hover:border-accent'
                }`}
              >
                {d} min
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-muted-foreground">Custom:</span>
            <input
              type="number"
              min={1}
              max={120}
              value={customDuration}
              onChange={e => setCustomDuration(e.target.value)}
              className="border rounded-lg px-3 py-1 w-20 text-sm"
            />
            <Button type="button" onClick={handleCustomDuration} className="btn-primary rounded-lg px-3 py-1 text-sm h-auto">Set</Button>
          </div>
          <FormMessage />
        </FormItem>
      )} />
    </div>
  );

  // ─── Step 3: Safety ───
  const Step3Content = () => (
    <div className="space-y-3">
      <h3 className="text-sm font-medium" style={{ color: 'var(--ink)' }}>🛡️ Pre-Session Safety Check</h3>
      <p className="text-xs text-muted-foreground">Confirm ALL conditions before proceeding</p>
      {SAFETY_CHECKS.map((check, i) => (
        <div
          key={i}
          onClick={() => {
            const next = [...safetyChecks];
            next[i] = !next[i];
            setSafetyChecks(next);
          }}
          className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition-colors ${
            safetyChecks[i]
              ? 'border-green-400 bg-green-50'
              : 'border-border bg-white hover:border-amber-300'
          }`}
        >
          <div className={`mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
            safetyChecks[i] ? 'border-green-500 bg-green-500' : 'border-gray-300'
          }`}>
            {safetyChecks[i] && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            )}
          </div>
          <span className="text-sm">{check}</span>
        </div>
      ))}
      <p className="text-xs text-muted-foreground mt-2">{confirmedCount} of 5 confirmed</p>
      {confirmedCount < 5 && (
        <div className="flex items-center gap-2 text-amber-700 text-sm">
          <AlertTriangle className="h-4 w-4" />
          All checks must be confirmed to proceed
        </div>
      )}
      {confirmedCount === 5 && (
        <div className="flex items-center gap-2 text-green-700 text-sm">
          <CheckCircle className="h-4 w-4" />
          ✅ Safety confirmed — you may proceed
        </div>
      )}
    </div>
  );

  // ─── Settings Result ───
  const SettingsResult = () => settings ? (
    <>
      <Alert className="mt-6" style={{ borderColor: 'rgba(74,143,196,0.3)', background: 'rgba(74,143,196,0.06)' }}>
        <Zap className="h-4 w-4" style={{ color: 'var(--accent-hex)' }} />
        <AlertTitle style={{ color: 'var(--ink)' }}>Your TENS Settings</AlertTitle>
        <AlertDescription>
          <div className="mt-2 space-y-2 text-sm">
            <p className="text-xs sm:text-sm"><strong>Electrode Placement:</strong> {settings.electrodePosition}</p>
            <div className="grid grid-cols-2 gap-2">
              <p><strong>Intensity:</strong> {settings.intensitySetting}/10</p>
              <div>
                <p><strong>Frequency:</strong> {settings.frequencySetting}</p>
                <div className="w-full h-2 rounded-full flex overflow-hidden mt-1">
                  <div className="bg-blue-400" style={{ width: '7.6%' }} title="Acupuncture-like (1–10 Hz)" />
                  <div className="bg-gray-300" style={{ width: '7.6%' }} title="Between zones (11–19 Hz)" />
                  <div className="bg-green-400" style={{ width: '84.8%' }} title="Conventional (20–120 Hz)" />
                </div>
                {(() => {
                  const zone = getFrequencyZone(settings.frequencySetting);
                  if (zone === 'acupuncture') return <span className="text-blue-600 text-xs">⚡ Acupuncture-like range (1–10 Hz)</span>;
                  if (zone === 'between') return <span className="text-gray-500 text-xs">— Between zones</span>;
                  return <span className="text-green-600 text-xs">✅ Conventional range (20–120 Hz)</span>;
                })()}
              </div>
              <p><strong>Pulse Duration:</strong> {settings.pulseDuration}</p>
              <p><strong>Mode:</strong> {settings.mode}</p>
              <p><strong>Session:</strong> {settings.sessionDuration} minutes</p>
            </div>
          </div>
        </AlertDescription>
      </Alert>
      <div className="flex gap-3 mt-4">
        <Button asChild className="flex-1 btn-primary">
          <Link to="/active-session" className="flex items-center gap-2">
            Start Session <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" className="flex-1 btn-outline-ice">
          <Link to="/dashboard">View Dashboard</Link>
        </Button>
      </div>
    </>
  ) : null;

  // ═══════════════════════════════════════
  // MOBILE LAYOUT (max-width:640px via hook)
  // ═══════════════════════════════════════
  if (isMobile) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <ProfileSelector />

        {activeProfileId && (
          <div className="mt-4">
            <MobileProgressBar />

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <Card className="medical-card">
                  <CardContent className="p-4">
                    {step === 1 && <Step1Content />}
                    {step === 2 && <Step2Content />}
                    {step === 3 && <Step3Content />}
                  </CardContent>
                </Card>

                {/* Bottom navigation */}
                <div className="mt-4 space-y-2">
                  {step === 1 && (
                    <Button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full py-3 rounded-xl text-white font-semibold"
                      style={{ background: 'var(--accent-dark)' }}
                    >
                      Next
                    </Button>
                  )}
                  {step === 2 && (
                    <>
                      <Button
                        type="button"
                        onClick={() => setStep(3)}
                        className="w-full py-3 rounded-xl text-white font-semibold"
                        style={{ background: 'var(--accent-dark)' }}
                      >
                        Next
                      </Button>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="w-full text-center text-sm py-2"
                        style={{ color: 'var(--ink-muted)' }}
                      >
                        ← Back
                      </button>
                    </>
                  )}
                  {step === 3 && (
                    <>
                      <Button
                        type="submit"
                        disabled={confirmedCount < 5}
                        className="w-full py-3 rounded-xl text-white font-semibold disabled:opacity-40"
                        style={{ background: confirmedCount === 5 ? 'var(--accent-dark)' : undefined }}
                      >
                        Start Session
                      </Button>
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="w-full text-center text-sm py-2"
                        style={{ color: 'var(--ink-muted)' }}
                      >
                        ← Back
                      </button>
                    </>
                  )}
                </div>
              </form>
            </Form>

            <SettingsResult />
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════
  // DESKTOP LAYOUT (unchanged)
  // ═══════════════════════════════════════
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <ProfileSelector />

      {/* Safety Checklist */}
      {activeProfileId && !safetyPassed && (
        <Card className="border border-amber-200 bg-amber-50 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg">🛡️ Pre-Session Safety Check</CardTitle>
            <CardDescription>Confirm ALL conditions before proceeding</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {SAFETY_CHECKS.map((check, i) => (
              <div
                key={i}
                onClick={() => {
                  const next = [...safetyChecks];
                  next[i] = !next[i];
                  setSafetyChecks(next);
                }}
                className={`flex items-start gap-3 p-2.5 sm:p-3 rounded-xl border cursor-pointer transition-colors ${
                  safetyChecks[i]
                    ? 'border-green-400 bg-green-50'
                    : 'border-border bg-white hover:border-amber-300'
                }`}
              >
                <div className={`mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                  safetyChecks[i] ? 'border-green-500 bg-green-500' : 'border-gray-300'
                }`}>
                  {safetyChecks[i] && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  )}
                </div>
                <span className="text-sm">{check}</span>
              </div>
            ))}
            <p className="text-xs text-muted-foreground mt-3">{confirmedCount} of 5 confirmed</p>
            {confirmedCount < 5 ? (
              <div className="flex items-center gap-2 text-amber-700 text-sm mt-2">
                <AlertTriangle className="h-4 w-4" />
                All checks must be confirmed to proceed
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-700 text-sm mt-2">
                <CheckCircle className="h-4 w-4" />
                ✅ Safety confirmed — you may proceed
              </div>
            )}
            <Button
              onClick={() => confirmedCount === 5 && setSafetyPassed(true)}
              disabled={confirmedCount < 5}
              className={confirmedCount < 5
                ? 'w-full bg-gray-200 text-gray-400 cursor-not-allowed mt-3'
                : 'w-full bg-green-600 hover:bg-green-700 text-white cursor-pointer mt-3'
              }
            >
              Continue to Session Setup →
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Main Form */}
      {activeProfileId && safetyPassed && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" style={{ color: 'var(--accent-hex)' }} />
              TENS Session Setup Wizard
            </CardTitle>
            <CardDescription>
              Configure your pain profile and device parameters step by step.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PainTypeModeSelector />

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField control={form.control} name="painLocation" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pain Location</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="lower-back">Lower Back</SelectItem>
                        <SelectItem value="neck">Neck</SelectItem>
                        <SelectItem value="knee">Knee</SelectItem>
                        <SelectItem value="shoulder">Shoulder</SelectItem>
                        <SelectItem value="wrist-hand">Wrist / Hand</SelectItem>
                        <SelectItem value="foot-ankle">Foot / Ankle</SelectItem>
                        <SelectItem value="hip">Hip</SelectItem>
                        <SelectItem value="elbow">Elbow</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="painIntensity" render={() => (
                  <FormItem>
                    <FormLabel>Pain Intensity: {painValue}/10</FormLabel>
                    <FormControl>
                      <Slider min={1} max={10} step={1} value={[painValue]} onValueChange={handlePainSliderChange} className="py-4" />
                    </FormControl>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Mild</span><span>Moderate</span><span>Severe</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="painType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pain Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select pain type" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="sharp">Sharp / Stabbing</SelectItem>
                        <SelectItem value="dull">Dull / Aching</SelectItem>
                        <SelectItem value="burning">Burning</SelectItem>
                        <SelectItem value="throbbing">Throbbing</SelectItem>
                        <SelectItem value="tingling">Tingling / Numbness</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="previousTensExperience" render={({ field }) => (
                  <FormItem>
                    <FormLabel>TENS Experience</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="none" id="exp-none" />
                          <Label htmlFor="exp-none">First time user</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="some" id="exp-some" />
                          <Label htmlFor="exp-some">Some experience</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="experienced" id="exp-exp" />
                          <Label htmlFor="exp-exp">Experienced user</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="skinSensitivity" render={({ field }) => (
                  <FormItem>
                    <FormLabel>🧴 Skin Sensitivity</FormLabel>
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      {skinOptions.map(opt => (
                        <div
                          key={opt.value}
                          onClick={() => field.onChange(opt.value)}
                          className={`border rounded-xl p-2 sm:p-3 text-center cursor-pointer transition-all text-sm ${
                            field.value === opt.value
                              ? 'checkbox-selected font-semibold'
                              : 'border-border hover:border-accent'
                          }`}
                        >
                          <div className="text-lg">{opt.emoji}</div>
                          <p className="text-xs sm:text-sm font-medium">{opt.label}</p>
                          <p className="text-xs text-muted-foreground hidden sm:block">{opt.desc}</p>
                          {opt.subtext && <p className="text-xs text-muted-foreground hidden sm:block">{opt.subtext}</p>}
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="sessionDuration" render={({ field }) => (
                  <FormItem>
                    <FormLabel>⏱️ Session Duration</FormLabel>
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      {DURATION_PRESETS.map(d => (
                        <div
                          key={d}
                          onClick={() => handleDurationPreset(d)}
                          className={`border rounded-xl py-2 sm:py-3 text-center text-sm font-medium cursor-pointer transition-all ${
                            field.value === d
                              ? 'checkbox-selected font-semibold'
                              : 'border-border hover:border-accent'
                          }`}
                        >
                          {d} min
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm text-muted-foreground">Custom:</span>
                      <input
                        type="number"
                        min={1}
                        max={120}
                        value={customDuration}
                        onChange={e => setCustomDuration(e.target.value)}
                        className="border rounded-lg px-3 py-1 w-20 text-sm"
                      />
                      <Button type="button" onClick={handleCustomDuration} className="btn-primary rounded-lg px-3 py-1 text-sm h-auto">Set</Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />

                <Button type="submit" className="w-full btn-primary">
                  Generate TENS Settings
                </Button>
              </form>
            </Form>

            <SettingsResult />
          </CardContent>
          {settings && (
            <CardFooter className="flex gap-3">
              <Button asChild className="flex-1 btn-primary">
                <Link to="/active-session" className="flex items-center gap-2">
                  Start Session <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1 btn-outline-ice">
                <Link to="/dashboard">View Dashboard</Link>
              </Button>
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  );
};

export default SessionSetupForm;
