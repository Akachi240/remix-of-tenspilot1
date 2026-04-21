
import React, { useState } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProfiles } from '@/context/ProfileContext';
import { User, CheckCircle2, Trash2, X } from 'lucide-react';

const Settings = () => {
  const { profiles, activeProfileId, activeProfile, addProfile, deleteProfile, setActiveProfileId, addMedication, removeMedication } = useProfiles();
  const [newName, setNewName] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [newMed, setNewMed] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleAddProfile = () => {
    if (!newName.trim()) return;
    addProfile(newName.trim(), newCondition.trim());
    setNewName('');
    setNewCondition('');
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
          <h1 className="text-2xl font-bold text-medical-900">Settings</h1>

          {/* Add Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add Patient Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <input
                placeholder="Patient name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-medical-500"
                required
              />
              <input
                placeholder="Primary condition (e.g. Lower Back Pain)"
                value={newCondition}
                onChange={e => setNewCondition(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-medical-500"
              />
              <Button onClick={handleAddProfile} className="w-full bg-medical-600 hover:bg-medical-700 text-white rounded-xl">
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
              {profiles.length === 0 && <p className="text-sm text-muted-foreground">No profiles yet.</p>}
              {profiles.map(p => (
                <div key={p.id}>
                  <div
                    onClick={() => setActiveProfileId(p.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      activeProfileId === p.id ? 'border-medical-500 bg-medical-50' : 'border-border hover:border-medical-300'
                    }`}
                  >
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">{p.name}</p>
                      <p className="text-sm text-muted-foreground">{p.primaryCondition}</p>
                    </div>
                    {activeProfileId === p.id && <CheckCircle2 className="h-5 w-5 text-medical-600" />}
                    <button
                      onClick={e => { e.stopPropagation(); setConfirmDeleteId(p.id); }}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {confirmDeleteId === p.id && (
                    <div className="ml-8 mt-2 p-3 border border-red-200 rounded-xl bg-red-50 text-sm space-y-2">
                      <p>Delete <strong>{p.name}</strong>? All session data will be permanently lost.</p>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => { deleteProfile(p.id); setConfirmDeleteId(null); }} className="bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs">
                          Confirm Delete
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setConfirmDeleteId(null)} className="rounded-xl text-xs">
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
                <CardTitle className="text-lg">Current Medications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {activeProfile.medications.length === 0 && <p className="text-sm text-muted-foreground">No medications recorded.</p>}
                  {activeProfile.medications.map((med, i) => (
                    <span key={i} className="bg-medical-50 border border-medical-200 rounded-full px-3 py-1 text-sm flex items-center gap-2">
                      {med}
                      <button onClick={() => removeMedication(med)} className="text-medical-600 hover:text-red-600">
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
                    className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-medical-500"
                  />
                  <Button onClick={handleAddMed} className="bg-medical-600 hover:bg-medical-700 text-white rounded-xl text-sm">
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
