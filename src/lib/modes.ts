/**
 * TensPilot Mode Parameter Repository
 * Evidence-based TENS parameters for 4 core pain modes
 * 
 * References:
 * - Johnson et al. (2015): "Transcutaneous Electrical Nerve Stimulation..."
 * - Dailey et al. (2013): "Gate Control Theory..." 
 * - Smart et al. (2016): "Acupuncture-like TENS for chronic pain"
 * - Vincent et al. (2018): "EMS and TENS in rehabilitation"
 */

export type TensModeType = 'general' | 'neuropathy' | 'musculoskeletal' | 'period';

export interface ElectrodePlacement {
  location: string;
  description: string;
  imageUrl?: string; // For future AR/visual guides
  mobileAppAdvice: string;
}

export interface TensParameters {
  frequency: {
    min: number; // Hz
    max: number;
    recommended: number;
    rationale: string;
  };
  pulseWidth: {
    min: number; // microseconds
    max: number;
    recommended: number;
    unit: string;
  };
  waveform: 'biphasic-symmetric' | 'biphasic-asymmetric' | 'monophasic';
  waveformRationale: string;
  intensity: {
    min: number; // Sensory threshold (0-10 scale, device-dependent)
    recommended: number; // Paresthesia (comfortable tingling)
    max: number; // Sub-motor (just below muscle contraction)
    unit: string;
  };
  sessionDuration: {
    min: number; // minutes
    max: number;
    recommended: number;
  };
  frequency_modulation?: {
    enabled: boolean;
    sweepRange?: string;
    rationale: string; // Why: prevents accommodation
  };
  amplitude_modulation?: {
    enabled: boolean;
    rationale: string;
  };
  dutyCycle?: number; // Percentage of time device is on vs off (for burst modes)
  mechanism: string; // Physiological mechanism (Gate Control, Endorphins, etc.)
}

export interface TensModeConfig {
  id: TensModeType;
  name: string;
  emoji: string;
  tagline: string; // Short, user-friendly description
  description: string; // Longer clinical description
  targetConditions: string[]; // E.g., "Acute headaches", "Diabetic neuropathy"
  parameters: TensParameters;
  electrodePlacements: Record<string, ElectrodePlacement>;
  contraindications: string[]; // Absolute + relative
  precautions: string[]; // Safety warnings
  startingIntensity: number; // Recommended initial setting (0-10)
  expectedReliefTimeframe: {
    min: number; // minutes
    max: number;
  };
  efficacyLevel: 'high' | 'moderate' | 'variable'; // Based on evidence
  advancedSettings: {
    allowCustomFrequency: boolean;
    allowCustomPulseWidth: boolean;
    allowCustomWaveform: boolean;
  };
  educationUrl?: string; // Link to detailed guide
}

