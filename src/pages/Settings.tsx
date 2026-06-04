import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '@/components/layout/AppHeader';
import AdvancedSettings from '@/components/session/AdvancedSettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProfiles } from '@/context/ProfileContext';
import { useAuth } from '@/hooks/useAuth';
import { User, CheckCircle2, Trash2, X, LogOut, ArrowLeftRight } from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const {
    profiles,
    activeProfileId,
    activeProfile,
    addProfile,
    deleteProfile,
    setActiveProfileId,
    addMedication,
    removeMedication,
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

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-grow py-8">
        <div className="max-w-4xl mx-auto px-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="advanced">Advanced TENS</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="max-w-lg mx-auto space-y-6">
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

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Patient Profiles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {profiles.length === 0 && (
                    <p className="text-sm text-slate-400">No profiles yet. Add one above.</p>
                  )}
                  {profiles.map(profile => (
                    <div key={profile.id}>
                      <div
                        onClick={() => setActiveProfileId(profile.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                          activeProfileId === profile.id
                            ? 'border-blue-400 bg-blue-50'
                            : 'border-slate-200 hover:border-blue-200'
                        }`}
                      >
                        <User className="h-5 w-5 text-slate-400" />
                        <div className="flex-1">
                          <p className="font-medium text-slate-800">{profile.name}</p>
                          <p className="text-sm text-slate-500">
                            {profile.primaryCondition}
                            {profile.age && ` - Age ${profile.age}`}
                          </p>
                        </div>
                        {activeProfileId === profile.id && (
                          <CheckCircle2 className="h-5 w-5 text-blue-600" />
                        )}
                        <button
                          onClick={event => {
                            event.stopPropagation();
                            setConfirmDeleteId(profile.id);
                          }}
                          className="text-red-400 hover:text-red-600"
                          aria-label={`Delete ${profile.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {confirmDeleteId === profile.id && (
                        <div className="ml-8 mt-2 p-3 border border-red-200 rounded-xl bg-red-50 text-sm space-y-2">
                          <p>
                            Delete <strong>{profile.name}</strong>? All data will be lost.
                          </p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                deleteProfile(profile.id);
                                setConfirmDeleteId(null);
                              }}
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

              {activeProfile && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Medications - {activeProfile.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {activeProfile.medications && activeProfile.medications.length === 0 && (
                        <p className="text-sm text-slate-400">No medications recorded.</p>
                      )}
                      {activeProfile.medications && activeProfile.medications.map((med, index) => (
                        <span
                          key={`${med}-${index}`}
                          className="bg-blue-50 border border-blue-200 rounded-full px-3 py-1 text-sm flex items-center gap-2 text-blue-800"
                        >
                          {med}
                          <button
                            onClick={() => removeMedication(med)}
                            className="text-blue-400 hover:text-red-500"
                            aria-label={`Remove ${med}`}
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

              <Card className="border-slate-200">
                <CardContent className="pt-6 space-y-3">
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 rounded-xl flex items-center justify-center gap-2"
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                    Switch Account
                  </Button>
                  <Button
                    onClick={handleLogout}
                    className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl flex items-center justify-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Log Out
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced">
              <AdvancedSettings />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Settings;
