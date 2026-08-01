import React from 'react';
import { Incident, FleetCrew } from '../types';
import { 
  X, 
  MapPin, 
  AlertTriangle, 
  ShieldCheck, 
  Truck, 
  Clock, 
  DollarSign, 
  CheckCircle2,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';

interface IncidentDetailsModalProps {
  incident: Incident | null;
  onClose: () => void;
  onDispatch: (incidentId: string) => void;
  crews: FleetCrew[];
}

export const IncidentDetailsModal: React.FC<IncidentDetailsModalProps> = ({
  incident,
  onClose,
  onDispatch,
  crews
}) => {
  if (!incident) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-3xl rounded-2xl bg-[#13294B] border border-white/15 shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto text-white">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-[#0F1F44] hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2.5 py-0.5 rounded text-xs font-extrabold ${
              incident.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
              incident.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
              'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            }`}>
              {incident.severity} DEFECT
            </span>
            <span className="text-xs font-mono text-[#00D9FF]">ID: {incident.id}</span>
          </div>
          <h2 className="text-xl font-extrabold text-white">{incident.title}</h2>
          <p className="text-xs text-[#AAB6D4] mt-0.5 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#00D9FF]" />
            {incident.locationName} • Coordinates [{incident.coordinates[0]}, {incident.coordinates[1]}]
          </p>
        </div>

        {/* Photos & Bounding Box */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#AAB6D4]">Original Citizen / AI Photo</span>
            <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#06132A] h-48">
              <img src={incident.imageUrl} alt="Defect" className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#00D9FF]">YOLOv8 AI Feature Detection</span>
            <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#06132A] h-48">
              <img src={incident.imageUrl} alt="AI Overlay" className="w-full h-full object-cover" />
              <div 
                className="absolute border-2 border-[#EF4444] bg-[#EF4444]/20 shadow-[0_0_15px_#EF4444]"
                style={{
                  left: `${incident.boundingBox?.x || 20}%`,
                  top: `${incident.boundingBox?.y || 25}%`,
                  width: `${incident.boundingBox?.width || 55}%`,
                  height: `${incident.boundingBox?.height || 45}%`
                }}
              >
                <span className="absolute -top-5 left-0 bg-[#EF4444] text-white text-[8px] font-bold font-mono px-1 rounded">
                  Pothole ({incident.confidence}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Core AI Parameters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#0F1F44] border border-white/5">
            <span className="text-[10px] text-[#AAB6D4] uppercase font-mono block">Priority Score</span>
            <span className="text-xl font-black text-[#00D9FF]">{incident.priorityScore}/100</span>
          </div>

          <div className="p-3 rounded-xl bg-[#0F1F44] border border-white/5">
            <span className="text-[10px] text-[#AAB6D4] uppercase font-mono block">Surface Area</span>
            <span className="text-xl font-black text-white">{incident.surfaceAreaM2} m²</span>
          </div>

          <div className="p-3 rounded-xl bg-[#0F1F44] border border-white/5">
            <span className="text-[10px] text-[#AAB6D4] uppercase font-mono block">Depth Estimate</span>
            <span className="text-xl font-black text-amber-400">{incident.estimatedDepthCm} cm</span>
          </div>

          <div className="p-3 rounded-xl bg-[#0F1F44] border border-white/5">
            <span className="text-[10px] text-[#AAB6D4] uppercase font-mono block">Est. Repair Cost</span>
            <span className="text-xl font-black text-[#22C55E]">₹{incident.estimatedCostINR.toLocaleString()}</span>
          </div>
        </div>

        {/* Explainability Rationale */}
        <div className="p-4 rounded-xl bg-[#0F1F44] border border-white/10 text-xs space-y-2">
          <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
            <Sparkles className="w-4 h-4 text-[#00D9FF]" />
            Explainable AI Priority Decision Rules
          </h4>
          <p className="text-[11px] text-[#AAB6D4] leading-relaxed">
            {incident.explainability.hazardRisk}. Depth factor ({incident.explainability.depthFactor}) evaluated on {incident.explainability.roadType} with {incident.explainability.trafficDensity} traffic density.
          </p>
        </div>

        {/* Crew & Status Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
          <div>
            <span className="text-xs text-[#AAB6D4] block">Assigned Squad:</span>
            <span className="font-bold text-white text-xs flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-[#00D9FF]" />
              {incident.assignedCrewName || 'Unassigned'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onDispatch(incident.id);
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00D9FF] to-[#3B82F6] text-[#06132A] font-extrabold text-xs hover:scale-105 transition-all flex items-center gap-1.5"
            >
              <Truck className="w-4 h-4" />
              Dispatch Fleet Squad
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
