import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAllModes, TensModeType } from '@/lib/modes';
import { ChevronRight } from 'lucide-react';

interface ModeCardProps {
  modeId: TensModeType;
  emoji: string;
  name: string;
  tagline: string;
  targetConditions: string[];
  selected: boolean;
  onSelect: (mode: TensModeType) => void;
}

const ModeCard: React.FC<ModeCardProps> = ({
  modeId,
  emoji,
  name,
  tagline,
  targetConditions,
  selected,
  onSelect,
}) => (
  <Card
    className={`h-full cursor-pointer transition-all hover:shadow-lg ${
      selected
        ? 'ring-2 ring-blue-600 border-blue-200 bg-blue-50'
        : 'border-gray-200 hover:border-blue-300'
    }`}
    onClick={() => onSelect(modeId)}
  >
    <CardHeader>
      <div className="flex items-start justify-between gap-4">
        <div className="text-5xl">{emoji}</div>
        {selected && <div className="text-2xl">✓</div>}
      </div>
      <CardTitle className="text-lg mt-2">{name}</CardTitle>
      <CardDescription className="text-sm text-gray-600">{tagline}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-3">
      <div>
        <p className="text-xs font-semibold text-gray-700 mb-2">Best for:</p>
        <ul className="space-y-1">
          {targetConditions.slice(0, 3).map((condition, i) => (
            <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>{condition}</span>
            </li>
          ))}
          {targetConditions.length > 3 && (
            <li className="text-xs text-gray-500 italic">+ {targetConditions.length - 3} more</li>
          )}
        </ul>
      </div>
      <Button
        variant={selected ? 'default' : 'outline'}
        size="sm"
        className="w-full mt-2"
        onClick={(e) => {
          e.stopPropagation();
          onSelect(modeId);
        }}
      >
        {selected ? 'Selected' : 'Choose'} <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </CardContent>
  </Card>
);

interface ModeSelectionProps {
  selectedMode: TensModeType | null;
  onModeSelect: (mode: TensModeType) => void;
  onContinue: () => void;
}

/**
 * ModeSelector Component
 * Displays all 4 pain management modes and lets user choose one.
 * This is the primary entry point for session setup ("Choose Your Pain").
 */
export const ModeSelector: React.FC<ModeSelectionProps> = ({
  selectedMode,
  onModeSelect,
  onContinue,
}) => {
  const modes = getAllModes();

  return (
    <div className="space-y-6 w-full">
      {/* ── Header ── */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Choose Your Pain</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Select the type of pain you're experiencing. We'll customize the TENS parameters for your condition.
        </p>
      </div>

      {/* ── Mode Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modes.map((mode) => (
          <ModeCard
            key={mode.id}
            modeId={mode.id}
            emoji={mode.emoji}
            name={mode.name}
            tagline={mode.tagline}
            targetConditions={mode.targetConditions}
            selected={selectedMode === mode.id}
            onSelect={onModeSelect}
          />
        ))}
      </div>

      {/* ── Info Box ── */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-sm text-blue-900">ℹ️ How to Choose</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>
            <strong>General Pain:</strong> For everyday aches, headaches, and minor injuries.
          </p>
          <p>
            <strong>Neuropathy:</strong> For nerve pain, tingling, and chronic neuropathic conditions.
          </p>
          <p>
            <strong>Muscle & Joint:</strong> For arthritis, sprains, muscle strains, and sports injuries.
          </p>
          <p>
            <strong>Period Comfort:</strong> For menstrual cramping and dysmenorrhea relief.
          </p>
        </CardContent>
      </Card>

      {/* ── Action Button ── */}
      <Button
        onClick={onContinue}
        disabled={!selectedMode}
        size="lg"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
      >
        Continue with {selectedMode ? modes.find((m) => m.id === selectedMode)?.name : 'Selected Mode'}
      </Button>
    </div>
  );
};

export default ModeSelector;
