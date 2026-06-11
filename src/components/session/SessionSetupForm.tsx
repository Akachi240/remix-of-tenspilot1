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
import { TensModeType, getModeConfig, adjustParametersForUser } from '@/lib/modes';
import { ModeSelector } from './ModeSelector';
import { ElectrodePlacementGuide } from './ElectrodePlacementGuide';
import { StepTransition } from '@/components/animations/Animations';
import { useProfiles } from '@/context/ProfileContext';
import { Mic } from 'lucide-react';

// ─── Schema ───────────────────────────────────────────────
// Updated to include modeId as required
const formSchema = z.object({
  modeId: z.enum(['general', 'neuropathy', 'musculoskeletal', 'period']),
  painLocation: z.string().min(1, 'Please select a target area'),
  painIntensity: z.number().min(1).max(10),
  painType: z.string().optional(),
  previousTensExperience: z.enum(['first-time', 'occasional', 'experienced']).optional(),
  skinSensitivity: z.enum(['normal', 'sensitive', 'very-sensitive']).optional(),
  sessionDuration: z.string().min(1, 'Please select a session duration'),
  voiceGuided: z.boolean().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface TensSettings {
  electrodePosition: string;
  intensitySetting: number;
  frequencySetting: string;
  pulseDuration: string;
  sessionDuration: string;
  waveform: string;
  mode: string;
  aiRationale: string;
  modeId: TensModeType;
  modeName: string;
  mechanism: string;
  voiceGuided?: boolean;
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

const SessionSetupForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const {
    profiles,
    activeProfileId,
    activeProfile,
    addProfile: addPatientProfile,
    setActiveProfileId,
  } = useProfiles();

  // ─── Initialize form FIRST (before any conditional returns) ──
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      modeId: 'general',
      painLocation: '',
      painIntensity: 5,
      painType: '',
      previousTensExperience: undefined,
      skinSensitivity: undefined,
      sessionDuration: '20',
      voiceGuided: false,
    },
  });

  const [selectedMode, setSelectedMode] = useState<TensModeType | null>(null);
  const [step, setStep] = useState(0); // Step 0: Mode selection, Step 1-3: Form
  const [stepDirection, setStepDirection] = useState<'forward' | 'backward'>('forward');
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [safetyChecks, setSafetyChecks] = useState<boolean[]>([false, false, false, false, false]);
  const [painValue, setPainValue] = useState(5);
  const [safetyPassed, setSafetyPassed] = useState(false);

  const confirmCount = safetyChecks.filter(Boolean).length;
  const confirmedCount = confirmCount;

  // ─── Mode Selection Handler ────────────────────────────
  const handleModeSelect = (mode: TensModeType) => {
    setSelectedMode(mode);
    form.setValue('modeId', mode);
  };

  const handleModeComplete = () => {
    if (selectedMode) {
      setStepDirection('forward');
      setStep(1);
    }
  };

  const goToStep = (nextStep: number) => {
    setStepDirection(nextStep > step ? 'forward' : 'backward');
    setStep(nextStep);
  };

  // ─── Step 0: Mode Selection ─────────────────────────────
  if (step === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto py-8 px-4">
        <StepTransition direction={stepDirection}>
          <ModeSelector
            selectedMode={selectedMode}
            onModeSelect={handleModeSelect}
            onContinue={handleModeComplete}
          />
        </StepTransition>
      </div>
    );
  }

  const watchedSkinSensitivity = form.watch('skinSensitivity');
  const watchedSessionDuration = form.watch('sessionDuration');
  const watchedModeId = form.watch('modeId') as TensModeType;
  const watchedPainLocation = form.watch('painLocation');

  // Get mode config and locations for selected mode
  const modeConfig = getModeConfig(watchedModeId);
  const modeLocations = Object.keys(modeConfig.electrodePlacements);

  /**
   * Generate TENS settings based on mode configuration and user profile
   * Uses mode presets from modes.ts and adjusts based on experience/skin sensitivity
   */
  const generateSettings = (data: FormData): TensSettings => {
    const modeConfig = getModeConfig(data.modeId);
    
    // Get electrode placement for selected mode and location
    const placementData = modeConfig.electrodePlacements[data.painLocation];
    const placement = placementData?.description || 'Place electrodes around the painful area.';

    // Adjust parameters based on user profile
    const adjustedMode = adjustParametersForUser(modeConfig, {
      previousTensExperience: data.previousTensExperience as 'first-time' | 'occasional' | 'experienced' | undefined,
      skinSensitivity: data.skinSensitivity as 'normal' | 'sensitive' | 'very-sensitive' | undefined,
    });

    const params = adjustedMode.parameters;

    return {
      electrodePosition: placement,
      intensitySetting: adjustedMode.startingIntensity,
      frequencySetting: `${params.frequency.min}–${params.frequency.max} Hz`,
      pulseDuration: `${params.pulseWidth.min}–${params.pulseWidth.max} ${params.pulseWidth.unit}`,
      sessionDuration: data.sessionDuration,
      waveform: params.waveform,
      mode: params.frequency_modulation?.enabled ? 'Modulated' : 'Continuous',
      aiRationale: `${modeConfig.name}: ${params.mechanism} therapy. ${params.frequency_modulation?.rationale || 'Optimized for this condition.'}`,
      modeId: data.modeId,
      modeName: modeConfig.name,
      mechanism: params.mechanism,
      voiceGuided: data.voiceGuided,
    };
  };

  const onSubmit = (data: FormData) => {
    const tensSettings = generateSettings(data);
    const sessionConfig = {
      type: 'tens-session-config',
      timestamp: new Date().toISOString(),
      data: {
        ...data,
        settings: tensSettings,
        patientProfile: activeProfile || null,
      },
    };
    localStorage.setItem('activeSessionConfig', JSON.stringify(sessionConfig));
    toast({ title: 'Session Ready!', description: 'Optimizing parameters...' });
    navigate('/active-session');
  };

  const onInvalid = (errors: Record<string, unknown>) => {
    const missing = Object.values(errors)
      .map((e) => (e as { message?: string })?.message)
      .filter(Boolean);
    toast({ title: '⚠️ Missing fields', description: missing.join(' · '), variant: 'destructive' });
  };

  const handleAddProfile = async () => {
    if (!newName.trim()) return;
    try {
      await addPatientProfile(newName.trim(), newCondition.trim());
      toast({ title: 'Profile Created', description: 'Patient profile has been registered.' });
      setNewName(''); 
      setNewCondition(''); 
      setShowAddProfile(false);
    } catch (err) {
      console.error(err);
      toast({ title: 'Failed to create profile', variant: 'destructive' });
    }
  };

  // ─── Optional field label helper ──────────────────────
  const OptionalBadge = () => (
    <span style={{
      fontSize: '0.65rem',
      fontWeight: 600,
      color: '#94a3b8',
      background: '#f1f5f9',
      borderRadius: 999,
      padding: '1px 7px',
      marginLeft: 6,
      verticalAlign: 'middle',
      letterSpacing: 0.3,
    }}>
      optional
    </span>
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
            onClick={() => { setActiveProfileId(p.id); localStorage.setItem('tens-active-profile-id', p.id); }}
            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${activeProfileId === p.id ? 'border-blue-500 bg-blue-50' : 'border-border'}`}
          >
            <User className="h-5 w-5 text-gray-400" />
            <div className="flex-1">
              <p className="text-sm font-bold">{p.name}</p>
              <p className="text-xs text-gray-500">{p.primaryCondition}</p>
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
            <input type="text" placeholder="Name" value={newName} onChange={(e) => setNewName(e.target.value)}
              className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-400 outline-none" />
            <input type="text" placeholder="Condition" value={newCondition} onChange={(e) => setNewCondition(e.target.value)}
              className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-400 outline-none" />
            <div className="flex gap-2">
              <Button onClick={handleAddProfile} className="flex-1 bg-blue-600">Save</Button>
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
                <StepTransition key={`mobile-step-${step}`} direction={stepDirection}>

                {step === 1 && (
                  <div className="space-y-5">
                    <FormField control={form.control} name="painLocation" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">Location</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="py-6"><SelectValue placeholder="Select location" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {modeLocations.map(loc => (
                              <SelectItem key={loc} value={loc}>{loc.replace('-', ' ').toUpperCase()}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    
                    {watchedPainLocation && (
                      <div className="pt-4 border-t">
                        <ElectrodePlacementGuide mode={watchedModeId} location={watchedPainLocation} compact={true} />
                      </div>
                    )}
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    {/* Pain Character — optional */}
                    <FormField control={form.control} name="painType" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">
                          Pain Character <OptionalBadge />
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="py-6"><SelectValue placeholder="Skip or select pain type" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="sharp">Sharp</SelectItem>
                            <SelectItem value="dull">Dull</SelectItem>
                            <SelectItem value="burning">Burning</SelectItem>
                            <SelectItem value="tingling">Tingling</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />

                    {/* TENS Experience — optional */}
                    <FormField control={form.control} name="previousTensExperience" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">
                          TENS Experience <OptionalBadge />
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="py-6"><SelectValue placeholder="Skip or select experience" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="first-time">First Time</SelectItem>
                            <SelectItem value="experienced">Experienced</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />

                    {/* Skin Sensitivity — optional */}
                    <FormField control={form.control} name="skinSensitivity" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">
                          🧴 Skin Sensitivity <OptionalBadge />
                        </FormLabel>
                        <div className="grid grid-cols-3 gap-2">
                          {skinOptions.map(opt => (
                            <div
                              key={opt.value}
                              onClick={() => { field.onChange(opt.value); form.setValue('skinSensitivity', opt.value as 'normal' | 'sensitive' | 'very-sensitive', { shouldValidate: true }); }}
                              className={`border-2 rounded-xl py-3 text-center cursor-pointer transition-all ${watchedSkinSensitivity === opt.value ? 'border-blue-500 bg-blue-50' : 'border-border'}`}
                            >
                              <div className="text-lg">{opt.emoji}</div>
                              <p className="text-[10px] font-bold mt-1">{opt.label}</p>
                            </div>
                          ))}
                        </div>
                      </FormItem>
                    )} />

                    {/* Duration — required */}
                    <FormField control={form.control} name="sessionDuration" render={() => (
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

                {step === 3 && (
                  <div className="space-y-3">
                    <h3 className="font-bold text-sm">🛡️ Safety Check</h3>
                    {SAFETY_CHECKS.map((check, i) => (
                      <div
                        key={i}
                        onClick={() => { const n = [...safetyChecks]; n[i] = !n[i]; setSafetyChecks(n); }}
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
                </StepTransition>

                <div className="flex flex-col gap-2 pt-4">
                  {step < 3 ? (
                    <Button type="button" onClick={() => goToStep(step + 1)} className="w-full py-7 bg-blue-700 rounded-2xl text-base font-bold">
                      Next Step →
                    </Button>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <Button type="submit" disabled={confirmedCount < 5} className="w-full py-7 bg-blue-700 rounded-2xl text-base font-bold disabled:opacity-50">
                        Generate & Start
                      </Button>
                      <Button 
                        type="button" 
                        disabled={confirmedCount < 5} 
                        onClick={() => {
                          form.setValue('voiceGuided', true);
                          form.handleSubmit(onSubmit, onInvalid)();
                        }}
                        className="w-full py-6 bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-200 rounded-2xl text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <Mic className="w-4 h-4" />
                        Start Voice-Guided Session
                      </Button>
                    </div>
                  )}
                  {step > 1 && (
                    <Button variant="ghost" type="button" onClick={() => goToStep(step - 1)}>← Back</Button>
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

      {activeProfileId && !safetyPassed && (
        <Card className="border-amber-200 bg-amber-50 rounded-3xl p-6">
          <CardTitle className="text-xl mb-4">🛡️ Safety Verification</CardTitle>
          <div className="space-y-2">
            {SAFETY_CHECKS.map((check, i) => (
              <div
                key={i}
                onClick={() => { const n = [...safetyChecks]; n[i] = !n[i]; setSafetyChecks(n); }}
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
                <div className="grid grid-cols-2 gap-8 pt-6 border-t">
                  {/* Left column */}
                  <div className="space-y-6">
                    {/* Target Area — required */}
                    <FormField control={form.control} name="painLocation" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">Target Area</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="py-6"><SelectValue placeholder="Select location" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {modeLocations.map(loc => (
                              <SelectItem key={loc} value={loc}>{loc.replace('-', ' ').toUpperCase()}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {/* Placement Guide for selected location */}
                    {watchedPainLocation && (
                      <ElectrodePlacementGuide mode={watchedModeId} location={watchedPainLocation} compact={true} />
                    )}

                    {/* Intensity — always shown */}
                    <FormField control={form.control} name="painIntensity" render={() => (
                      <FormItem>
                        <FormLabel className="font-bold">Intensity Scale: {painValue}/10</FormLabel>
                        <FormControl>
                          <Slider
                            min={1} max={10} step={1}
                            value={[painValue]}
                            onValueChange={(v) => { setPainValue(v[0]); form.setValue('painIntensity', v[0], { shouldValidate: true }); }}
                            className="py-6"
                          />
                        </FormControl>
                      </FormItem>
                    )} />

                    {/* Pain Character — optional */}
                    <FormField control={form.control} name="painType" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">
                          Pain Character <OptionalBadge />
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="py-6"><SelectValue placeholder="Skip or select pain type" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="sharp">Sharp</SelectItem>
                            <SelectItem value="dull">Dull</SelectItem>
                            <SelectItem value="burning">Burning</SelectItem>
                            <SelectItem value="tingling">Tingling</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                  </div>

                  {/* Right column */}
                  <div className="space-y-6">
                    {/* TENS Experience — optional */}
                    <FormField control={form.control} name="previousTensExperience" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">
                          TENS Experience <OptionalBadge />
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="py-6"><SelectValue placeholder="Skip or select experience" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="first-time">First Time</SelectItem>
                            <SelectItem value="experienced">Experienced</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />

                    {/* Skin Sensitivity — optional */}
                    <FormField control={form.control} name="skinSensitivity" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">
                          🧴 Skin Sensitivity <OptionalBadge />
                        </FormLabel>
                        <div className="grid grid-cols-3 gap-3">
                          {skinOptions.map(opt => (
                            <div
                              key={opt.value}
                              onClick={() => { field.onChange(opt.value); form.setValue('skinSensitivity', opt.value as 'normal' | 'sensitive' | 'very-sensitive', { shouldValidate: true }); }}
                              className={`border-2 rounded-2xl p-4 text-center cursor-pointer transition-all ${watchedSkinSensitivity === opt.value ? 'border-blue-500 bg-blue-50' : 'border-border'}`}
                            >
                              <div className="text-xl">{opt.emoji}</div>
                              <p className="text-[10px] font-bold mt-1">{opt.label}</p>
                            </div>
                          ))}
                        </div>
                      </FormItem>
                    )} />

                    {/* Duration — required */}
                    <FormField control={form.control} name="sessionDuration" render={() => (
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

                {/* Error summary — only required field errors */}
                {Object.keys(form.formState.errors).length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 items-start">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-red-700 mb-1">Please complete these required fields:</p>
                      <ul className="text-xs text-red-600 space-y-0.5 list-disc list-inside">
                        {Object.entries(form.formState.errors).map(([key, err]) => (
                          <li key={key}>{(err as { message?: string })?.message || key}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <Button type="submit" className="w-full bg-blue-600 py-8 text-xl font-bold rounded-2xl shadow-lg">
                    Generate AI Settings & Start →
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => {
                      form.setValue('voiceGuided', true);
                      form.handleSubmit(onSubmit, onInvalid)();
                    }}
                    className="w-full bg-purple-100 text-purple-700 hover:bg-purple-200 py-6 text-lg font-bold rounded-2xl shadow-sm border border-purple-200 flex items-center justify-center gap-2"
                  >
                    <Mic className="w-5 h-5" />
                    Start Voice-Guided Session (VoiceCare)
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SessionSetupForm;
