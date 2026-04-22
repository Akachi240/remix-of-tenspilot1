import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useNavigate } from 'react-router-dom';
import { Zap, User, CheckCircle2, CheckCircle, Plus, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

// ─── Schema ───────────────────────────────────────────────
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
  aiRationale: string;
  zone: 'acupuncture' | 'conventional';
}

interface Profile {
  id: string;
  name: string;
  condition: string;
}

const SAFETY_CHECKS = [
  'I do not have a cardiac pacemaker or implantable defibrillator',
  'Electrodes will not be placed over the chest, neck, or head',
  'Skin at electrode sites is clean, unbroken and dry',
  'I am not in the first trimester of pregnancy',
  'The device power bank is connected and emergency switch is accessible',
];

const DURATION_PRESETS = ['5', '10', '15', '20', '25', '30'];

const skinOptions = [
  { value: 'normal', emoji: '🙂', label: 'Normal' },
  { value: 'sensitive', emoji: '⚠️', label: 'Sensitive' },
  { value: 'very-sensitive', emoji: '🔴', label: 'Very Sensitive' },
];

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const SessionSetupForm = () => {
  const [painValue, setPainValue] = useState(5);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [step, setStep] = useState(1);
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    try { return JSON.parse(localStorage.getItem('tens-companion-profiles') || '[]'); } catch { return []; }
  });
  const [activeProfileId, setActiveProfileId] = useState<string | null>(() =>
    localStorage.getItem('tens-active-profile-id')
  );
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [safetyChecks, setSafetyChecks] = useState<boolean[]>([false, false, false, false, false]);
  const [safetyPassed, setSafetyPassed] = useState(false);
  const [painTypeMode, setPainTypeMode] = useState<'acute' | 'chronic' | null>(null);

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

  // Watch values so tile selectors re-render when form state changes
  const watchedSkinSensitivity = form.watch('skinSensitivity');
  const watchedSessionDuration = form.watch('sessionDuration');

  const generateSettings = (data: FormData): TensSettings => {
    const placementMap: Record<string, string> = {
      'lower-back': 'Place two electrodes on either side of the spine at the lower back.',
      'neck': 'Place electrodes on the back of the neck, avoiding the throat.',
      'knee': 'Place electrodes above and below the kneecap.',
      'shoulder': 'Place electrodes around the painful area of the shoulder.',
      'wrist-hand': 'Place small electrodes on either side of the wrist.',
      'foot-ankle': 'Place electrodes on the top and bottom of the foot.',
      'hip': 'Place electrodes around the hip joint.',
      'elbow': 'Place electrodes above and below the elbow.',
    };

    let frequency, pulse, mode, rationale, zone: 'acupuncture' | 'conventional';

    if (painTypeMode === 'chronic' || data.painType === 'burning' || data.painType === 'tingling') {
      frequency = '2–10 Hz'; pulse = '200–250 μs'; mode = 'Modulated'; zone = 'acupuncture' as const;
      rationale = 'AI: Acupuncture-like TENS recommended for neuropathic relief (Endorphin release).';
    } else {
      frequency = '80–120 Hz'; pulse = '60–150 μs'; mode = 'Continuous'; zone = 'conventional' as const;
      rationale = 'AI: Conventional TENS recommended for acute relief (Gate Control Theory).';
    }

    let intensity = Math.round(data.painIntensity * 0.8);
    if (data.previousTensExperience === 'experienced') intensity = Math.min(intensity + 1, 10);
    if (data.skinSensitivity !== 'normal') intensity = Math.max(intensity - 1, 1);

    return {
      electrodePosition: placementMap[data.painLocation] || 'Place electrodes around the painful area.',
      intensitySetting: intensity,
      frequencySetting: frequency,
      pulseDuration: pulse,
      sessionDuration: data.sessionDuration,
      mode,
      aiRationale: rationale,
      zone,
    };
  };

  const onSubmit = (data: FormData) => {
    const tensSettings = generateSettings(data);
    const activeProfile = profiles.find(p => p.id === activeProfileId);
    const sessionConfig = {
      type: 'tens-session-config',
      timestamp: new Date().toISOString(),
      data: {
        ...data,
        settings: tensSettings,
        painTypeMode,
        patientProfile: activeProfile || null,
      },
    };
    localStorage.setItem('activeSessionConfig', JSON.stringify(sessionConfig));
    toast({ title: 'Session Ready!', description: 'Optimizing parameters...' });
    navigate('/active-session');
  };

  // Shows a toast listing exactly which fields failed validation
  const onInvalid = (errors: Record<string, unknown>) => {
    const missing = Object.values(errors)
      .map((e) => (e as { message?: string })?.message)
      .filter(Boolean);
    toast({
      title: '⚠️ Missing fields',
      description: missing.join(' · '),
      variant: 'destructive',
    });
  };

  const addProfile = () => {
    if (!newName.trim()) return;
    const profile: Profile = {
      id: generateId(),
      name: newName.trim(),
      condition: newCondition.trim(),
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

  // ─── Shared: Pain type mode selector ──────────────────
  const renderPainTypeModeSelector = () => (
    <div className="mb-6">
      <h3 className="text-sm font-bold mb-3 text-gray-700">What type of pain are you managing?</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
          onClick={() => setPainTypeMode('acute')}
          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${painTypeMode === 'acute' ? 'border-blue-500 bg-blue-50' : 'border-border'}`}
        >
          <p className="font-bold text-sm">🦴 Acute / Musculoskeletal</p>
          <p className="text-[10px] text-muted-foreground mt-1">Joint, back, or muscle tension</p>
        </div>
        <div
          onClick={() => setPainTypeMode('chronic')}
          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${painTypeMode === 'chronic' ? 'border-purple-500 bg-purple-50' : 'border-border'}`}
        >
          <p className="font-bold text-sm">⚡ Chronic / Neuropathic</p>
          <p className="text-[10px] text-muted-foreground mt-1">Burning, tingling, or nerve damage</p>
        </div>
      </div>
    </div>
  );

  // ─── Shared: Profile selector ──────────────────────────
  const renderProfileSelector = () => (
    <Card className="w-full shadow-sm">
      <CardHeader className="p-4">
        <CardTitle className="text-lg">👤 Patient Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-4">
        {profiles.map(p => (
          <div
            key={p.id}
            onClick={() => {
              setActiveProfileId(p.id);
              localStorage.setItem('tens-active-profile-id', p.id);
            }}
            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${activeProfileId === p.id ? 'border-blue-500 bg-blue-50' : 'border-border'}`}
          >
            <User className="h-5 w-5 text-gray-400" />
            <div className="flex-1">
              <p className="text-sm font-bold">{p.name}</p>
              <p className="text-xs text-gray-500">{p.condition}</p>
            </div>
            {activeProfileId === p.id && <CheckCircle2 className="h-5 w-5 text-blue-600" />}
          </div>
        ))}
        {!showAddProfile ? (
          <Button variant="outline" className="w-full py-6" onClick={() => setShowAddProfile(true)}>
            <Plus className="h-4 w-4 mr-2" /> New Patient
          </Button>
        ) : (
          <div className="space-y-3 p-2 bg-gray-50 rounded-xl border border-dashed">
            <input
              type="text"
              placeholder="Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
            />
            <input
              type="text"
              placeholder="Condition"
              value={newCondition}
              onChange={(e) => setNewCondition(e.target.value)}
              className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
            />
            <div className="flex gap-2">
              <Button onClick={addProfile} className="flex-1 bg-blue-600">Save</Button>
              <Button variant="ghost" onClick={() => setShowAddProfile(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // ─── Mobile View ───────────────────────────────────────
  if (isMobile) {
    return (
      <div className="w-full px-4 py-4 space-y-4 max-w-md mx-auto">
        {renderProfileSelector()}
        {activeProfileId && (
          <div className="mt-4">
            <div className="flex gap-1 mb-4">
              {[1, 2, 3].map(s => (
                <div key={s} className={`flex-1 h-1.5 rounded-full transition-all ${s <= step ? 'bg-blue-600' : 'bg-gray-200'}`} />
              ))}
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-6">

                {/* ── Step 1: Pain type + location ── */}
                {step === 1 && (
                  <div className="space-y-5">
                    {renderPainTypeModeSelector()}
                    <FormField control={form.control} name="painLocation" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">Location</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="py-6"><SelectValue placeholder="Select location" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {['lower-back', 'neck', 'knee', 'shoulder', 'wrist-hand', 'foot-ankle', 'hip', 'elbow'].map(loc => (
                              <SelectItem key={loc} value={loc}>{loc.replace('-', ' ').toUpperCase()}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                )}

                {/* ── Step 2: Pain detail + sensitivity + duration ── */}
                {step === 2 && (
                  <div className="space-y-6">
                    <FormField control={form.control} name="painType" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">Pain Character</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="py-6"><SelectValue placeholder="Select pain type" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="sharp">Sharp</SelectItem>
                            <SelectItem value="dull">Dull</SelectItem>
                            <SelectItem value="burning">Burning</SelectItem>
                            <SelectItem value="tingling">Tingling</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="previousTensExperience" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">TENS Experience</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="py-6"><SelectValue placeholder="Select experience" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="first-time">First Time</SelectItem>
                            <SelectItem value="experienced">Experienced</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="skinSensitivity" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">🧴 Skin Sensitivity</FormLabel>
                        <div className="grid grid-cols-3 gap-2">
                          {skinOptions.map(opt => (
                            <div
                              key={opt.value}
                              onClick={() => {
                                field.onChange(opt.value);
                                form.setValue('skinSensitivity', opt.value, { shouldValidate: true });
                              }}
                              className={`border-2 rounded-xl py-3 text-center cursor-pointer transition-all ${watchedSkinSensitivity === opt.value ? 'border-blue-500 bg-blue-50' : 'border-border'}`}
                            >
                              <div className="text-lg">{opt.emoji}</div>
                              <p className="text-[10px] font-bold mt-1">{opt.label}</p>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="sessionDuration" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">⏱️ Time (min)</FormLabel>
                        <div className="grid grid-cols-3 gap-2">
                          {DURATION_PRESETS.map(d => (
                            <div
                              key={d}
                              onClick={() => form.setValue('sessionDuration', d, { shouldValidate: true })}
                              className={`border-2 rounded-lg py-3 text-center text-sm font-bold cursor-pointer transition-all ${watchedSessionDuration === d ? 'border-blue-500 bg-blue-50' : 'border-border'}`}
                            >
                              {d}
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                )}

                {/* ── Step 3: Safety checks ── */}
                {step === 3 && (
                  <div className="space-y-3">
                    <h3 className="font-bold text-sm">🛡️ Safety Check</h3>
                    {SAFETY_CHECKS.map((check, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          const n = [...safetyChecks];
                          n[i] = !n[i];
                          setSafetyChecks(n);
                        }}
                        className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${safetyChecks[i] ? 'border-green-500 bg-green-50' : 'bg-white border-border'}`}
                      >
                        <div className={`mt-0.5 h-4 w-4 rounded flex items-center justify-center border flex-shrink-0 ${safetyChecks[i] ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                          {safetyChecks[i] && <CheckCircle className="h-3 w-3 text-white" />}
                        </div>
                        <span>{check}</span>
                      </div>
                    ))}
                    {confirmedCount < 5 && (
                      <p className="text-xs text-amber-600 font-medium pt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {5 - confirmedCount} item{5 - confirmedCount > 1 ? 's' : ''} remaining
                      </p>
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-2 pt-4">
                  {step < 3 ? (
                    <Button
                      type="button"
                      onClick={() => setStep(step + 1)}
                      className="w-full py-7 bg-blue-700 rounded-2xl text-base font-bold"
                    >
                      Next Step →
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={confirmedCount < 5}
                      className="w-full py-7 bg-blue-700 rounded-2xl text-base font-bold disabled:opacity-50"
                    >
                      Generate & Start
                    </Button>
                  )}
                  {step > 1 && (
                    <Button variant="ghost" type="button" onClick={() => setStep(step - 1)}>
                      ← Back
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </div>
        )}
      </div>
    );
  }

  // ─── Desktop View ──────────────────────────────────────
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-20 px-6">
      {renderProfileSelector()}

      {/* Safety gate */}
      {activeProfileId && !safetyPassed && (
        <Card className="border-amber-200 bg-amber-50 rounded-3xl p-6">
          <CardTitle className="text-xl mb-4">🛡️ Safety Verification</CardTitle>
          <div className="space-y-2">
            {SAFETY_CHECKS.map((check, i) => (
              <div
                key={i}
                onClick={() => {
                  const n = [...safetyChecks];
                  n[i] = !n[i];
                  setSafetyChecks(n);
                }}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${safetyChecks[i] ? 'border-green-500 bg-white' : 'bg-gray-50 border-transparent'}`}
              >
                <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${safetyChecks[i] ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                  {safetyChecks[i] && <CheckCircle className="h-4 w-4 text-white" />}
                </div>
                <span className="text-sm font-medium">{check}</span>
              </div>
            ))}
          </div>
          {confirmedCount < 5 && (
            <p className="text-sm text-amber-700 font-medium mt-4 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {5 - confirmedCount} item{5 - confirmedCount > 1 ? 's' : ''} remaining before you can proceed.
            </p>
          )}
          <Button
            onClick={() => confirmedCount === 5 && setSafetyPassed(true)}
            disabled={confirmedCount < 5}
            className="w-full mt-6 py-8 text-lg rounded-2xl bg-blue-600 disabled:opacity-50"
          >
            Proceed to Configuration →
          </Button>
        </Card>
      )}

      {/* Configuration form */}
      {activeProfileId && safetyPassed && (
        <Card className="rounded-3xl shadow-xl overflow-hidden border-none">
          <div className="bg-blue-600 p-6 text-white">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Zap className="h-6 w-6" /> TENS Configuration
            </CardTitle>
          </div>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-8">
                {renderPainTypeModeSelector()}

                <div className="grid grid-cols-2 gap-8 pt-6 border-t">
                  {/* Left column */}
                  <div className="space-y-6">
                    <FormField control={form.control} name="painLocation" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">Target Area</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="py-6"><SelectValue placeholder="Select location" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {['lower-back', 'neck', 'knee', 'shoulder', 'wrist-hand', 'foot-ankle', 'hip', 'elbow'].map(loc => (
                              <SelectItem key={loc} value={loc}>{loc.replace('-', ' ').toUpperCase()}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="painIntensity" render={() => (
                      <FormItem>
                        <FormLabel className="font-bold">Intensity Scale: {painValue}/10</FormLabel>
                        <FormControl>
                          <Slider
                            min={1} max={10} step={1}
                            value={[painValue]}
                            onValueChange={(v) => {
                              setPainValue(v[0]);
                              form.setValue('painIntensity', v[0], { shouldValidate: true });
                            }}
                            className="py-6"
                          />
                        </FormControl>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="painType" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">Pain Character</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="py-6"><SelectValue placeholder="Select pain type" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="sharp">Sharp</SelectItem>
                            <SelectItem value="dull">Dull</SelectItem>
                            <SelectItem value="burning">Burning</SelectItem>
                            <SelectItem value="tingling">Tingling</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  {/* Right column */}
                  <div className="space-y-6">
                    <FormField control={form.control} name="previousTensExperience" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">TENS Experience</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="py-6"><SelectValue placeholder="Select experience" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="first-time">First Time</SelectItem>
                            <SelectItem value="experienced">Experienced</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="skinSensitivity" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">🧴 Skin Sensitivity</FormLabel>
                        <div className="grid grid-cols-3 gap-3">
                          {skinOptions.map(opt => (
                            <div
                              key={opt.value}
                              onClick={() => {
                                field.onChange(opt.value);
                                form.setValue('skinSensitivity', opt.value, { shouldValidate: true });
                              }}
                              className={`border-2 rounded-2xl p-4 text-center cursor-pointer transition-all ${watchedSkinSensitivity === opt.value ? 'border-blue-500 bg-blue-50' : 'border-border'}`}
                            >
                              <div className="text-xl">{opt.emoji}</div>
                              <p className="text-[10px] font-bold mt-1">{opt.label}</p>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="sessionDuration" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">⏱️ Duration (min)</FormLabel>
                        <div className="grid grid-cols-3 gap-2">
                          {DURATION_PRESETS.map(d => (
                            <div
                              key={d}
                              onClick={() => form.setValue('sessionDuration', d, { shouldValidate: true })}
                              className={`border-2 rounded-xl py-3 text-center font-bold cursor-pointer transition-all ${watchedSessionDuration === d ? 'border-blue-500 bg-blue-50' : 'border-border'}`}
                            >
                              {d}
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                {/* ── Inline error summary ── shows exactly what's missing after a failed submit */}
                {Object.keys(form.formState.errors).length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 items-start">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-red-700 mb-1">Please complete these fields:</p>
                      <ul className="text-xs text-red-600 space-y-0.5 list-disc list-inside">
                        {Object.entries(form.formState.errors).map(([key, err]) => (
                          <li key={key}>{(err as { message?: string })?.message || key}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-blue-600 py-8 text-xl font-bold rounded-2xl shadow-lg"
                >
                  Generate AI Settings & Start →
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SessionSetupForm;