// ════════════════════════════════════════════════════════════════
// MODE 1: GENERAL PAIN RELIEF (Conventional TENS)
// ════════════════════════════════════════════════════════════════
export const GENERAL_PAIN_MODE: TensModeConfig = {
  id: 'general',
  name: 'General Pain Relief',
  emoji: '🩹',
  tagline: 'Quick relief for acute or everyday pain',
  description:
    'Conventional high-frequency TENS using gate control theory. Ideal for sudden injuries, headaches, post-exercise soreness, and general aches. Stimulates large nerve fibers to "close the gate" on pain signals.',
  targetConditions: [
    'Acute headaches / migraines',
    'Minor muscle strains',
    'Post-exercise soreness',
    'Tension headaches',
    'General joint aches',
    'Minor cuts / wounds',
  ],
  parameters: {
    frequency: {
      min: 80,
      max: 120,
      recommended: 100,
      rationale: 'Gate Control Theory: High-frequency activates large Aβ fibers, inhibiting pain transmission.',
    },
    pulseWidth: {
      min: 60,
      max: 150,
      recommended: 100,
      unit: 'μs',
    },
    waveform: 'biphasic-symmetric',
    waveformRationale: 'Biphasic symmetric reduces skin irritation and is safest for prolonged use.',
    intensity: {
      min: 2,
      recommended: 5,
      max: 8,
      unit: '0-10 scale (comfortable tingling)',
    },
    sessionDuration: {
      min: 15,
      max: 45,
      recommended: 20,
    },
    frequency_modulation: {
      enabled: true,
      sweepRange: '80-120 Hz',
      rationale: 'Prevents accommodation (habituation); keeps nerve fibers responsive.',
    },
    mechanism: 'Gate Control Theory',
  },
  electrodePlacements: {
    'headache': {
      location: 'Temples & Neck',
      description: 'Place one electrode on each temple (above ears), or one at base of skull on each side.',
      mobileAppAdvice:
        '📍 Position electrodes symmetrically on temples. Avoid eyes and ears. Clean skin first.',
    },
    'shoulder': {
      location: 'Shoulder Area',
      description:
        'Place electrodes above and around the shoulder joint, avoiding the collarbone and brachial plexus.',
      mobileAppAdvice:
        '📍 Electrodes form a box around the sore area. Keep them at least 2 inches apart.',
    },
    'lower-back': {
      location: 'Lower Back (Paraspinal)',
      description: 'Place electrodes on either side of the spine, at the level of pain. Avoid direct spine contact.',
      mobileAppAdvice: '📍 Position electrodes 1-2 inches on each side of spine, at pain level.',
    },
    'knee': {
      location: 'Knee (Above & Below Kneecap)',
      description: 'Place one electrode above the kneecap and one below, straddling the knee.',
      mobileAppAdvice: '📍 Create vertical line electrodes above and below kneecap.',
    },
    'wrist': {
      location: 'Wrist / Hand',
      description: 'Place small electrodes on either side of wrist or on hand dorsum/palm.',
      mobileAppAdvice: '📍 For wrist: one on top, one on bottom. For hand: use small electrodes.',
    },
    'ankle': {
      location: 'Ankle / Foot',
      description: 'Place electrodes around the ankle joint or on top and bottom of foot.',
      mobileAppAdvice: '📍 Ankle: straddle joint. Foot: top and bottom placement.',
    },
  },
  contraindications: [
    'Cardiac pacemaker or implantable defibrillator',
    'Pregnancy (first trimester) — consult physician',
    'Over the chest or neck',
    'Over the head / brain',
  ],
  precautions: [
    'Do not place electrodes over the eyes',
    'Ensure skin is clean and unbroken',
    'Start with low intensity and increase gradually',
    'Do not use while driving or operating machinery',
    'Remove device immediately if burning sensation occurs',
  ],
  startingIntensity: 4,
  expectedReliefTimeframe: {
    min: 5,
    max: 15,
  },
  efficacyLevel: 'high',
  advancedSettings: {
    allowCustomFrequency: true,
    allowCustomPulseWidth: true,
    allowCustomWaveform: true,
  },
};

// ════════════════════════════════════════════════════════════════
// MODE 2: NEUROPATHY SUPPORT (Acupuncture-like / Low-Frequency TENS)
// ════════════════════════════════════════════════════════════════
export const NEUROPATHY_MODE: TensModeConfig = {
  id: 'neuropathy',
  name: 'Neuropathy Support',
  emoji: '🧠',
  tagline: 'Relief for nerve pain and tingling',
  description:
    'Acupuncture-like (low-frequency) TENS targeting small nerve fibers (Aδ, C-fibers). Stimulates endorphin and enkephalin release. Effective for chronic neuropathic conditions (diabetic neuropathy, sciatica, neuropathic pain).',
  targetConditions: [
    'Diabetic neuropathy',
    'Sciatica',
    'Post-herpetic neuralgia (shingles pain)',
    'Peripheral neuropathy',
    'Nerve compression pain',
    'Neuropathic tingling / paresthesia',
  ],
  parameters: {
    frequency: {
      min: 2,
      max: 10,
      recommended: 5,
      rationale:
        'Low frequency activates Aδ and C-fibers; promotes endorphin/enkephalin release over 15-20 minutes.',
    },
    pulseWidth: {
      min: 150,
      max: 250,
      recommended: 200,
      unit: 'μs',
    },
    waveform: 'biphasic-symmetric',
    waveformRationale: 'Longer pulse width needed to reach deeper nerve fibers.',
    intensity: {
      min: 3,
      recommended: 6,
      max: 9,
      unit: '0-10 scale (mild muscle twitch acceptable)',
    },
    sessionDuration: {
      min: 20,
      max: 60,
      recommended: 30,
    },
    frequency_modulation: {
      enabled: false,
      rationale: 'Fixed frequency better for endorphin-based relief; modulation less critical.',
    },
    mechanism: 'Endorphin/Enkephalin Release + Neuromodulation',
  },
  electrodePlacements: {
    'foot-neuropathy': {
      location: 'Foot (Diabetic Neuropathy)',
      description:
        'Place electrodes on top and bottom of foot, or on sole near arch. Can also place on inner/outer ankle.',
      mobileAppAdvice: '📍 For foot: top and sole. For ankle: inner and outer sides.',
    },
    'leg-sciatica': {
      location: 'Leg / Sciatic Path',
      description:
        'Place one electrode at the point of maximum pain (often buttock or thigh), one electrode 2-3 inches away along nerve path.',
      mobileAppAdvice: '📍 Follow the pain — place one at point of pain, one along the nerve path below.',
    },
    'lower-back-sciatica': {
      location: 'Lower Back (Sciatica Origin)',
      description: 'Place electrodes on lower back near SI joint or at base of spine. 2-3 inches apart.',
      mobileAppAdvice: '📍 Position on lower back, on either side of spine, at pain level.',
    },
    'hand-neuropathy': {
      location: 'Hand / Wrist (Peripheral Neuropathy)',
      description: 'Small electrodes placed on dorsum (back) and palm, or on inner and outer wrist.',
      mobileAppAdvice: '📍 Use small electrodes: top and bottom of hand/wrist.',
    },
  },
  contraindications: [
    'Cardiac pacemaker',
    'Pregnancy — consult physician',
    'Over the chest or carotid arteries',
    'Hypersensitivity to electrical stimulation',
  ],
  precautions: [
    'Do not use if skin sensation is completely absent (risk of burns)',
    'May cause mild muscle twitching — this is normal and therapeutic',
    'Sessions may take 15-20 minutes to feel endorphin effects',
    'Do not use while driving or operating machinery',
    'Use consistently (daily) for best results',
  ],
  startingIntensity: 5,
  expectedReliefTimeframe: {
    min: 15,
    max: 30,
  },
  efficacyLevel: 'moderate',
  advancedSettings: {
    allowCustomFrequency: true,
    allowCustomPulseWidth: true,
    allowCustomWaveform: false, // Stick to biphasic for safety
  },
};

