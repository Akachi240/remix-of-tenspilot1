import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Download,
  Upload,
  Copy,
  AlertTriangle,
  Settings,
  Save,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TensModeType, getModeConfig, TensModeConfig } from '@/lib/modes';

interface CustomPreset {
  id: string;
  name: string;
  mode: TensModeType;
  frequency: { min: number; max: number };
  pulseWidth: { min: number; max: number };
  intensity: { min: number; max: number };
  sessionDuration: { min: number; max: number };
  waveform: 'biphasic-symmetric' | 'biphasic-asymmetric' | 'monophasic';
  notes?: string;
  createdAt: string;
}

/**
 * AdvancedSettings Component
 * 
 * Clinician/power-user interface for full TENS parameter control.
 * Features:
 * - Full parameter customization (frequency, pulse width, waveform, intensity)
 * - Preset creation and management
 * - Mode comparison and analysis
 * - Data export (JSON, CSV)
 * - Research mode settings
 */
export const AdvancedSettings: React.FC = () => {
  const { toast } = useToast();
  const [mode, setMode] = useState<TensModeType>('general');
  const [customPresets, setCustomPresets] = useState<CustomPreset[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('tens-custom-presets') || '[]');
    } catch {
      return [];
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editingPreset, setEditingPreset] = useState<CustomPreset | null>(null);
  const [presetName, setPresetName] = useState('');
  const [presetNotes, setPresetNotes] = useState('');

  // Form state for custom parameters
  const [params, setParams] = useState({
    frequency: { min: 80, max: 120 },
    pulseWidth: { min: 100, max: 150 },
    intensity: { min: 2, max: 8 },
    sessionDuration: { min: 15, max: 45 },
    waveform: 'biphasic-symmetric' as CustomPreset['waveform'],
  });

  const modeConfig = getModeConfig(mode);

  // ─── Handlers ──
  const resetToModeDefaults = () => {
    const defaults = modeConfig.parameters;
    setParams({
      frequency: { min: defaults.frequency.min, max: defaults.frequency.max },
      pulseWidth: { min: defaults.pulseWidth.min, max: defaults.pulseWidth.max },
      intensity: { min: defaults.intensity.min, max: defaults.intensity.max },
      sessionDuration: { min: defaults.sessionDuration.min, max: defaults.sessionDuration.max },
      waveform: 'biphasic-symmetric',
    });
    setPresetName('');
    setPresetNotes('');
    toast({ title: 'Reset', description: 'Parameters reset to mode defaults.' });
  };

  const saveAsPreset = () => {
    if (!presetName.trim()) {
      toast({ title: 'Error', description: 'Please enter a preset name.', variant: 'destructive' });
      return;
    }

    const preset: CustomPreset = {
      id: Date.now().toString(),
      name: presetName,
      mode,
      frequency: params.frequency,
      pulseWidth: params.pulseWidth,
      intensity: params.intensity,
      sessionDuration: params.sessionDuration,
      waveform: params.waveform,
      notes: presetNotes,
      createdAt: new Date().toISOString(),
    };

    const updated = [...customPresets, preset];
    setCustomPresets(updated);
    localStorage.setItem('tens-custom-presets', JSON.stringify(updated));
    toast({ title: 'Saved', description: `Preset "${presetName}" created.` });
    setPresetName('');
    setPresetNotes('');
  };

  const deletePreset = (id: string) => {
    const updated = customPresets.filter((p) => p.id !== id);
    setCustomPresets(updated);
    localStorage.setItem('tens-custom-presets', JSON.stringify(updated));
    toast({ title: 'Deleted', description: 'Preset removed.' });
  };

  const loadPreset = (preset: CustomPreset) => {
    setParams({
      frequency: preset.frequency,
      pulseWidth: preset.pulseWidth,
      intensity: preset.intensity,
      sessionDuration: preset.sessionDuration,
      waveform: preset.waveform,
    });
    setMode(preset.mode);
    toast({ title: 'Loaded', description: `Preset "${preset.name}" loaded.` });
  };

  const exportPresetsJSON = () => {
    const data = JSON.stringify(customPresets, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tens-presets-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Exported', description: 'Presets exported as JSON.' });
  };

  const exportPresetsCSV = () => {
    const headers = [
      'Preset Name',
      'Mode',
      'Frequency Min',
      'Frequency Max',
      'Pulse Width Min',
      'Pulse Width Max',
      'Intensity Min',
      'Intensity Max',
      'Duration Min',
      'Duration Max',
      'Waveform',
      'Notes',
      'Created At',
    ];
    const rows = customPresets.map((p) => [
      p.name,
      p.mode,
      p.frequency.min,
      p.frequency.max,
      p.pulseWidth.min,
      p.pulseWidth.max,
      p.intensity.min,
      p.intensity.max,
      p.sessionDuration.min,
      p.sessionDuration.max,
      p.waveform,
      p.notes || '',
      p.createdAt,
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tens-presets-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Exported', description: 'Presets exported as CSV.' });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 py-8 px-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="h-8 w-8" /> Advanced TENS Settings
        </h1>
        <p className="text-gray-600 mt-2">
          Full parameter control for clinicians and power users. Customize presets, export data, and refine TENS therapy protocols.
        </p>
      </div>

      {/* Clinical Disclaimer */}
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>Clinical Use Only:</strong> These advanced settings should only be used by qualified healthcare professionals.
          Improper TENS parameter configuration may result in ineffective therapy or adverse effects. Always follow published clinical guidelines.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="editor" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="editor">Parameter Editor</TabsTrigger>
          <TabsTrigger value="presets">Presets</TabsTrigger>
          <TabsTrigger value="export">Export/Import</TabsTrigger>
        </TabsList>

        {/* ─── Parameter Editor Tab ─── */}
        <TabsContent value="editor" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>TENS Parameter Customization</CardTitle>
              <CardDescription>Select a mode and customize its parameters.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mode Selector */}
              <div>
                <Label className="font-bold mb-2 block">Mode</Label>
                <Select value={mode} onValueChange={(v) => setMode(v as TensModeType)}>
                  <SelectTrigger className="py-6">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">🩹 General Pain Relief</SelectItem>
                    <SelectItem value="neuropathy">🧠 Neuropathy Support</SelectItem>
                    <SelectItem value="musculoskeletal">🦵 Muscle & Joint Pain</SelectItem>
                    <SelectItem value="period">🌸 Period Comfort</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-600 mt-2">{modeConfig.description}</p>
              </div>

              {/* Mode Info Box */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4 space-y-2">
                  <p className="text-sm">
                    <strong>Mechanism:</strong> {modeConfig.parameters.mechanism}
                  </p>
                  <p className="text-sm">
                    <strong>Mode Default Frequency:</strong> {modeConfig.parameters.frequency.min}–{modeConfig.parameters.frequency.max} Hz
                  </p>
                  <p className="text-sm">
                    <strong>Mode Default Pulse Width:</strong> {modeConfig.parameters.pulseWidth.min}–{modeConfig.parameters.pulseWidth.max} {modeConfig.parameters.pulseWidth.unit}
                  </p>
                </CardContent>
              </Card>

              {/* Frequency */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="font-bold">Frequency (Hz)</Label>
                  <span className="text-sm text-gray-600">
                    {params.frequency.min}–{params.frequency.max} Hz
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label className="text-xs text-gray-600">Min</Label>
                      <Input
                        type="number"
                        value={params.frequency.min}
                        onChange={(e) =>
                          setParams((p) => ({
                            ...p,
                            frequency: {
                              ...p.frequency,
                              min: Math.max(1, parseInt(e.target.value) || 1),
                            },
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs text-gray-600">Max</Label>
                      <Input
                        type="number"
                        value={params.frequency.max}
                        onChange={(e) =>
                          setParams((p) => ({
                            ...p,
                            frequency: {
                              ...p.frequency,
                              max: Math.max(p.frequency.min, parseInt(e.target.value) || 150),
                            },
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <Slider
                    min={1}
                    max={200}
                    step={1}
                    value={[params.frequency.min, params.frequency.max]}
                    onValueChange={(v) =>
                      setParams((p) => ({
                        ...p,
                        frequency: { min: v[0], max: v[1] },
                      }))
                    }
                    className="w-full"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Recommended range: {modeConfig.parameters.frequency.min}–{modeConfig.parameters.frequency.max} Hz
                </p>
              </div>

              {/* Pulse Width */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="font-bold">Pulse Width (μs)</Label>
                  <span className="text-sm text-gray-600">
                    {params.pulseWidth.min}–{params.pulseWidth.max} μs
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label className="text-xs text-gray-600">Min</Label>
                      <Input
                        type="number"
                        value={params.pulseWidth.min}
                        onChange={(e) =>
                          setParams((p) => ({
                            ...p,
                            pulseWidth: {
                              ...p.pulseWidth,
                              min: Math.max(10, parseInt(e.target.value) || 10),
                            },
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs text-gray-600">Max</Label>
                      <Input
                        type="number"
                        value={params.pulseWidth.max}
                        onChange={(e) =>
                          setParams((p) => ({
                            ...p,
                            pulseWidth: {
                              ...p.pulseWidth,
                              max: Math.max(p.pulseWidth.min, parseInt(e.target.value) || 250),
                            },
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <Slider
                    min={10}
                    max={500}
                    step={10}
                    value={[params.pulseWidth.min, params.pulseWidth.max]}
                    onValueChange={(v) =>
                      setParams((p) => ({
                        ...p,
                        pulseWidth: { min: v[0], max: v[1] },
                      }))
                    }
                    className="w-full"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Recommended range: {modeConfig.parameters.pulseWidth.min}–{modeConfig.parameters.pulseWidth.max} μs
                </p>
              </div>

              {/* Intensity */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="font-bold">Intensity (0-10 scale)</Label>
                  <span className="text-sm text-gray-600">
                    {params.intensity.min}–{params.intensity.max}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label className="text-xs text-gray-600">Min</Label>
                      <Input
                        type="number"
                        min={0}
                        max={10}
                        value={params.intensity.min}
                        onChange={(e) =>
                          setParams((p) => ({
                            ...p,
                            intensity: {
                              ...p.intensity,
                              min: Math.max(0, Math.min(10, parseInt(e.target.value) || 0)),
                            },
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs text-gray-600">Max</Label>
                      <Input
                        type="number"
                        min={0}
                        max={10}
                        value={params.intensity.max}
                        onChange={(e) =>
                          setParams((p) => ({
                            ...p,
                            intensity: {
                              ...p.intensity,
                              max: Math.max(p.intensity.min, Math.min(10, parseInt(e.target.value) || 10)),
                            },
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <Slider
                    min={0}
                    max={10}
                    step={0.5}
                    value={[params.intensity.min, params.intensity.max]}
                    onValueChange={(v) =>
                      setParams((p) => ({
                        ...p,
                        intensity: { min: v[0], max: v[1] },
                      }))
                    }
                    className="w-full"
                  />
                </div>
              </div>

              {/* Session Duration */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="font-bold">Session Duration (min)</Label>
                  <span className="text-sm text-gray-600">
                    {params.sessionDuration.min}–{params.sessionDuration.max} min
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label className="text-xs text-gray-600">Min</Label>
                      <Input
                        type="number"
                        value={params.sessionDuration.min}
                        onChange={(e) =>
                          setParams((p) => ({
                            ...p,
                            sessionDuration: {
                              ...p.sessionDuration,
                              min: Math.max(5, parseInt(e.target.value) || 5),
                            },
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs text-gray-600">Max</Label>
                      <Input
                        type="number"
                        value={params.sessionDuration.max}
                        onChange={(e) =>
                          setParams((p) => ({
                            ...p,
                            sessionDuration: {
                              ...p.sessionDuration,
                              max: Math.max(p.sessionDuration.min, parseInt(e.target.value) || 60),
                            },
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <Slider
                    min={5}
                    max={120}
                    step={5}
                    value={[params.sessionDuration.min, params.sessionDuration.max]}
                    onValueChange={(v) =>
                      setParams((p) => ({
                        ...p,
                        sessionDuration: { min: v[0], max: v[1] },
                      }))
                    }
                    className="w-full"
                  />
                </div>
              </div>

              {/* Waveform */}
              <div>
                <Label className="font-bold mb-2 block">Waveform</Label>
                <Select value={params.waveform} onValueChange={(v: any) => setParams({ ...params, waveform: v })}>
                  <SelectTrigger className="py-6">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="biphasic-symmetric">Biphasic Symmetric (Standard)</SelectItem>
                    <SelectItem value="biphasic-asymmetric">Biphasic Asymmetric</SelectItem>
                    <SelectItem value="monophasic">Monophasic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Preset Name & Notes */}
              <div className="space-y-3 pt-4 border-t">
                <div>
                  <Label htmlFor="presetName" className="font-bold">
                    Save as Preset (Optional)
                  </Label>
                  <Input
                    id="presetName"
                    placeholder="e.g., My Custom Neuropathy"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="presetNotes" className="text-sm text-gray-600">
                    Notes
                  </Label>
                  <textarea
                    id="presetNotes"
                    placeholder="Clinical notes, patient info, etc."
                    value={presetNotes}
                    onChange={(e) => setPresetNotes(e.target.value)}
                    className="w-full mt-2 p-3 border rounded-lg text-sm"
                    rows={3}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button onClick={saveAsPreset} className="flex-1 bg-blue-600">
                  <Save className="h-4 w-4 mr-2" /> Save Preset
                </Button>
                <Button onClick={resetToModeDefaults} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" /> Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Presets Tab ─── */}
        <TabsContent value="presets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Saved Presets</CardTitle>
              <CardDescription>Manage your custom TENS presets.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {customPresets.length === 0 ? (
                <p className="text-gray-500 text-sm">No presets saved yet. Create one in the Parameter Editor tab.</p>
              ) : (
                customPresets.map((preset) => (
                  <Card key={preset.id} className="p-4 bg-gray-50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{preset.name}</p>
                        <p className="text-sm text-gray-600">
                          {preset.mode.toUpperCase()} • {preset.frequency.min}–{preset.frequency.max} Hz • {preset.intensity.min}–{preset.intensity.max} intensity
                        </p>
                        {preset.notes && <p className="text-xs text-gray-500 mt-2 italic">{preset.notes}</p>}
                        <p className="text-xs text-gray-400 mt-2">Created: {new Date(preset.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => loadPreset(preset)}>
                          Load
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deletePreset(preset.id)}
                          className="text-red-600"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Export/Import Tab ─── */}
        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export & Collaboration</CardTitle>
              <CardDescription>Share presets with colleagues or back up your data.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button onClick={exportPresetsJSON} variant="outline" className="h-auto flex-col gap-2 py-4">
                  <Download className="h-5 w-5" />
                  <span>Export as JSON</span>
                  <span className="text-xs text-gray-600">Machine-readable format</span>
                </Button>
                <Button onClick={exportPresetsCSV} variant="outline" className="h-auto flex-col gap-2 py-4">
                  <Download className="h-5 w-5" />
                  <span>Export as CSV</span>
                  <span className="text-xs text-gray-600">Spreadsheet-friendly format</span>
                </Button>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <Zap className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Collaboration:</strong> Export presets to share with clinical colleagues or research teams.
                  Data is stored locally on your device and can be imported into another TensPilot instance.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedSettings;
