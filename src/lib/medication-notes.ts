/**
 * General clinical notes on medication classes commonly used alongside TENS therapy.
 * Used for clinician reference, NOT automated interaction checking.
 */

export const medicationNotes = {
  NSAIDs: {
    name: 'NSAIDs (e.g., Ibuprofen, Naproxen)',
    note: 'Commonly used with TENS. TENS may reduce the need for NSAIDs over time.',
    severity: 'info',
  },
  opioids: {
    name: 'Opioids',
    note: 'Patients on opioids may have altered pain perception. TENS is often used to help reduce opioid dependence.',
    severity: 'info',
  },
  anticoagulants: {
    name: 'Anticoagulants (Blood thinners)',
    note: 'Monitor for skin bruising or irritation at electrode placement sites.',
    severity: 'caution',
  },
  muscleRelaxants: {
    name: 'Muscle Relaxants',
    note: 'May compound muscle relaxation effects. Monitor patient mobility and stability post-session.',
    severity: 'info',
  },
}

export function getMedicationNotes(medications: string[]): Record<string, string>[] {
  const notes = []
  for (const med of medications) {
    for (const [key, noteData] of Object.entries(medicationNotes)) {
      if (med.toLowerCase().includes(key.toLowerCase())) {
        notes.push(noteData)
      }
    }
  }
  return notes
}