// ════════════════════════════════════════════════════════════════
// MODE 3: MUSCLE & JOINT PAIN (Conventional + Enhanced TENS / EMS-style)
// ════════════════════════════════════════════════════════════════
export const MUSCULOSKELETAL_MODE: TensModeConfig = {
  id: 'musculoskeletal',
  name: 'Muscle & Joint Pain',
  emoji: '🦵',
  tagline: 'Relief for muscle, joint, and arthritis pain',
  description:
    'High-frequency TENS with intensity for muscle relaxation and gate control. Includes optional burst/modulation for deeper muscle engagement. Ideal for arthritis, strains, sprains, muscle fatigue, and sports injuries.',
  targetConditions: [
    'Arthritis (osteoarthritis, rheumatoid)',
    'Muscle strains and sprains',
    'Tendinitis / Bursitis',
    'Sports injuries',
    'Back pain (muscular)',
    'Knee pain (joint)',
    'Postoperative pain (muscular)',
  ],
  parameters: {
    frequency: {
      min: 50,
      max: 100,
      recommended: 80,
      rationale: 'Moderate-high frequency for gate control + muscle relaxation.',
    },
    pulseWidth: {
      min: 100,
      max: 200,
      recommended: 150,
      unit: 'μs',
    },
    waveform: 'biphasic-symmetric',
    waveformRationale: 'Can include bursts (50 Hz carrier) for deeper muscle stimulation.',
    intensity: {
      min: 4,
      recommended: 6,
      max: 9,
      unit: '0-10 scale (visible muscle contraction acceptable)',
    },
    sessionDuration: {
      min: 20,
      max: 45,
      recommended: 30,
    },
    frequency_modulation: {
      enabled: true,
      sweepRange: '50-100 Hz or burst (50 Hz carrier, 2-4 Hz envelope)',
      rationale: 'Prevents accommodation; burst modes enhance muscle relaxation.',
    },
    mechanism: 'Gate Control Theory + Muscle Relaxation',
  },
  electrodePlacements: {
    'knee-arthritis': {
      location: 'Knee (Arthritis / Joint Pain)',
      description:
        'Place electrodes above and below the kneecap, surrounding the joint. Can also place on medial and lateral knee.',
      mobileAppAdvice: '📍 Surround the knee: above and below. Keep electrodes 2-3 inches apart.',
    },
    'shoulder-arthritis': {
      location: 'Shoulder (Joint Pain)',
      description: 'Place electrodes above and below shoulder joint, or on anterior/posterior shoulder.',
      mobileAppAdvice: '📍 Box pattern around shoulder joint. Avoid collarbone.',
    },
    'lower-back-muscular': {
      location: 'Lower Back (Muscular Pain)',
      description:
        'Place electrodes on paraspinal muscles, on either side of spine. Can be higher or lower depending on pain level.',
      mobileAppAdvice: '📍 Bilateral placement on lower back, 1-2 inches from spine.',
    },
    'quad-hamstring': {
      location: 'Thigh (Quad or Hamstring)',
      description: 'Place electrodes above and below the painful muscle area.',
      mobileAppAdvice: '📍 Straddle the painful muscle: one electrode above, one below.',
    },
    'calf': {
      location: 'Calf (Muscle Strain)',
      description: 'Place electrodes above and below calf pain, or on medial and lateral calf.',
      mobileAppAdvice: '📍 Surround calf with electrodes.',
    },
  },
  contraindications: [
    'Cardiac pacemaker',
    'Pregnancy — consult physician',
    'Acute inflammation or cellulitis at electrode site',
    'Over the chest (heart)',
  ],
  precautions: [
    'Visible muscle contractions are normal; reduce intensity if uncomfortable',
    'Avoid if acute inflammation present (use 24-48h after injury)',
    'May cause temporary muscle fatigue; rest afterward',
    'Do not use during intense exercise',
  ],
  startingIntensity: 5,
  expectedReliefTimeframe: {
    min: 10,
    max: 20,
  },
  efficacyLevel: 'high',
  advancedSettings: {
    allowCustomFrequency: true,
    allowCustomPulseWidth: true,
    allowCustomWaveform: true,
  },
};

