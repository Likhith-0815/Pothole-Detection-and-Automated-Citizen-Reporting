import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Zap, 
  CheckCircle2, 
  Sparkles, 
  Cpu, 
  MapPin, 
  Truck, 
  FileText, 
  X,
  Bell,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

interface DemoEngineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteDemo: () => void;
}

export const DemoEngineModal: React.FC<DemoEngineModalProps> = ({
  isOpen,
  onClose,
  onCompleteDemo
}) => {
  const [step, setStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const DEMO_STEPS = [
    { title: '1. Citizen Report Triggered', desc: 'Incoming photo from Beach Road RK Curve (Ward 15)', icon: Bell, color: 'text-amber-400' },
    { title: '2. Multimodal Vision AI Sweep', desc: 'Measuring surface area (3.4 m²) & depth (12.5 cm)', icon: Cpu, color: 'text-[#00D9FF]' },
    { title: '3. Feature Extraction Pipeline', desc: 'Running YOLOv8 bounding box & edge detection', icon: Sparkles, color: 'text-[#8B5CF6]' },
    { title: '4. Priority Score Algorithm', desc: 'Calculated Priority 94/100 (CRITICAL HAZARD)', icon: TrendingUp, color: 'text-[#EF4444]' },
    { title: '5. OpenStreetMap Geotag Drop', desc: 'Pulsing marker placed at [17.7142, 83.3238]', icon: MapPin, color: 'text-cyan-300' },
    { title: '6. Fleet Squad Dispatched', desc: 'GVMC Squad Alpha assigned (ETA 14 mins)', icon: Truck, color: 'text-[#3B82F6]' },
    { title: '7. Ward Budget Auto-Estimate', desc: 'Pre-approved work order issued for ₹42,500', icon: ShieldCheck, color: 'text-[#22C55E]' },
    { title: '8. Executive Report Generated', desc: 'Dashboard & Municipal PDF synchronized', icon: FileText, color: 'text-[#00D9FF]' }
  ];

  useEffect(() => {
    if (!isOpen) {
      setStep(0);
      setIsRunning(false);
      return;
    }

    setIsRunning(true);
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < DEMO_STEPS.length) {
        setStep(currentStep);
      } else {
        clearInterval(interval);
        setIsRunning(false);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        setTimeout(() => {
          onCompleteDemo();
        }, 1200);
      }
    }, 600); // Step every 600ms = total ~5s

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#13294B] border border-[#00D9FF]/50 shadow-2xl p-6 space-y-6 text-white overflow-hidden">
        
        {/* Glow Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00D9FF] to-[#8B5CF6] text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-[#00D9FF]/20">
              <Zap className="w-5 h-5 fill-current animate-bounce" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">5-Second Live Scripted Demo</h2>
              <p className="text-[11px] text-[#00D9FF] font-mono">Automated End-to-End GVMC AI Workflow</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#0F1F44] hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-[#AAB6D4]">Execution Progress</span>
            <span className="text-[#00D9FF] font-bold">{Math.round(((step + 1) / DEMO_STEPS.length) * 100)}%</span>
          </div>
          <div className="w-full bg-[#06132A] h-2.5 rounded-full overflow-hidden border border-white/10">
            <div 
              className="bg-gradient-to-r from-[#00D9FF] via-[#3B82F6] to-[#8B5CF6] h-full transition-all duration-300 shadow-[0_0_12px_#00D9FF]"
              style={{ width: `${((step + 1) / DEMO_STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Sequence Timeline */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {DEMO_STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isDone = idx < step;
            const isCurrent = idx === step;

            return (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                  isCurrent 
                    ? 'bg-[#0F1F44] border-[#00D9FF] shadow-md shadow-[#00D9FF]/20 scale-[1.02]' 
                    : isDone 
                    ? 'bg-[#06132A]/60 border-white/5 opacity-70' 
                    : 'bg-[#13294B] border-white/5 opacity-30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg bg-black/40 ${s.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{s.title}</h4>
                    <p className="text-[10px] text-[#AAB6D4]">{s.desc}</p>
                  </div>
                </div>

                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                ) : isCurrent ? (
                  <span className="w-2 h-2 rounded-full bg-[#00D9FF] animate-ping" />
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center text-[10px] font-mono text-[#AAB6D4] pt-2 border-t border-white/10">
          HackYatra AP State Hackathon 2026 • Team Allide Demonstration Engine
        </div>

      </div>
    </div>
  );
};
