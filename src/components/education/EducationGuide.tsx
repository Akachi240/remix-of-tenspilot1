import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Zap, Target, BookOpen, Shield, ChevronRight, ArrowLeft, Activity } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const BODY_REGIONS = [
  { id: 'lower-back', label: 'Lower Back', cx: 100, cy: 185, rx: 28, ry: 18 },
  { id: 'knee', label: 'Knee (Left)', cx: 75, cy: 270, rx: 18, ry: 20 },
  { id: 'shoulder', label: 'Shoulder (Left)', cx: 52, cy: 90, rx: 18, ry: 18 },
  { id: 'wrist-hand', label: 'Wrist (Right)', cx: 162, cy: 165, rx: 15, ry: 12 },
  { id: 'foot-ankle', label: 'Foot (Left)', cx: 75, cy: 355, rx: 20, ry: 15 },
  { id: 'hip', label: 'Hip (Left)', cx: 72, cy: 205, rx: 20, ry: 18 },
];

type TopicKey = 'gate-control' | 'electrode' | 'modes' | 'safety';

const TOPICS: { key: TopicKey; icon: React.ElementType; title: string; desc: string }[] = [
  { key: 'gate-control', icon: Zap, title: 'Gate Control Theory', desc: 'How TENS blocks pain signals' },
  { key: 'electrode', icon: Target, title: 'Electrode Placement', desc: 'Where to place pads for each area' },
  { key: 'modes', icon: Activity, title: 'TENS Modes', desc: 'High-frequency vs low-frequency' },
  { key: 'safety', icon: Shield, title: 'Safety Guidelines', desc: 'Contraindications & best practices' },
];

