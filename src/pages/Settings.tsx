import React, { useState } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProfiles } from '@/context/ProfileContext';
import { User, CheckCircle2, Trash2, X, Cloud, Loader2 } from 'lucide-react';

const Settings = () => {
  const {
    profiles,
    activeProfileId,
    activeProfile,
    addProfile,
    deleteProfile,
    setActiveProfileId,
    addMedication,
    removeMedication,
    syncToSupabase,
    isSyncing,
    lastSynced,
  } = useProfiles();

  const [newName, setNewName] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [newAge, setNewAge] = useState('');
  const [newDOB, setNewDOB] = useState('');
  const [newPhysician, setNewPhysician] = useState('');
  const [newMed, setNewMed] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleAddProfile = () => {
    if (!newName.trim()) return;
    addProfile(
      newName.trim(),
      newCondition.trim(),
      newAge ? parseInt(newAge) : undefined,
      newDOB || undefined,
      newPhysician.trim() || undefined
    );
    setNewName('');
    setNewCondition('');
    setNewAge('');
    setNewDOB('');
    setNewPhysician('');
  };

  const handleAddMed = () => {
    if (!newMed.trim()) return;
    addMedication(newMed.trim());
    setNewMed('');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-grow py-8">
        <div className="max-w-lg mx-auto px-6 space-y-6">

          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
            <div className="flex flex-col items-end gap-1">
              <Button
                onClick={syncToSupabase}
                disabled={isSyncing}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2"
              >
                {isSyncing
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Cloud className="h-4 w-4" />
                }
                {isSyncing ? 'Syncing...' : 'Sync to Cloud'}
              </Button>
              {lastSynced && (
                <span className="text-xs text-slate-400">
                  Last saved {lastSynced.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>

          {/* Add Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add Patient Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <input
                placeholder="Patient name *"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                placeholder="Primary condition (e.g. Lower Back Pain)"
                value={newCondition}
                onChange={e => setNewCondition(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                placeholder="Age"
                type="number"
                value={newAge}
                onChange={e => setNewAge(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                placeholder="Date of Birth"
                type="date"
                value={newDOB}
                onChange={e => setNewDOB(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                placeholder="Supervising Physician"
                value={newPhysician}
                onChange={e => setNewPhysician(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <Button
                onClick={handleAddProfile}
                disabled={!newName.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
              >
                Add Profile
              </Button>
            </CardContent>
          </Card>

          {/* Profile List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Patient Profiles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {profiles.length === 0 && (
                <p className="text-sm text-slate-400">No profiles yet. Add one above.</p>
              )}
              {profiles.map(p => (
                <div key={p.id}>
                  <div
                    onClick={() => setActiveProfileId(p.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      activeProfileId === p.id
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-slate-200 hover:border-blue-200'
                    }`}
                  >
                    <User className="h-5 w-5 text-slate-400" />
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">{p.name}</p>
                      <p className="text-sm text-slate-500">
                        {p.primaryCondition}
                        {p.age && ` • Age ${p.age}`}
                      </p>
                    </div>
                    {activeProfileId === p.id && (
                      <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); setConfirmDeleteId(p.id); }}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {confirmDeleteId === p.id && (
                    <div className="ml-8 mt-2 p-3 border border-red-200 rounded-xl bg-red-50 text-sm space-y-2">
                      <p>Delete <strong>{p.name}</strong>? All data will be lost.</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => { deleteProfile(p.id); setConfirmDeleteId(null); }}
                          className="bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs"
                        >
                          Confirm Delete
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setConfirmDeleteId(null)}
                          className="rounded-xl text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Medications */}
          {activeProfile && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Medications — {activeProfile.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {activeProfile.medications.length === 0 && (
                    <p className="text-sm text-slate-400">No medications recorded.</p>
                  )}
                  {activeProfile.medications.map((med, i) => (
                    <span
                      key={i}
                      className="bg-blue-50 border border-blue-200 rounded-full px-3 py-1 text-sm flex items-center gap-2 text-blue-800"
                    >
                      {med}
                      <button
                        onClick={() => removeMedication(med)}
                        className="text-blue-400 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    placeholder="Add medication..."
                    value={newMed}
                    onChange={e => setNewMed(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddMed()}
                    className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <Button
                    onClick={handleAddMed}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm"
                  >
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </main>
    </div>
  );
};

export default Settings;