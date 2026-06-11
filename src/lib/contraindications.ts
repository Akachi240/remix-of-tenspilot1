/**
 * Medical contraindications for TENS therapy
 * CRITICAL: Prevents serious medical incidents
 */

export interface ContraindicationCheck {
  warning: boolean
  severity: 'warn' | 'caution' | 'critical'
  message: string
  action: string
}

export const contraindications = {
  pacemakerOrICD: {
    warning: true,
    severity: 'critical' as const,
    message: 'TENS is contraindicated with pacemakers or implanted defibrillators',
    action: 'Consult your cardiologist before using TENS',
  },
  pregnancy: {
    warning: true,
    severity: 'critical' as const,
    message: 'TENS over abdomen during pregnancy is contraindicated',
    action: 'Do not use TENS over abdomen area',
  },
  epilepsy: {
    warning: true,
    severity: 'caution' as const,
    message: 'TENS may trigger seizures in some epilepsy patients',
    action: 'Consult neurologist; avoid head placement',
  },
  skinConditions: {
    warning: true,
    severity: 'warn' as const,
    message: 'Do not use TENS over damaged, infected, or irritated skin',
    action: 'Apply only to healthy skin',
  },
  metalImplants: {
    warning: true,
    severity: 'caution' as const,
    message: 'Some metal implants may be affected by TENS',
    action: 'Verify implant compatibility with manufacturer',
  },
}

/**
 * Check patient for contraindications
 */
export function checkContraindications(patientData: Record<string, unknown>): ContraindicationCheck[] {
  const warnings: ContraindicationCheck[] = []

  if (patientData?.hasPacemaker) {
    warnings.push(contraindications.pacemakerOrICD)
  }
  if (patientData?.isPregnant) {
    warnings.push(contraindications.pregnancy)
  }
  if (patientData?.hasEpilepsy) {
    warnings.push(contraindications.epilepsy)
  }
  if (patientData?.hasSkinConditions) {
    warnings.push(contraindications.skinConditions)
  }
  if (patientData?.hasMetalImplants) {
    warnings.push(contraindications.metalImplants)
  }

  return warnings
}
