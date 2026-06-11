export interface SafetyCheckResult {
  isSafe: boolean;
  warningMessage?: string;
  isPainLog?: boolean;
  painLevel?: number;
}

export function analyzePatientInput(text: string, _language: string = 'en'): SafetyCheckResult {
  const lowerText = text.toLowerCase();
  
  // 1. Check for dangerous electrode placement
  const dangerousAreas = ['chest', 'heart', 'neck', 'throat', 'head', 'brain', 'eye', 'face'];
  if (dangerousAreas.some(area => lowerText.includes(area))) {
    return {
      isSafe: false,
      warningMessage: "⚠️ Safety Warning: Do not place TENS electrodes on your head, neck, throat, or across your chest. This can cause severe medical complications. Please consult your clinician immediately."
    };
  }

  // 2. Check for contraindications
  if (lowerText.includes('pacemaker') || lowerText.includes('pregnant') || lowerText.includes('epilepsy')) {
    return {
      isSafe: false,
      warningMessage: "⚠️ Safety Warning: TENS therapy is strongly contraindicated if you have a pacemaker, are pregnant, or have epilepsy. Do NOT use the device without explicit approval from your doctor."
    };
  }

  // 3. Voice Pain Logging extraction
  // e.g. "my pain is 6", "pain is 6 out of 10", "pain level 8"
  const painMatch = lowerText.match(/pain\s+(?:is|level|at)?\s*(?:a\s+)?(\d+)(?:\s*(?:\/|out of)\s*10)?/i) || 
                    lowerText.match(/(\d+)\s*(?:\/|out of)\s*10\s+pain/i);
  
  if (painMatch && painMatch[1]) {
    const level = parseInt(painMatch[1], 10);
    if (level >= 0 && level <= 10) {
      return {
        isSafe: true,
        isPainLog: true,
        painLevel: level
      };
    }
  }

  return { isSafe: true };
}
