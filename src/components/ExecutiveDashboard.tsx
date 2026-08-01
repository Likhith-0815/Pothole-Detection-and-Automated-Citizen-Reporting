import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  ShieldAlert, 
  Sparkles, 
  Truck, 
  Layers, 
  RefreshCw, 
  ArrowUpRight, 
  Zap, 
  ChevronRight,
  PieChart,
  MapPin,
  Building
} from 'lucide-react';
import { Incident, FleetCrew, WardBudget, DailyBrief, NotificationItem } from '../types';
import { GISMapComponent } from './GISMapComponent';

interface ExecutiveDashboardProps {
  incidents: Incident[];
  crews: FleetCrew[];
  budgets: WardBudget[];
  dailyBrief: DailyBrief;
  notifications: NotificationItem[];
  onOpenDemo: () => void;
  onSelectIncident: (incident: Incident) => void;
  onNavigateTab: (tab: string) => void;
  onRefreshDailyBrief: () => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  incidents,
  crews,
  budgets,
  dailyBrief,
  notifications,
  onOpenDemo,
  onSelectIncident,
  onNavigateTab,
  onRefreshDailyBrief
}) => {
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const totalIncidents = incidents.length;
  const criticalCount = incidents.filter(i => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length;
  const resolvedCount = incidents.filter(i => i.status === 'RESOLVED').length;
  const dispatchedCount = incidents.filter(i => i.status === 'DISPATCHED' || i.status === 'IN_REPAIR').length;

  const totalSpentINR = budgets.reduce((sum, b) => sum + b.spentINR, 0);
  const totalAllocatedINR = budgets.reduce((sum, b) => sum + b.allocatedINR, 0);
  const budgetUtilization = Math.round((totalSpentINR / totalAllocatedINR) * 100);

  const handleRefreshBrief = async () => {
    setIsRefreshing(true);
    await onRefreshDailyBrief();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="space-y-6 pb-12 font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* TOP MUNICIPAL EXECUTIVE BANNER */}
      <div className="p-6 rounded-2xl bg-[#0A2540] text-white shadow-xl relative overflow-hidden border-2 border-amber-500/30">
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-blue-500/10 to-transparent pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
                GVMC Municipal Command Center • 98 Wards Live
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase">
              Visakhapatnam Road Defect & Municipal Services Dashboard
            </h1>
            <p className="text-xs text-slate-200 mt-1">
              Greater Visakhapatnam Municipal Corporation (GVMC) • Zonal Infrastructure Intelligence & Fleet Ops
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenDemo}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Zap className="w-4 h-4 fill-current animate-bounce" />
              Run 5-Sec Demo
            </button>
            <button
              onClick={() => onNavigateTab('upload')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-all flex items-center gap-1.5"
            >
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              New AI Defect Report
            </button>
          </div>
        </div>

        {/* Executive Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-6 pt-4 border-t border-white/10 text-xs">
          <div>
            <span className="text-slate-300 text-[10px] uppercase font-mono font-bold">Roads Operational</span>
            <p className="text-base font-extrabold text-emerald-400">94.2%</p>
          </div>
          <div>
            <span className="text-slate-300 text-[10px] uppercase font-mono font-bold">Active Incidents</span>
            <p className="text-base font-extrabold text-white">{totalIncidents - resolvedCount}</p>
          </div>
          <div>
            <span className="text-slate-300 text-[10px] uppercase font-mono font-bold">Critical Threats</span>
            <p className="text-base font-extrabold text-red-400">{criticalCount}</p>
          </div>
          <div>
            <span className="text-slate-300 text-[10px] uppercase font-mono font-bold">Crews En Route</span>
            <p className="text-base font-extrabold text-amber-300">{dispatchedCount}</p>
          </div>
          <div>
            <span className="text-slate-300 text-[10px] uppercase font-mono font-bold">Average SLA</span>
            <p className="text-base font-extrabold text-blue-300">3.8 Hrs</p>
          </div>
          <div>
            <span className="text-slate-300 text-[10px] uppercase font-mono font-bold">AI Vision Confidence</span>
            <p className="text-base font-extrabold text-emerald-300">93.8%</p>
          </div>
        </div>
      </div>

      {/* KPI CARDS GRID (Light Mode) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Critical Hazards */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-red-700 uppercase tracking-wider">Critical Road Hazards</span>
            <div className="p-2 rounded-xl bg-red-50 text-red-700 border border-red-200">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{criticalCount}</div>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <span className="text-red-700 font-bold">Immediate Dispatch</span> • Beach Rd & Gajuwaka
          </p>
        </div>

        {/* KPI 2: Resolved Today */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider">Resolved Repairs</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{resolvedCount}</div>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <span className="text-emerald-700 font-bold">100% Verified</span> via Post-Patch Vision AI
          </p>
        </div>

        {/* KPI 3: Budget Utilization */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-blue-900 uppercase tracking-wider">Ward Budget Used</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-900 border border-blue-200">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{budgetUtilization}%</div>
          <p className="text-[11px] text-slate-500 mt-2">
            ₹{(totalSpentINR / 100000).toFixed(1)}L of ₹{(totalAllocatedINR / 100000).toFixed(1)}L Allocated
          </p>
        </div>

        {/* KPI 4: Active Crews */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-amber-800 uppercase tracking-wider">GVMC Fleet Squads</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{crews.length}</div>
          <p className="text-[11px] text-slate-500 mt-2">
            {crews.filter(c => c.status === 'AVAILABLE').length} Available • {crews.filter(c => c.status !== 'AVAILABLE').length} Deployed
          </p>
        </div>

      </div>

      {/* MAIN DASHBOARD CONTENT GRID */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* LEFT 2 COLS: GIS MAP & AI BRIEF */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* GIS MAP CONTAINER */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-[#0A2540] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-700" />
                  Visakhapatnam OpenStreetMap GIS Command Layer
                </h3>
                <p className="text-xs text-slate-500">Live Defect Heatmap & Fleet Squad Tracking Across 98 Wards</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowHeatmap(!showHeatmap)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors ${
                    showHeatmap 
                      ? 'bg-blue-100 text-blue-900 border-blue-300' 
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  Heatmap: {showHeatmap ? 'ON' : 'OFF'}
                </button>

                <button
                  onClick={() => onNavigateTab('gis')}
                  className="px-3 py-1 rounded-xl bg-[#0A2540] hover:bg-[#1E3A8A] text-white text-xs font-bold transition-colors flex items-center gap-1"
                >
                  Full GIS View <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Embedded GIS Map */}
            <GISMapComponent
              incidents={incidents}
              crews={crews}
              onSelectIncident={onSelectIncident}
              showHeatmap={showHeatmap}
              height="380px"
            />
          </div>

          {/* AI DAILY BRIEF EXECUTIVE SUMMARY */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#0A2540]">AI Executive Operational Brief</h3>
                  <p className="text-[11px] text-slate-500 font-mono">Generated by Gemini Multimodal Reasoning Engine</p>
                </div>
              </div>

              <button
                onClick={handleRefreshBrief}
                disabled={isRefreshing}
                className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:text-blue-900 hover:bg-slate-100 transition-all"
                title="Generate Fresh AI Brief"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-700' : ''}`} />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <p className="text-xs text-slate-700 leading-relaxed font-normal">
                {dailyBrief.summary}
              </p>

              <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 text-xs">
                <div>
                  <span className="font-bold text-red-700 block mb-1">High Risk Wards:</span>
                  <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5">
                    {dailyBrief.highRiskWards.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="font-bold text-blue-900 block mb-1">Recommended Actions:</span>
                  <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5">
                    {dailyBrief.recommendedActions.map((a, idx) => (
                      <li key={idx}>{a}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COL: FLEET STATUS & RECENT INCIDENTS */}
        <div className="space-y-6">
          
          {/* FLEET SQUAD STATUS PANEL */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-[#0A2540] flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-700" />
                GVMC Fleet Squads
              </h3>
              <button
                onClick={() => onNavigateTab('fleet')}
                className="text-xs text-blue-700 hover:underline font-bold"
              >
                Manage All
              </button>
            </div>

            <div className="space-y-3">
              {crews.slice(0, 3).map((crew) => (
                <div key={crew.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{crew.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      crew.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-900' : 'bg-blue-100 text-blue-900'
                    }`}>
                      {crew.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">{crew.currentLocation}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-200">
                    <span>Ward: {crew.assignedWard.split('-')[1] || crew.assignedWard}</span>
                    {crew.etaMinutes && <span className="text-blue-700 font-bold">ETA: {crew.etaMinutes}m</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RECENT INCIDENTS FEED */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-[#0A2540] flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                Recent Defect Reports
              </h3>
              <button
                onClick={() => onNavigateTab('gis')}
                className="text-xs text-blue-700 hover:underline font-bold"
              >
                View Map
              </button>
            </div>

            <div className="space-y-2.5">
              {incidents.slice(0, 4).map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => onSelectIncident(inc)}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-400 cursor-pointer transition-all space-y-1 group"
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      inc.severity === 'CRITICAL' ? 'bg-red-100 text-red-900' :
                      inc.severity === 'HIGH' ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'
                    }`}>
                      {inc.severity}
                    </span>
                    <span className="text-[10px] font-mono text-blue-700 font-bold group-hover:underline">
                      Priority {inc.priorityScore}/100
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 truncate">{inc.title}</h4>
                  <p className="text-[10px] text-slate-500">{inc.locationName}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