const EducationGuide = () => {
  const [activeTab, setActiveTab] = useState('gate-control');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const isMobile = useIsMobile();

  // Mobile topic drill-down
  const [topic, setTopic] = useState<TopicKey | null>(null);

  const handleRegionClick = (id: string) => {
    setSelectedRegion(id);
    const el = cardRefs.current[id];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // ─── Content sections ───

  const GateControlContent = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--ink)' }}>
        <Zap className="h-5 w-5" style={{ color: 'var(--accent-hex)' }} />
        How TENS Blocks Pain — Gate Control Theory
      </h3>
      <p className="text-muted-foreground">
        The Gate Control Theory, proposed by Melzack and Wall in 1965, explains how TENS therapy works. Pain signals travel from the body through nerve "gates" in the spinal cord to the brain. TENS stimulates large-diameter nerve fibers (Aβ fibers), which "close" these gates and prevent smaller pain-carrying fibers (C-fibers) from transmitting their signals to the brain.
      </p>

      <div className="rounded-lg p-4 sm:p-6 space-y-4" style={{ background: 'rgba(74,143,196,0.06)', border: '1px solid rgba(74,143,196,0.2)' }}>
        <h4 className="font-medium" style={{ color: 'var(--ink)' }}>The Pain Gate Mechanism</h4>
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="text-center p-2 sm:p-4 bg-white rounded-lg border">
            <div className="text-xl sm:text-2xl mb-2">⚡</div>
            <h5 className="font-medium text-xs sm:text-sm">TENS Stimulation</h5>
            <p className="text-xs text-muted-foreground mt-1 hidden sm:block">Electrical impulses activate large Aβ nerve fibers</p>
          </div>
          <div className="text-center p-2 sm:p-4 bg-white rounded-lg border gate-pulse">
            <div className="text-xl sm:text-2xl mb-2">🚪</div>
            <h5 className="font-medium text-xs sm:text-sm">Gate Closes</h5>
            <p className="text-xs text-muted-foreground mt-1 hidden sm:block">Spinal cord interneurons inhibit pain signal transmission</p>
          </div>
          <div className="text-center p-2 sm:p-4 bg-white rounded-lg border">
            <div className="text-xl sm:text-2xl mb-2">🧠</div>
            <h5 className="font-medium text-xs sm:text-sm">Pain Reduced</h5>
            <p className="text-xs text-muted-foreground mt-1 hidden sm:block">Fewer pain signals reach the brain, reducing perception</p>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-6 italic">
        Melzack & Wall (1965) · Han (2004) · Sluka & Walsh (2003)
      </p>
    </div>
  );

  const ModesContent = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--ink)' }}>
        <Activity className="h-5 w-5" style={{ color: 'var(--accent-hex)' }} />
        Two Modes of Action
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-3 sm:p-4 border rounded-lg medical-card">
          <h5 className="font-medium text-sm">High-Frequency TENS (80-120 Hz)</h5>
          <p className="text-sm text-muted-foreground mt-1">Activates the gate control mechanism for rapid, short-term pain relief. Best for acute and sharp pain.</p>
        </div>
        <div className="p-3 sm:p-4 border rounded-lg medical-card">
          <h5 className="font-medium text-sm">Low-Frequency TENS (2-10 Hz)</h5>
          <p className="text-sm text-muted-foreground mt-1">Stimulates endorphin release for longer-lasting relief. Best for chronic and deep aching pain.</p>
        </div>
      </div>
    </div>
  );

  const PlacementContent = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--ink)' }}>
        <Target className="h-5 w-5" style={{ color: 'var(--accent-hex)' }} />
        Electrode Placement Guide
      </h3>

      <div>
        <p className="text-lg font-semibold mb-4">📍 Click a body region for placement guidance</p>
        <div className="border rounded-2xl p-4" style={{ background: 'rgba(74,143,196,0.06)' }}>
          <svg viewBox="0 0 200 400" width="160" className="mx-auto block">
            <ellipse cx={100} cy={40} rx={30} ry={35} fill="#e0f2fe" stroke="#0284c7" strokeWidth={1.5} />
            <rect x={65} y={75} width={70} height={120} rx={10} fill="#e0f2fe" stroke="#0284c7" strokeWidth={1.5} />
            <rect x={30} y={75} width={30} height={100} rx={15} fill="#e0f2fe" stroke="#0284c7" strokeWidth={1.5} />
            <rect x={140} y={75} width={30} height={100} rx={15} fill="#e0f2fe" stroke="#0284c7" strokeWidth={1.5} />
            <rect x={65} y={195} width={30} height={130} rx={15} fill="#e0f2fe" stroke="#0284c7" strokeWidth={1.5} />
            <rect x={105} y={195} width={30} height={130} rx={15} fill="#e0f2fe" stroke="#0284c7" strokeWidth={1.5} />

            <ellipse cx={100} cy={78} rx={18} ry={12} fill="#e5e7eb" opacity={0.5} cursor="not-allowed">
              <title>Carotid sinus — TENS contraindicated</title>
            </ellipse>

            {BODY_REGIONS.map(r => (
              <ellipse
                key={r.id}
                cx={r.cx}
                cy={r.cy}
                rx={r.rx}
                ry={r.ry}
                fill={selectedRegion === r.id ? '#0284c7' : 'transparent'}
                fillOpacity={selectedRegion === r.id ? 0.35 : 0}
                stroke={selectedRegion === r.id ? '#0284c7' : 'none'}
                strokeWidth={selectedRegion === r.id ? 2 : 0}
                cursor="pointer"
                onClick={() => handleRegionClick(r.id)}
                onMouseEnter={e => {
                  if (selectedRegion !== r.id) {
                    e.currentTarget.setAttribute('fill', '#0284c7');
                    e.currentTarget.setAttribute('fill-opacity', '0.15');
                  }
                }}
                onMouseLeave={e => {
                  if (selectedRegion !== r.id) {
                    e.currentTarget.setAttribute('fill', 'transparent');
                    e.currentTarget.setAttribute('fill-opacity', '0');
                  }
                }}
              >
                <title>{r.label}</title>
              </ellipse>
            ))}
          </svg>
        </div>
        <p className="text-xs text-red-600 text-center mt-2">
          ⚠️ Neck placement is disabled — carotid sinus stimulation is contraindicated for TENS therapy
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { id: 'lower-back', area: 'Lower Back', placement: 'Place two pairs of electrodes on either side of the spine, 2-3 inches apart, at the level of pain.', tip: 'Keep electrodes parallel to the spine.' },
          { id: 'neck', area: 'Neck', placement: 'Place electrodes on the back of the neck, on either side of the spine. Never place on the front of the throat.', tip: 'Use smaller electrodes for better contact.' },
          { id: 'knee', area: 'Knee', placement: 'Place electrodes above and below the kneecap, or on the medial and lateral sides of the joint.', tip: 'Avoid placing directly on the kneecap.' },
          { id: 'shoulder', area: 'Shoulder', placement: 'Place one electrode on the top of the shoulder and one on the back, surrounding the painful area.', tip: 'Follow the muscle fibers for best results.' },
          { id: 'wrist-hand', area: 'Wrist / Hand', placement: 'Place small electrodes on either side of the wrist or along the forearm toward the elbow.', tip: 'Use smaller pads for precise targeting.' },
          { id: 'hip', area: 'Hip', placement: 'Place electrodes around the hip joint — one on the front (anterior) and one on the side (lateral).', tip: 'Ensure electrodes are at least 1 inch apart.' },
        ].map((item) => (
          <div
            key={item.area}
            ref={el => { cardRefs.current[item.id] = el; }}
            className={`p-3 sm:p-4 border rounded-lg transition-all medical-card ${
              selectedRegion === item.id ? 'checkbox-selected' : ''
            }`}
          >
            <h5 className="font-medium" style={{ color: 'var(--ink)' }}>{item.area}</h5>
            <p className="text-sm text-muted-foreground mt-1">{item.placement}</p>
            <p className="text-xs mt-2 italic" style={{ color: 'var(--accent-hex)' }}>💡 {item.tip}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const SafetyContent = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--ink)' }}>
        <Shield className="h-5 w-5" style={{ color: 'var(--accent-hex)' }} />
        Safety Guidelines & Best Practices
      </h3>

      <div className="space-y-4">
        <div className="p-4 border-l-4 border-destructive bg-destructive/5 rounded-r-lg">
          <h5 className="font-medium text-destructive">Do NOT use TENS if you:</h5>
          <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
            <li>Have a pacemaker or implanted electrical device</li>
            <li>Have epilepsy (without medical clearance)</li>
            <li>Are in the first trimester of pregnancy</li>
            <li>Have skin irritation or open wounds at the electrode site</li>
          </ul>
        </div>

        <div className="p-4 border-l-4 rounded-r-lg" style={{ borderColor: 'var(--accent-hex)', background: 'rgba(74,143,196,0.06)' }}>
          <h5 className="font-medium" style={{ color: 'var(--ink)' }}>Best Practices</h5>
          <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
            <li>Always start at the lowest intensity and increase gradually</li>
            <li>Clean and dry the skin before applying electrodes</li>
            <li>Sessions typically last 15-45 minutes</li>
            <li>Allow at least 1 hour between sessions</li>
            <li>Replace electrode pads when they lose stickiness</li>
            <li>Never place electrodes on the front of the neck, across the chest, or on the temples</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const topicContentMap: Record<TopicKey, React.ReactNode> = {
    'gate-control': <GateControlContent />,
    'electrode': <PlacementContent />,
    'modes': <ModesContent />,
    'safety': <SafetyContent />,
  };

  // ═══════════════════════════════════════
  // MOBILE LAYOUT
  // ═══════════════════════════════════════
  if (isMobile) {
    // Detail view
    if (topic !== null) {
      const topicInfo = TOPICS.find(t => t.key === topic)!;
      return (
        <div className="space-y-4">
          <button
            onClick={() => setTopic(null)}
            className="flex items-center gap-1 text-sm font-medium"
            style={{ color: 'var(--accent-dark)' }}
          >
            <ArrowLeft className="h-4 w-4" />
            Learn
          </button>
          <div className="medical-card p-4">
            {topicContentMap[topic]}
          </div>
        </div>
      );
    }

    // Menu view
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
          Learn
        </h2>
        <div className="space-y-3">
          {TOPICS.map(t => (
            <button
              key={t.key}
              onClick={() => setTopic(t.key)}
              className="w-full medical-card p-4 flex items-center gap-3 text-left"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 icon-surface">
                <t.icon className="h-5 w-5" style={{ color: 'var(--accent-dark)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{t.title}</p>
                <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>{t.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--ink-subtle)' }} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // DESKTOP LAYOUT (unchanged)
  // ═══════════════════════════════════════
  const tabs = [
    { id: 'gate-control', label: '⚡ Gate Control' },
    { id: 'placement', label: '📍 Placement' },
    { id: 'modes', label: '🔄 Modes' },
    { id: 'safety', label: '🛡️ Safety' },
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" style={{ color: 'var(--accent-hex)' }} />
          TensPilot+ Education
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Custom Tab Bar */}
        <div className="flex border-b border-border mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 sm:px-4 sm:py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
              style={activeTab === tab.id ? { borderColor: 'var(--accent-hex)', color: 'var(--accent-dark)' } : {}}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'gate-control' && <GateControlContent />}
        {activeTab === 'placement' && <PlacementContent />}
        {activeTab === 'modes' && <ModesContent />}
        {activeTab === 'safety' && <SafetyContent />}

        <div className="mt-8 flex gap-3 justify-center">
          <Button asChild className="btn-primary">
            <Link to="/session-setup">Setup a Session</Link>
          </Button>
          <Button asChild variant="outline" className="btn-outline-ice">
            <Link to="/dashboard">View Dashboard</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EducationGuide;