// ════════════════════════════════════════════════════════════════
// MODE 4: PERIOD COMFORT (Targeted Protocol for Dysmenorrhea)
// ════════════════════════════════════════════════════════════════
export const PERIOD_MODE: TensModeConfig = {
  id: 'period',
  name: 'Period Comfort',
  emoji: '🌸',
  tagline: 'Gentle relief for menstrual cramping and pelvic pain',
  description:
    'Specialized low-frequency, high-amplitude TENS for dysmenorrhea (period pain). Targets pelvic and lower abdominal muscles. Combines gate control + endorphin release. Rhythm and placement designed for menstrual cramp relief.',
  targetConditions: [
    'Dysmenorrhea (period cramping)',
    'Endometriosis-related pain',
    'Pelvic pain',
    'Lower abdominal cramping',
  ],
  parameters: {
    frequency: {
      min: 10,
      max: 20,
      recommended: 15,
      rationale: 'Slower rhythm mimics natural pelvic rhythms; promotes relaxation + endorphin release.',
    },
    pulseWidth: {
      min: 150,
      max: 250,
      recommended: 200,
      unit: 'μs',
    },
    waveform: 'biphasic-symmetric',
    waveformRationale: 'Longer pulse for deep abdominal/pelvic muscle penetration.',
    intensity: {
      min: 3,
      recommended: 6,
      max: 8,
      unit: '0-10 scale (gentle, soothing)',
    },
    sessionDuration: {
      min: 20,
      max: 60,
      recommended: 30,
    },
    frequency_modulation: {
      enabled: false,
      rationale: 'Fixed, gentle rhythm preferred for relaxation.',
    },
    amplitude_modulation: {
      enabled: true,
      rationale: 'Optional gentle pulsing to enhance soothing effect.',
    },
    mechanism: 'Muscle Relaxation + Endorphin Release + Gate Control',
  },
  electrodePlacements: {
    'lower-abdomen': {
      location: 'Lower Abdomen',
      description:
        'Place electrodes low on the abdomen, just above the pubic line. Bilateral placement (left and right sides).',
      mobileAppAdvice: '📍 Position electrodes symmetrically low on abdomen. Feel for tender area; place around it.',
    },
    'lower-back-pelvic': {
      location: 'Lower Back (Over SI Joint)',
      description: 'Place electrodes on lower back, over sacroiliac joint. Can be combined with abdominal electrodes.',
      mobileAppAdvice: '📍 Place low on back, over SI joint (dimples on lower back).',
    },
    'pelvic-grid': {
      location: 'Pelvic Grid (4-electrode setup)',
      description:
        'Use 2-channel device: one channel on lower abdomen, one channel on lower back (sacrum/SI joint). 4 electrodes total for full pelvic coverage.',
      mobileAppAdvice:
        '📍 Advanced: Use 4 electrodes in grid pattern for full pelvic coverage. Consult guide for placement.',
    },
  },
  contraindications: [
    'Cardiac pacemaker',
    'Pregnancy (any trimester) — DO NOT USE',
    'Undiagnosed pelvic pain (see physician first)',
    'During heavy menstrual flow (first 1-2 days) — use conservative settings',
  ],
  precautions: [
    'Use starting 1-2 days before expected period for best results',
    'Can be used during period, but start with low intensity',
    'Do not use if pain is severe or accompanied by fever (may indicate infection)',
    'Relax and breathe deeply during session',
    'Consider combining with heat therapy for enhanced comfort',
    'If pain persists after multiple sessions, consult gynecologist',
  ],
  startingIntensity: 4,
  expectedReliefTimeframe: {
    min: 10,
    max: 25,
  },
  efficacyLevel: 'moderate',
  advancedSettings: {
    allowCustomFrequency: true,
    allowCustomPulseWidth: false, // Keep pulse width fixed for safety in this sensitive area
    allowCustomWaveform: false,
  },
};

