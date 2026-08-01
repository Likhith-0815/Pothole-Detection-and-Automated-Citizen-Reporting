import React from 'react';
import { FleetCrew, Incident } from '../types';
import { Truck, ShieldCheck, MapPin, Wrench, Clock, Phone, AlertTriangle } from 'lucide-react';

interface FleetPanelProps {
  crews: FleetCrew[];
  incidents: Incident[];
  onDispatchToIncident: (crewId: string, incidentId: string) => void;
}

export const FleetPanel: React.FC<FleetPanelProps> = ({
  crews,
  incidents,
  onDispatchToIncident
}) => {
  const unassignedIncidents = incidents.filter(i => i.status !== 'RESOLVED' && i.status !== 'IN_REPAIR');

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[#0F1F44] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Truck className="w-6 h-6 text-[#00D9FF]" />
            GVMC Fleet Optimizer & Crew Dispatch
          </h1>
          <p className="text-xs text-[#AAB6D4] mt-0.5">
            Real-time telematics, equipment inventory, and automated crew assignment across 4 GVMC Repair Divisions
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-[#13294B] border border-emerald-500/30 text-emerald-400 font-bold">
            {crews.filter(c => c.status === 'AVAILABLE').length} Available Squads
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#13294B] border border-blue-500/30 text-blue-400 font-bold">
            {crews.filter(c => c.status !== 'AVAILABLE').length} Deployed En Route
          </div>
        </div>
      </div>

      {/* CREW CARDS GRID */}
      <div className="grid md:grid-cols-2 gap-6">
        {crews.map((crew) => {
          const activeInc = incidents.find(i => i.id === crew.activeIncidentId);

          return (
            <div key={crew.id} className="p-5 rounded-2xl bg-[#13294B] border border-white/10 shadow-2xl space-y-4">
              
              {/* Header Row */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#00D9FF]">{crew.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      crew.status === 'AVAILABLE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      crew.status === 'EN_ROUTE' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    }`}>
                      {crew.status}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base text-white mt-1">{crew.name}</h3>
                </div>

                <div className="text-right text-xs">
                  <span className="text-[#AAB6D4] block text-[10px]">Jobs Completed Today</span>
                  <span className="font-bold text-white text-base">{crew.jobsCompletedToday}</span>
                </div>
              </div>

              {/* Leader & Contact */}
              <div className="grid grid-cols-2 gap-2 text-xs text-[#AAB6D4]">
                <div>Leader: <strong className="text-white">{crew.leader}</strong></div>
                <div>Contact: <strong className="text-white">{crew.contact}</strong></div>
                <div className="col-span-2">Vehicle: <strong className="text-white">{crew.vehicleType}</strong></div>
                <div className="col-span-2">Current Location: <strong className="text-white">{crew.currentLocation}</strong></div>
              </div>

              {/* Equipment Tags */}
              <div>
                <span className="text-[10px] uppercase font-mono text-[#00D9FF] block mb-1">Onboard Equipment</span>
                <div className="flex flex-wrap gap-1">
                  {crew.equipment.map((eq, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-[#06132A] text-[#AAB6D4] text-[10px] border border-white/5">
                      {eq}
                    </span>
                  ))}
                </div>
              </div>

              {/* Active Incident Assignment */}
              {activeInc ? (
                <div className="p-3 rounded-xl bg-[#0F1F44] border border-blue-500/30 text-xs space-y-1">
                  <span className="text-[10px] uppercase font-mono text-blue-400 font-bold block">Assigned Incident</span>
                  <p className="font-bold text-white">{activeInc.title}</p>
                  <p className="text-[10px] text-gray-300">{activeInc.locationName} • ETA ~{crew.etaMinutes} mins</p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-[#0F1F44] border border-white/5 text-xs text-[#AAB6D4] flex items-center justify-between">
                  <span>No active incident assigned. Ready for dispatch.</span>
                  
                  {unassignedIncidents.length > 0 && (
                    <select
                      onChange={(e) => {
                        if (e.target.value) onDispatchToIncident(crew.id, e.target.value);
                      }}
                      className="px-2 py-1 rounded bg-[#3B82F6] text-white text-[11px] font-bold focus:outline-none"
                    >
                      <option value="">Dispatch to Defect...</option>
                      {unassignedIncidents.map(inc => (
                        <option key={inc.id} value={inc.id}>
                          {inc.severity}: {inc.locationName}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
};
