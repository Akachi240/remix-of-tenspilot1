import { PainTracker } from '@/components/patient/PainTracker';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0FDFA] to-white py-12">
      <PainTracker 
        onSuccess={() => console.warn('Pain logged!')}
      />
    </div>
  );
}