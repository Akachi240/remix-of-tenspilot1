import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, MapPin, Zap } from 'lucide-react';
import { TensModeType, getModeConfig, ElectrodePlacement } from '@/lib/modes';
import { Badge } from '@/components/ui/badge';

interface ElectrodePlacementGuideProps {
  mode: TensModeType;
  location?: string;
  compact?: boolean;
}

/**
 * ElectrodePlacementGuide Component
 * 
 * Displays detailed electrode placement instructions for a given mode and location.
 * Includes visual descriptions, safety warnings, and best practices.
 * 
 * Can be displayed in:
 * - Full card view (during session setup)
 * - Compact inline view (during active session)
 */
export const ElectrodePlacementGuide: React.FC<ElectrodePlacementGuideProps> = ({
  mode,
  location,
  compact = false,
}) => {
  const modeConfig = getModeConfig(mode);
  const placement = location ? modeConfig.electrodePlacements[location] : undefined;

  if (compact && placement) {
    // ─── Compact inline version ──────────────────────────
    return (
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-blue-900">📍 Electrode Placement</p>
              <p className="text-sm text-blue-800">{placement.description}</p>
              {placement.mobileAppAdvice && (
                <p className="text-xs text-blue-700 mt-2 font-medium">{placement.mobileAppAdvice}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ─── Full view (detailed) ────────────────────────────
  return (
    <div className="space-y-4">
      {/* Mode header with emoji */}
      <div className="flex items-center gap-3">
        <div className="text-4xl">{modeConfig.emoji}</div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">{modeConfig.name}</h3>
          <p className="text-sm text-gray-600">{modeConfig.tagline}</p>
        </div>
      </div>

      {/* Available locations for this mode */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Electrode Placement Locations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(modeConfig.electrodePlacements).map(([key, placement]) => (
            <div
              key={key}
              className={`p-4 rounded-xl border-2 transition-all ${
                location === key
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-900">{placement.location}</p>
                  <p className="text-sm text-gray-600 mt-1">{placement.description}</p>
                  {placement.mobileAppAdvice && (
                    <p className="text-xs text-blue-700 font-medium mt-2 flex items-start gap-2">
                      <Zap className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      {placement.mobileAppAdvice}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Safety considerations for this mode */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2 text-amber-900">
            <AlertCircle className="h-4 w-4" />
            Safety Considerations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {modeConfig.precautions.map((precaution, i) => (
            <div key={i} className="flex gap-2 text-sm text-amber-800">
              <span className="font-bold flex-shrink-0">•</span>
              <span>{precaution}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Contraindications */}
      {modeConfig.contraindications.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Contraindications (Do NOT use if):</strong>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              {modeConfig.contraindications.map((contra, i) => (
                <li key={i}>{contra}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Mode mechanism */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-sm text-blue-900">How This Mode Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-blue-800">
            <strong>Mechanism:</strong> {modeConfig.parameters.mechanism}
          </p>
          <p className="text-sm text-blue-800">
            <strong>Frequency Range:</strong> {modeConfig.parameters.frequency.min}–{modeConfig.parameters.frequency.max} Hz
          </p>
          <p className="text-sm text-blue-800">
            <strong>Pulse Width:</strong> {modeConfig.parameters.pulseWidth.min}–{modeConfig.parameters.pulseWidth.max} {modeConfig.parameters.pulseWidth.unit}
          </p>
          <p className="text-sm text-blue-800">
            <strong>Expected Timeframe:</strong> {modeConfig.expectedReliefTimeframe.min}–{modeConfig.expectedReliefTimeframe.max} minutes
          </p>
          {modeConfig.parameters.frequency_modulation?.enabled && (
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> {modeConfig.parameters.frequency_modulation.rationale}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Efficacy badge */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-gray-700">Evidence Level:</span>
        <Badge
          className={`${
            modeConfig.efficacyLevel === 'high'
              ? 'bg-green-100 text-green-800'
              : modeConfig.efficacyLevel === 'moderate'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-blue-100 text-blue-800'
          }`}
        >
          {modeConfig.efficacyLevel.charAt(0).toUpperCase() + modeConfig.efficacyLevel.slice(1)}
        </Badge>
      </div>
    </div>
  );
};

export default ElectrodePlacementGuide;
