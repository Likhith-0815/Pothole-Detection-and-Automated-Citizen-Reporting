import React, { useState } from 'react';
import { Incident, FleetCrew } from '../types';
import { GISMapComponent } from './GISMapComponent';
import { 
  Filter, 
  MapPin, 
  AlertTriangle, 
  Search, 
  Layers, 
  ChevronRight, 
  Eye, 
  Truck,
  ShieldAlert
} from 'lucide-react';

interface GISDashboardProps {
  incidents: Incident[];
  crews: FleetCrew[];
  onSelectIncident: (incident: Incident) => void;
  onDispatchCrew: (incidentId: string) => void;
}

export const GISDashboard: React.FC<GISDashboardProps> = ({
  incidents,
  crews,
  onSelectIncident,
  onDispatchCrew
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedWard, setSelectedWard] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showMap, setShowMap] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(incidents[0] || null);

  const filteredIncidents = incidents.filter(i => {
    const matchesSeverity = selectedSeverity === 'ALL' || i.severity === selectedSeverity;
    const matchesWard = selectedWard === 'ALL' || i.ward.includes(selectedWard);
    const matchesSearch = i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          i.locationName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesWard && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Filter Controls */}
      <div className="p-5 rounded-2xl bg-[#0F1F44] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <MapPin className="w-6 h-6 text-[#00D9FF]" />
            Visakhapatnam Municipal GIS Intelligence
          </h1>
          <p className="text-xs text-[#AAB6D4] mt-0.5">
            Real-time geospatial road condition mapping across GVMC Wards 01-100
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          
          {/* Search Box */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search location or ward..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#13294B] border border-white/10 text-white focus:outline-none focus:border-[#00D9FF]"
            />
          </div>

          {/* Severity Filter */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#13294B] border border-white/10 text-white focus:outline-none focus:border-[#00D9FF]"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Ward Filter */}
          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#13294B] border border-white/10 text-white focus:outline-none focus:border-[#00D9FF]"
          >
            <option value="ALL">All Wards</option>
            <option value="Beach Road">Ward 15 - Beach Rd</option>
            <option value="Siripuram">Ward 18 - Siripuram</option>
            <option value="MVP Colony">Ward 22 - MVP</option>
            <option value="Gajuwaka">Ward 58 - Gajuwaka</option>
            <option value="NAD Junction">Ward 34 - NAD</option>
          </select>

          {/* Heatmap Toggle */}
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-3 py-1.5 rounded-lg font-bold border transition-colors ${
              showHeatmap 
                ? 'bg-[#00D9FF]/20 text-[#00D9FF] border-[#00D9FF]/40' 
                : 'bg-[#13294B] text-[#AAB6D4] border-white/10'
            }`}
          >
            Heatmap Layer
          </button>

          {/* Map Visibility Toggle */}
          <button
            onClick={() => setShowMap(!showMap)}
            className={`px-3 py-1.5 rounded-lg font-bold border transition-colors ${
              showMap 
                ? 'bg-amber-400/20 text-amber-400 border-amber-400/40 hover:bg-amber-400/35' 
                : 'bg-[#00D9FF]/20 text-[#00D9FF] border-[#00D9FF]/40 hover:bg-[#00D9FF]/30'
            }`}
          >
            {showMap ? 'Hide GIS Map' : 'Show GIS Map'}
          </button>

        </div>
      </div>

      {/* MAP & SIDEBAR SPLIT LAYOUT */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* MAP CONTAINER (2 COLS) */}
        {showMap && (
          <div className="lg:col-span-2 space-y-4">
            <GISMapComponent
              incidents={filteredIncidents}
              crews={crews}
              selectedIncidentId={selectedIncident?.id}
              onSelectIncident={(inc) => {
                setSelectedIncident(inc);
                onSelectIncident(inc);
              }}
              onCloseIncident={() => setSelectedIncident(null)}
              onCloseMap={() => setShowMap(false)}
              showHeatmap={showHeatmap}
              height="560px"
            />
          </div>
        )}

        {/* INCIDENT DETAILS SIDEBAR (1 COL OR 3 COLS) */}
        <div className={showMap ? "space-y-4" : "lg:col-span-3 space-y-4"}>
          {!showMap && (
            <div 
              onClick={() => setShowMap(true)}
              className="p-6 rounded-2xl border-2 border-dashed border-[#00D9FF]/20 bg-[#13294B]/40 hover:bg-[#13294B]/70 cursor-pointer text-center space-y-2 transition-all group hover:border-[#00D9FF]/50"
            >
              <div className="mx-auto w-10 h-10 rounded-full bg-[#00D9FF]/10 text-[#00D9FF] flex items-center justify-center group-hover:scale-110 transition-transform">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white">Interactive GIS Map is hidden</h4>
                <p className="text-xs text-[#AAB6D4]">Click here or use the toolbar above to restore the real-time map interface.</p>
              </div>
            </div>
          )}

          <div className="p-4 rounded-xl bg-[#13294B] border border-white/10 flex items-center justify-between">
            <span className="font-bold text-xs text-white uppercase tracking-wider">
              Filtered Defect List ({filteredIncidents.length})
            </span>
            <span className="text-[10px] text-[#00D9FF] font-mono">Google Maps Geotagged</span>
          </div>

          <div className={showMap ? "space-y-3 max-h-[500px] overflow-y-auto pr-1" : "grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[700px] overflow-y-auto pr-1"}>
            {filteredIncidents.map((inc) => {
              const isSelected = selectedIncident?.id === inc.id;
              return (
                <div
                  key={inc.id}
                  onClick={() => {
                    setSelectedIncident(inc);
                    onSelectIncident(inc);
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0F1F44] border-[#00D9FF] shadow-lg shadow-[#00D9FF]/10'
                      : 'bg-[#13294B] border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      inc.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      inc.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {inc.severity}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[#00D9FF]">
                      Priority {inc.priorityScore}/100
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-white mb-1">{inc.title}</h4>
                  <p className="text-[11px] text-[#AAB6D4] mb-2">{inc.locationName}</p>

                  <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-400 pt-1 border-t border-white/5">
                    <div>Depth: <span className="text-white font-semibold">{inc.estimatedDepthCm}cm</span></div>
                    <div>Est Cost: <span className="text-emerald-400 font-semibold">₹{inc.estimatedCostINR.toLocaleString()}</span></div>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                    <span className="text-[10px] text-gray-400">Status: <strong className="text-white">{inc.status}</strong></span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDispatchCrew(inc.id);
                      }}
                      className="px-2.5 py-1 rounded bg-[#3B82F6] hover:bg-[#00D9FF] text-white hover:text-slate-950 text-[10px] font-bold transition-colors"
                    >
                      Dispatch
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
