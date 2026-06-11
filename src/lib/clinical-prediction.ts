import { FirebaseSession } from '@/lib/schemas/session.schema'
import { FirebasePainLog } from '@/lib/schemas/painlog.schema'

/**
 * Personalized therapy insights based on historical session patterns.
 * Helps clinicians optimize treatment plans using past data.
 */
export interface OutcomeInsight {
  averageRelief: number // percentage
  trend: 'improving' | 'stable' | 'declining'
  dataPoints: number
  insight: string
  riskFactors: string[]
}

export async function generateTherapyInsights(
  sessions: FirebaseSession[],
  _painLogs: FirebasePainLog[]
): Promise<OutcomeInsight> {
  // Calculate historical relief
  const reliefs = sessions.map(s => s.painBefore - s.painAfter)
  const avgRelief = reliefs.length > 0
    ? reliefs.reduce((a, b) => a + b, 0) / reliefs.length
    : 0

  // Calculate trend
  const recentSessions = sessions.slice(0, 5)
  const recentRelief = recentSessions.length > 0
    ? recentSessions.reduce((sum, s) => sum + (s.painBefore - s.painAfter), 0) / recentSessions.length
    : avgRelief

  // Trend analysis
  const trend = recentRelief > avgRelief ? 'improving' : recentRelief < avgRelief ? 'declining' : 'stable'

  return {
    averageRelief: Math.round(avgRelief * 10) / 10,
    trend,
    dataPoints: sessions.length,
    insight:
      trend === 'improving'
        ? 'Patient shows improved pain relief with recent sessions.'
        : trend === 'declining'
          ? 'Recent sessions show reduced efficacy. Consider adjusting parameters.'
          : 'Therapy efficacy is stable across recorded sessions.',
    riskFactors: [],
  }
}