// ════════════════════════════════════════════════════════════════
// MODE REGISTRY & HELPER FUNCTIONS
// ════════════════════════════════════════════════════════════════

export const MODES: Record<TensModeType, TensModeConfig> = {
  general: GENERAL_PAIN_MODE,
  neuropathy: NEUROPATHY_MODE,
  musculoskeletal: MUSCULOSKELETAL_MODE,
  period: PERIOD_MODE,
};

export function getModeConfig(mode: TensModeType): TensModeConfig {
  return MODES[mode];
}

export function getAllModes(): TensModeConfig[] {
  return Object.values(MODES);
}

export function getModeByEmoji(emoji: string): TensModeConfig | undefined {
  return Object.values(MODES).find(m => m.emoji === emoji);
}

export function getElectrodePlacement(
  mode: TensModeType,
  placementKey: string
): ElectrodePlacement | undefined {
  const modeConfig = MODES[mode];
  return modeConfig?.electrodePlacements[placementKey];
}

export function validateModeConfig(mode: TensModeType): { valid: boolean; errors: string[] } {
  const modeConfig = MODES[mode];
  if (!modeConfig) return { valid: false, errors: [`Unknown mode: ${mode}`] };

  const errors: string[] = [];

  // Validate frequency ranges
  if (modeConfig.parameters.frequency.min > modeConfig.parameters.frequency.max) {
    errors.push(`Frequency: min (${modeConfig.parameters.frequency.min}) > max (${modeConfig.parameters.frequency.max})`);
  }

  // Validate pulse width ranges
  if (modeConfig.parameters.pulseWidth.min > modeConfig.parameters.pulseWidth.max) {
    errors.push(
      `Pulse width: min (${modeConfig.parameters.pulseWidth.min}) > max (${modeConfig.parameters.pulseWidth.max})`
    );
  }

  // Validate intensity ranges
  if (modeConfig.parameters.intensity.min > modeConfig.parameters.intensity.max) {
    errors.push(`Intensity: min (${modeConfig.parameters.intensity.min}) > max (${modeConfig.parameters.intensity.max})`);
  }

  // Validate session duration ranges
  if (modeConfig.parameters.sessionDuration.min > modeConfig.parameters.sessionDuration.max) {
    errors.push(
      `Session duration: min (${modeConfig.parameters.sessionDuration.min}) > max (${modeConfig.parameters.sessionDuration.max})`
    );
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Adjust parameters based on user experience and skin sensitivity
 * This is used during session setup to tailor the mode to the individual
 */
export function adjustParametersForUser(
  modeConfig: TensModeConfig,
  options: {
    previousTensExperience?: 'first-time' | 'occasional' | 'experienced';
    skinSensitivity?: 'normal' | 'sensitive' | 'very-sensitive';
    age?: number;
  }
): TensModeConfig {
  const adjusted = JSON.parse(JSON.stringify(modeConfig)) as TensModeConfig;

  // Reduce intensity for first-time users
  if (options.previousTensExperience === 'first-time') {
    adjusted.startingIntensity = Math.max(1, adjusted.startingIntensity - 1);
    adjusted.parameters.intensity.recommended = Math.max(1, adjusted.parameters.intensity.recommended - 1);
  }

  // Reduce intensity for sensitive skin
  if (options.skinSensitivity === 'sensitive') {
    adjusted.startingIntensity = Math.max(1, adjusted.startingIntensity - 1);
    adjusted.parameters.intensity.recommended = Math.max(1, adjusted.parameters.intensity.recommended - 1);
  }
  if (options.skinSensitivity === 'very-sensitive') {
    adjusted.startingIntensity = Math.max(1, adjusted.startingIntensity - 2);
    adjusted.parameters.intensity.recommended = Math.max(1, adjusted.parameters.intensity.recommended - 2);
  }

  // Adjust for older users (potentially more sensitive)
  if (options.age && options.age > 65) {
    adjusted.startingIntensity = Math.max(1, adjusted.startingIntensity - 1);
  }

  return adjusted;
}

export default MODES;
