import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '@/components/layout/AppHeader';
import AdvancedSettings from '@/components/session/AdvancedSettings';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProfiles } from '@/context/ProfileContext';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { User, CheckCircle2, Trash2, X, LogOut, ArrowLeftRight, CloudLightning, RefreshCw, Loader2, Link2, Unlink } from 'lucide-react';
import { collection, query, where, getDocs, doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const Settings = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { toast } = useToast();
  const {
    profiles,
    activeProfileId,
    activeProfile,
    addProfile,
    deleteProfile,
    setActiveProfileId,
    addMedication,
    removeMedication,
    syncToFirebase,
  } = useProfiles();

  const [newName, setNewName] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [newAge, setNewAge] = useState('');
  const [newDOB, setNewDOB] = useState('');
  const [newPhysician, setNewPhysician] = useState('');
  const [newMed, setNewMed] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [linkedDoctor, setLinkedDoctor] = useState<{ id: string; name: string; email?: string; specialty?: string } | null>(null);
  const [checkingLink, setCheckingLink] = useState(false);

  // Check if patient is already linked to a doctor
  useEffect(() => {
    const checkExistingLink = async () => {
      if (!user) return;
      setCheckingLink(true);
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        if (userData?.linkedDoctorId) {
          // Fetch doctor info
          const doctorDoc = await getDoc(doc(db, 'users', userData.linkedDoctorId));
          const doctorData = doctorDoc.data();
          setLinkedDoctor({
            id: userData.linkedDoctorId,
            name: doctorData?.name || doctorData?.displayName || 'Your Doctor',
            email: doctorData?.email,
            specialty: doctorData?.specialty,
          });
        }
      } catch (err) {
        console.error('Error checking doctor link:', err);
      } finally {
        setCheckingLink(false);
      }
    };
    checkExistingLink();
  }, [user]);

  const handleUnlinkDoctor = async () => {
    if (!user || !linkedDoctor) return;
    try {
      // Remove linkedDoctorId from patient's user doc
      await setDoc(doc(db, 'users', user.uid), {
        linkedDoctorId: null,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // Find and update the link document
      const q = query(
        collection(db, 'doctorPatientLinks'),
        where('patientId', '==', user.uid),
        where('doctorId', '==', linkedDoctor.id),
        where('status', '==', 'active')
      );
      const snapshot = await getDocs(q);
      for (const linkDoc of snapshot.docs) {
        await updateDoc(doc(db, 'doctorPatientLinks', linkDoc.id), {
          status: 'revoked'
        });
      }

      setLinkedDoctor(null);
      toast({ title: 'Unlinked', description: 'You have been unlinked from your doctor.' });
    } catch (err) {
      console.error('Error unlinking:', err);
      toast({ title: 'Error', description: 'Could not unlink. Please try again.', variant: 'destructive' });
    }
  };

  const handleLinkClinic = async () => {
    if (!accessCode.trim() || !user) return;
    setIsLinking(true);
    try {
      console.error('🔐 Attempting to link with code:', accessCode.trim());

      // Search for the access code - codes are numeric, no toUpperCase needed
      const q = query(
        collection(db, 'doctorPatientLinks'),
        where('accessCode', '==', accessCode.trim()),
        where('status', '==', 'active')
      );

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out')), 10000)
      );

      const snapshot = await Promise.race([getDocs(q), timeoutPromise]);
      
      if (snapshot.empty) {
        console.error('❌ No matching code found for:', accessCode.trim());
        toast({ title: 'Invalid Code', description: 'This access code is invalid or expired. Ask your doctor to generate a new one.', variant: 'destructive' });
        setIsLinking(false);
        return;
      }
      
      const linkDoc = snapshot.docs[0];
      const linkData = linkDoc.data();
      console.error('✅ Code found! Doctor ID:', linkData.doctorId);
      
      // Update link doc with patient info
      await updateDoc(doc(db, 'doctorPatientLinks', linkDoc.id), {
        patientId: user.uid,
        linkedAt: new Date()
      });
      console.error('✅ Link document updated');
      
      // Update patient profile root doc
      await setDoc(doc(db, 'users', user.uid), {
        linkedDoctorId: linkData.doctorId,
        userType: 'patient',
        updatedAt: new Date().toISOString()
      }, { merge: true });
      console.error('✅ Patient profile updated with linkedDoctorId');
      
      // Fetch doctor info and update UI immediately
      const doctorDoc = await getDoc(doc(db, 'users', linkData.doctorId));
      const doctorData = doctorDoc.data();
      setLinkedDoctor({
        id: linkData.doctorId,
        name: doctorData?.name || doctorData?.displayName || 'Your Doctor',
        email: doctorData?.email,
        specialty: doctorData?.specialty,
      });
      
      toast({ title: 'Success! 🎉', description: 'Your account is now linked to your doctor! They can see your therapy data.' });
      // Auto-sync patient data to cloud so doctor can see it immediately
      await syncToFirebase();
      console.error('✅ Patient data synced to cloud');
      setAccessCode('');
    } catch (err) {
      console.error('❌ Link error:', err);
      
      let description = 'Could not link to clinic. Please try again.';
      if (err instanceof Error) {
        if (err.message.includes('permission') || err.message.includes('PERMISSION_DENIED')) {
          description = 'Permission denied. The security rules may need updating.';
        } else if (err.message.includes('timed out')) {
          description = 'Request timed out. Check your internet connection.';
        } else if (err.message.includes('offline')) {
          description = 'You appear to be offline. Check your connection.';
        }
      }
      
      toast({ title: 'Error', description, variant: 'destructive' });
    } finally {
      setIsLinking(false);
    }
  };

  const handleAddProfile = async () => {
    if (!newName.trim()) return;
    setIsSaving(true);
    try {
      await addProfile(
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
      toast({ title: 'Profile Created', description: 'The patient profile has been successfully saved.' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Save Failed', description: 'Could not save profile to cloud.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddMed = async () => {
    if (!newMed.trim()) return;
    setIsSaving(true);
    try {
      await addMedication(newMed.trim());
      setNewMed('');
      toast({ title: 'Medication Added' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Failed to add medication', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveMed = async (med: string) => {
    try {
      await removeMedication(med);
      toast({ title: 'Medication Removed' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Failed to remove medication', variant: 'destructive' });
    }
  };

  const handleDeleteProfile = async (id: string) => {
    try {
      await deleteProfile(id);
      toast({ title: 'Profile Deleted' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Failed to delete profile', variant: 'destructive' });
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await syncToFirebase();
      toast({ title: 'Sync Completed', description: 'All patient profiles and sessions are now backed up in the cloud.' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Sync Failed', description: 'Could not sync profiles to cloud. Check connection.', variant: 'destructive' });
    } finally {
      setIsSyncing(false);
    }
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
              
              {/* Cloud Sync Status Card */}
              {user && (
                <Card className="border-blue-100 bg-blue-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2 text-blue-900">
                      <CloudLightning className="h-5 w-5 text-blue-600" />
                      Cloud Synchronization
                    </CardTitle>
                    <CardDescription className="text-blue-800">
                      Your profiles and TENS sessions are securely linked to your account ({user.email}).
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={handleManualSync}
                      disabled={isSyncing}
                      variant="outline" 
                      className="w-full bg-white border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl flex items-center justify-center gap-2"
                    >
                      {isSyncing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Syncing with Cloud...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4" />
                          Sync to Cloud Now
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Link to Clinic Card */}
              {user && (
                checkingLink ? (
                  <Card className="border-slate-100">
                    <CardContent className="flex items-center justify-center py-6">
                      <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                    </CardContent>
                  </Card>
                ) : linkedDoctor ? (
                  <Card className="border-emerald-200 bg-emerald-50/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2 text-emerald-900">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        Connected to Doctor
                      </CardTitle>
                      <CardDescription className="text-emerald-800">
                        Your therapy data is being shared with your doctor.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="bg-white rounded-xl p-3 border border-emerald-200">
                        <p className="font-semibold text-slate-800">{linkedDoctor.name}</p>
                        {linkedDoctor.specialty && (
                          <p className="text-sm text-slate-500">{linkedDoctor.specialty}</p>
                        )}
                        {linkedDoctor.email && (
                          <p className="text-sm text-slate-400 mt-1">{linkedDoctor.email}</p>
                        )}
                      </div>
                      <Button
                        onClick={handleUnlinkDoctor}
                        variant="outline"
                        className="w-full border-red-200 text-red-600 hover:bg-red-50 rounded-xl flex items-center justify-center gap-2"
                      >
                        <Unlink className="h-4 w-4" />
                        Unlink from Doctor
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-indigo-100 bg-indigo-50/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2 text-indigo-900">
                        <Link2 className="h-5 w-5 text-indigo-600" />
                        Link to Doctor
                      </CardTitle>
                      <CardDescription className="text-indigo-800">
                        Enter the 6-digit access code provided by your clinic to enable live therapy monitoring and video consultations.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          placeholder="Enter 6-digit code..."
                          value={accessCode}
                          onChange={e => setAccessCode(e.target.value)}
                          maxLength={6}
                          onKeyDown={e => e.key === 'Enter' && handleLinkClinic()}
                          className="flex-1 border rounded-lg px-3 py-2 text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                          disabled={isLinking}
                        />
                        <Button
                          onClick={handleLinkClinic}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm w-24"
                          disabled={isLinking || accessCode.length < 6}
                        >
                          {isLinking ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Link'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              )}

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
                    disabled={isSaving}
                  />
                  <input
                    placeholder="Primary condition (e.g. Lower Back Pain)"
                    value={newCondition}
                    onChange={e => setNewCondition(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    disabled={isSaving}
                  />
                  <input
                    placeholder="Age"
                    type="number"
                    value={newAge}
                    onChange={e => setNewAge(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    disabled={isSaving}
                  />
                  <input
                    placeholder="Date of Birth"
                    type="date"
                    value={newDOB}
                    onChange={e => setNewDOB(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    disabled={isSaving}
                    style={{ colorScheme: 'light' }}
                  />
                  <input
                    placeholder="Supervising Physician"
                    value={newPhysician}
                    onChange={e => setNewPhysician(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    disabled={isSaving}
                  />
                  <Button
                    onClick={handleAddProfile}
                    disabled={!newName.trim() || isSaving}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving Profile...
                      </>
                    ) : (
                      'Add Profile'
                    )}
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
                          className="text-red-400 hover:text-red-600 font-medium"
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
                                handleDeleteProfile(profile.id);
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
                            onClick={() => handleRemoveMed(med)}
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
                        disabled={isSaving}
                      />
                      <Button
                        onClick={handleAddMed}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm"
                        disabled={isSaving}
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
