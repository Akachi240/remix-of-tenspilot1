import React, { useState, useRef } from 'react';
import { jsPDF } from "jspdf";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Download, Image as ImageIcon, Video, X, FileText, Send, User, Pill } from 'lucide-react';
import { useProfiles } from '@/context/ProfileContext';

const UserDashboard = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { activeProfile } = useProfiles();
  const [clinicalMedia, setClinicalMedia] = useState<{ url: string; type: string }[]>([]);

  if (!activeProfile) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No profile selected. Please create one in Settings.</p>
      </div>
    );
  }

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newMedia = Array.from(files).map(file => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' : 'image'
    }));
    
    setClinicalMedia(prev => [...prev, ...newMedia]);
  };

  const removeMedia = (index: number) => {
    setClinicalMedia(prev => prev.filter((_, i) => i !== index));
  };

  const calculateAveragePainReduction = () => {
    if (!activeProfile?.sessionHistory || activeProfile.sessionHistory.length === 0) return 0;
    const totalReduction = activeProfile.sessionHistory.reduce((sum, log) => sum + (log.painBefore - log.painAfter), 0);
    return totalReduction / activeProfile.sessionHistory.length;
  };

  const generateReport = async () => {
    try {
      const doc = new jsPDF();
      let yPosition = 20;
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;

      // HEADER
      doc.setFontSize(22);
      doc.setTextColor(46, 111, 170);
      doc.text("TensPilot+ Clinical Report", margin, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, margin, yPosition);
      yPosition += 15;

      // PATIENT PROFILE
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("PATIENT PROFILE", margin, yPosition);
      yPosition += 8;

      doc.setFontSize(11);
      doc.setTextColor(50, 50, 50);
      doc.text(`Name: ${activeProfile.name}`, margin, yPosition);
      yPosition += 6;
      if (activeProfile.age) {
        doc.text(`Age: ${activeProfile.age} years`, margin, yPosition);
        yPosition += 6;
      }
      if (activeProfile.dateOfBirth) {
        doc.text(`Date of Birth: ${activeProfile.dateOfBirth}`, margin, yPosition);
        yPosition += 6;
      }
      if (activeProfile.supervisingPhysician) {
        doc.text(`Supervising Physician: ${activeProfile.supervisingPhysician}`, margin, yPosition);
        yPosition += 6;
      }
      yPosition += 6;

      // THERAPY OVERVIEW
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("THERAPY OVERVIEW", margin, yPosition);
      yPosition += 8;

      doc.setFontSize(11);
      const sessions = activeProfile.sessionHistory?.length || 0;
      doc.text(`Total Sessions: ${sessions}`, margin, yPosition);
      yPosition += 6;

      const avgReduction = calculateAveragePainReduction();
      doc.text(`Average Pain Reduction: ${avgReduction.toFixed(1)} points`, margin, yPosition);
      yPosition += 6;

      const totalDuration = activeProfile.sessionHistory?.reduce((sum, s) => sum + (s.parameters?.duration || 0), 0) || 0;
      doc.text(`Total Duration: ${totalDuration} minutes`, margin, yPosition);
      yPosition += 12;

      // SESSION JOURNAL
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("SESSION JOURNAL", margin, yPosition);
      yPosition += 8;

      if (activeProfile.sessionHistory && activeProfile.sessionHistory.length > 0) {
        doc.setFontSize(9);
        activeProfile.sessionHistory.forEach((session, index) => {
          if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(`Session ${index + 1}: ${session.date}`, margin, yPosition);
          yPosition += 4;
          doc.text(`Area: ${session.placement} | Pain: ${session.painBefore}/10 → ${session.painAfter}/10`, margin, yPosition);
          yPosition += 4;
          yPosition += 2;
        });
      } else {
        doc.setFontSize(9);
        doc.text("No sessions recorded.", margin, yPosition);
        yPosition += 4;
      }
      yPosition += 8;

      // MEDICATIONS
      if (activeProfile.medications && activeProfile.medications.length > 0) {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = margin;
        }
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text("MEDICATIONS", margin, yPosition);
        yPosition += 8;

        doc.setFontSize(10);
        activeProfile.medications.forEach((med, index) => {
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(`${index + 1}. ${med}`, margin, yPosition);
          yPosition += 5;
        });
      }

      doc.save(`TensPilot_Report_${activeProfile.name.replace(/\s/g, '_')}.pdf`);
      alert('PDF exported successfully!');
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Error generating PDF: ' + error);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-20 px-4 mt-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <User className="h-8 w-8 text-blue-600" />
            {activeProfile.name}
          </h2>
          <p className="text-slate-500 mt-1">{activeProfile.primaryCondition}</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={generateReport} variant="outline" className="border-blue-200 text-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Send className="h-4 w-4 mr-2" />
            Send to Doctor
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border-none shadow-md rounded-2xl">
            <CardHeader className="bg-blue-50 border-b pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-blue-900">
                <Activity className="h-5 w-5" />
                Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-slate-500 text-sm">Sessions</span>
                <span className="font-bold text-lg">{activeProfile.sessionHistory?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-slate-500 text-sm">Avg Reduction</span>
                <span className="font-bold text-lg text-green-600">{calculateAveragePainReduction().toFixed(1)} pts</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm">Medications</span>
                <span className="font-bold text-lg">{activeProfile.medications?.length || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Pill className="h-5 w-5 text-slate-400" />
                Meds
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {activeProfile.medications && activeProfile.medications.length > 0 ? (
                activeProfile.medications.slice(0, 3).map((med, i) => (
                  <div key={i} className="p-2 bg-slate-50 rounded-lg border text-xs">
                    <p className="font-bold">{med}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">None recorded</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="md:col-span-2">
          <Card className="border-none shadow-md rounded-2xl h-full">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Clinical Media
              </CardTitle>
              <CardDescription>
                Upload pad placement photos or motor threshold videos.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-blue-200 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleMediaUpload}
                  className="hidden"
                />
                <div className="flex gap-4 mb-3 text-blue-500">
                  <ImageIcon className="h-8 w-8" />
                  <Video className="h-8 w-8" />
                </div>
                <p className="font-bold text-blue-900">Tap to upload</p>
              </div>

              {clinicalMedia.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-bold">Evidence ({clinicalMedia.length})</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {clinicalMedia.map((file, index) => (
                      <div key={index} className="relative group rounded-lg overflow-hidden border aspect-square bg-slate-50">
                        {file.type === 'image' ? (
                          <img src={file.url} alt="Evidence" className="w-full h-full object-cover" />
                        ) : (
                          <video src={file.url} className="w-full h-full object-cover" controls />
                        )}
                        <button
                          onClick={() => removeMedia(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;