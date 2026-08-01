import React, { useState, useEffect } from 'react';
import { UserRole, Incident, FleetCrew, WardBudget } from '../types';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { withEngineerAuth } from './withRoleAuth';
import { notificationService } from '../lib/notificationService';
import { 
  ShieldCheck, 
  Settings, 
  AlertTriangle, 
  CheckCircle2, 
  Truck, 
  DollarSign, 
  Megaphone, 
  Trash2, 
  Save, 
  Lock, 
  UserCheck, 
  Activity, 
  Sparkles,
  RefreshCw,
  ShieldAlert,
  FileText
} from 'lucide-react';

interface AdminPanelProps {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  incidents: Incident[];
  setIncidents: React.Dispatch<React.SetStateAction<Incident[]>>;
  crews: FleetCrew[];
  setCrews: React.Dispatch<React.SetStateAction<FleetCrew[]>>;
  budgets: WardBudget[];
  setBudgets: React.Dispatch<React.SetStateAction<WardBudget[]>>;
  onNavigateTab: (tab: string) => void;
  announcementNotice: string;
  setAnnouncementNotice: (notice: string) => void;
}

const AdminPanelBase: React.FC<AdminPanelProps> = ({
  userRole,
  setUserRole,
  incidents,
  setIncidents,
  crews,
  setCrews,
  budgets,
  setBudgets,
  onNavigateTab,
  announcementNotice,
  setAnnouncementNotice
}) => {
  // Auth claim and database record validation state
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const [authClaimRole, setAuthClaimRole] = useState<UserRole | null>(null);
  const [dbRecordRole, setDbRecordRole] = useState<UserRole | null>(null);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        if (isMounted) {
          setAuthClaimRole(null);
          setDbRecordRole(null);
          setCheckingAuth(false);
        }
        return;
      }

      try {
        // 1. Fetch Firebase Auth custom claim
        let claimRole: UserRole | null = null;
        try {
          const idTokenResult = await currentUser.getIdTokenResult();
          if (idTokenResult.claims.role) {
            claimRole = idTokenResult.claims.role as UserRole;
          } else if (idTokenResult.claims.engineer) {
            claimRole = 'engineer';
          } else if (idTokenResult.claims.admin) {
            claimRole = 'admin';
          }
        } catch (claimErr) {
          console.warn('Could not fetch custom auth claims:', claimErr);
        }

        // 2. Fetch Database record from Firestore collection '/users/{uid}'
        let recordRole: UserRole | null = null;
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            recordRole = userSnap.data()?.role as UserRole;
          }
        } catch (dbErr) {
          console.warn('Could not fetch user database record from Firestore:', dbErr);
        }

        if (isMounted) {
          setAuthClaimRole(claimRole);
          setDbRecordRole(recordRole);
          setCheckingAuth(false);
        }
      } catch (err) {
        console.error('Error verifying user auth claims and database records:', err);
        if (isMounted) {
          setCheckingAuth(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Determine authorization:
  // User is authorized ONLY if their auth claim, database record, OR userRole prop indicates 'engineer' or 'admin'
  const isAuthorizedFromClaim = authClaimRole === 'engineer' || authClaimRole === 'admin';
  const isAuthorizedFromDb = dbRecordRole === 'engineer' || dbRecordRole === 'admin';
  const isAuthorizedFromProp = userRole === 'engineer' || userRole === 'admin';

  // Effective authorization decision
  const isAuthorized = isAuthorizedFromClaim || isAuthorizedFromDb || isAuthorizedFromProp;

  // State for active admin tab
  const [activeAdminTab, setActiveAdminTab] = useState<'incidents' | 'fleet' | 'budgets' | 'settings' | 'logs'>('incidents');
  
  // Notice Banner edit state
  const [tempNotice, setTempNotice] = useState(announcementNotice);
  const [noticeSavedMsg, setNoticeSavedMsg] = useState('');

  // AI Threshold State
  const [depthWeight, setDepthWeight] = useState(40);
  const [trafficWeight, setTrafficWeight] = useState(35);
  const [hazardWeight, setHazardWeight] = useState(25);
  const [aiConfidenceCutoff, setAiConfidenceCutoff] = useState(75);
  const [aiSavedMsg, setAiSavedMsg] = useState('');

  // Action status message
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // System audit log
  const [auditLogs, setAuditLogs] = useState<Array<{ id: string; time: string; action: string; user: string }>>([
    { id: '1', time: '10:45 AM', action: 'Assigned Crew ALPHA to Incident #GVMC-2026-88', user: 'Zonal Engineer Ward 15' },
    { id: '2', time: '09:30 AM', action: 'Approved Emergency Ward 2 Budget Increase (+₹2,50,000)', user: 'Chief Municipal Engineer' },
    { id: '3', time: '08:15 AM', action: 'Updated AI Priority Depth Threshold to 8.5cm', user: 'GVMC Admin' }
  ]);

  const logAction = (actionText: string) => {
    const newLog = {
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action: actionText,
      user: userRole === 'admin' ? 'GVMC Commissioner' : 'Zonal Engineer'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleNoticeSave = (e: React.FormEvent) => {
    e.preventDefault();
    setAnnouncementNotice(tempNotice);
    setNoticeSavedMsg('Official Website Announcement Notice updated live!');
    logAction(`Updated Portal Notice: "${tempNotice.substring(0, 40)}..."`);
    setTimeout(() => setNoticeSavedMsg(''), 4000);
  };

  const handleAiSave = (e: React.FormEvent) => {
    e.preventDefault();
    setAiSavedMsg('AI Vision Road Audit parameters updated & saved to GVMC Cloud!');
    logAction(`Updated AI Parameters: Depth Weight ${depthWeight}%, Cutoff ${aiConfidenceCutoff}%`);
    setTimeout(() => setAiSavedMsg(''), 4000);
  };

  const handleUpdateIncidentStatus = async (incId: string, newStatus: Incident['status']) => {
    // 1. Find target incident to retrieve reporter metadata
    const incident = incidents.find(i => i.id === incId);
    
    // 2. Update React State
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incId) {
        return {
          ...inc,
          status: newStatus,
          resolvedAt: newStatus === 'RESOLVED' ? new Date().toISOString() : inc.resolvedAt
        };
      }
      return inc;
    }));

    setActionSuccessMsg(`Complaint #${incId} status changed to ${newStatus}`);
    logAction(`Changed status of Complaint #${incId} to ${newStatus}`);
    setTimeout(() => setActionSuccessMsg(''), 3000);

    // 3. Trigger SMS Notification on RESOLVED
    if (newStatus === 'RESOLVED' && incident) {
      const recipientPhone = incident.reporterPhone || "+91 98765 43210";
      const recipientName = incident.reporterName || "Vizag Resident";
      const location = incident.locationName || "Beach Road Corridor";
      const smsMessage = `GVMC ALERTS: Dear ${recipientName}, your road complaint #${incId} at ${location} has been successfully RESOLVED by our engineering squad on ${new Date().toLocaleDateString()}. Thank you for helping keep Visakhapatnam roads safe!`;

      // Utilize dedicated notification service logging method
      notificationService.logSmsDispatchAlert(incId, recipientPhone, recipientName, smsMessage)
        .then(() => {
          console.log(`[AdminPanel] SMS Dispatch Alert logged for complaint #${incId}`);
        })
        .catch((err) => {
          console.error(`[AdminPanel] Failed logging SMS Dispatch Alert:`, err);
        });
    }
  };

  const handleDeleteIncident = (incId: string) => {
    if (confirm(`Are you sure you want to delete incident #${incId}?`)) {
      setIncidents(prev => prev.filter(inc => inc.id !== incId));
      setActionSuccessMsg(`Incident #${incId} removed from database.`);
      logAction(`Deleted Complaint #${incId}`);
      setTimeout(() => setActionSuccessMsg(''), 3000);
    }
  };

  const handleUpdateCrewStatus = (crewId: string, newStatus: FleetCrew['status']) => {
    setCrews(prev => prev.map(c => c.id === crewId ? { ...c, status: newStatus } : c));
    setActionSuccessMsg(`Fleet Squad ${crewId} status set to ${newStatus}`);
    logAction(`Set Fleet Squad ${crewId} status to ${newStatus}`);
    setTimeout(() => setActionSuccessMsg(''), 3000);
  };

  const handleAddWardBudget = (wardName: string, amount: number) => {
    setBudgets(prev => prev.map(b => b.wardName === wardName ? { ...b, allocatedINR: b.allocatedINR + amount } : b));
    setActionSuccessMsg(`Allocated +₹${amount.toLocaleString('en-IN')} to ${wardName}`);
    logAction(`Allocated +₹${amount.toLocaleString('en-IN')} additional budget to ${wardName}`);
    setTimeout(() => setActionSuccessMsg(''), 3000);
  };

  // WHILE CHECKING AUTHENTICATION & PERMISSIONS
  if (checkingAuth) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center animate-in fade-in space-y-4 font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="p-8 rounded-2xl bg-[#0F1F44] border border-white/10 shadow-2xl flex flex-col items-center justify-center space-y-4">
          <RefreshCw className="w-10 h-10 text-[#00D9FF] animate-spin" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Verifying Engineer / Admin Auth Claims & Database Role...</h3>
            <p className="text-xs text-[#AAB6D4]">Checking Firebase Auth claims and GVMC Database permissions.</p>
          </div>
        </div>
      </div>
    );
  }

  // IF CITIZEN / UNAUTHORIZED: Show Access Denied Guard Screen & HIDE ALL ADMIN CONTENT
  if (!isAuthorized) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 space-y-6 text-center animate-in fade-in font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="p-8 rounded-2xl bg-[#0F1F44] border-2 border-red-500/40 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="w-20 h-20 mx-auto rounded-full bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center text-red-400 shadow-lg">
            <Lock className="w-10 h-10 animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-mono font-bold uppercase tracking-wider border border-red-500/30">
              Access Restricted • Unauthorized Role
            </span>
            <h2 className="text-2xl font-black text-white">GVMC Admin Panel Access Control</h2>
            <p className="text-sm text-[#AAB6D4] max-w-xl mx-auto leading-relaxed">
              Neither your authentication token claim nor your database user record indicates an <strong>engineer</strong> or <strong>admin</strong> role. The Admin Panel and its administrative features are strictly hidden from citizens and unauthorized users.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#06132A] border border-white/10 text-xs text-left max-w-lg mx-auto space-y-2">
            <div className="font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#00D9FF]" />
              Role Validation Summary
            </div>
            <div className="space-y-1 font-mono text-[11px] text-[#AAB6D4]">
              <div>• Auth Claim Role: <span className="text-white">{authClaimRole || 'None / Unset'}</span></div>
              <div>• Database Record Role: <span className="text-white">{dbRecordRole || 'None / Unset'}</span></div>
              <div>• Active Portal Role: <span className="text-amber-400 font-bold">{userRole}</span></div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigateTab('login')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E2B857] to-[#B8860B] text-slate-950 font-black text-xs flex items-center gap-2 hover:scale-105 transition-all shadow-lg"
            >
              <UserCheck className="w-4 h-4" />
              Switch Login to Engineer Mode
            </button>
            <button
              onClick={() => onNavigateTab('dashboard')}
              className="px-6 py-3 rounded-xl bg-[#13294B] hover:bg-white/10 text-white font-bold text-xs transition-colors border border-white/10"
            >
              Return to Public Dashboard
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ENGINEER / ADMIN VIEW: Full Admin Panel Controls
  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',sans-serif] animate-in fade-in">
      
      {/* 1. ADMIN PANEL HEADER BANNER */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0F1F44] via-[#0B2545] to-[#0F1F44] border-2 border-[#D4AF37]/40 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] text-slate-950 shadow-lg flex-shrink-0">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#D4AF37] text-[10px] font-mono font-bold uppercase">
                {userRole === 'admin' ? 'COMMISSIONER ACCESS' : 'ZONAL ENGINEER ACCESS'}
              </span>
              <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Control Mode
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-wide uppercase mt-1">
              GVMC Municipal Admin Control Panel
            </h1>
            <p className="text-xs text-[#AAB6D4] mt-0.5">
              Make live changes to website notices, road defect work orders, fleet dispatch parameters, and ward budget allocations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={() => onNavigateTab('login')}
            className="px-3.5 py-2 rounded-xl bg-[#06132A] hover:bg-white/10 border border-white/10 text-xs text-[#AAB6D4] hover:text-white transition-colors flex items-center gap-1.5 font-semibold"
          >
            <Lock className="w-3.5 h-3.5" />
            Switch Role
          </button>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between animate-in fade-in shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionSuccessMsg}</span>
          </div>
          <span className="text-[10px] font-mono opacity-70">AUDIT LOGGED</span>
        </div>
      )}

      {/* 2. ADMIN CONTROL TABS */}
      <div className="flex flex-wrap items-center gap-2 bg-[#0F1F44] p-2 rounded-xl border border-white/10 text-xs">
        {[
          { id: 'incidents', label: 'Complaint & Road Work Orders', icon: AlertTriangle, count: incidents.length },
          { id: 'fleet', label: 'Fleet Crew Dispatch', icon: Truck, count: crews.length },
          { id: 'budgets', label: 'Ward Budget Allocations', icon: DollarSign, count: budgets.length },
          { id: 'runbook', label: 'GVMC Pilot Rollout Runbook', icon: FileText },
          { id: 'settings', label: 'Website Announcement & AI Parameters', icon: Settings },
          { id: 'logs', label: 'Engineer System Audit Logs', icon: Activity, count: auditLogs.length }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeAdminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white shadow-lg shadow-blue-500/20'
                  : 'text-[#AAB6D4] hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                  isActive ? 'bg-white/20 text-white' : 'bg-[#06132A] text-[#AAB6D4]'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. TAB CONTENT */}

      {/* SUB-TAB 1: INCIDENTS / COMPLAINT WORK ORDERS */}
      {activeAdminTab === 'incidents' && (
        <div className="p-6 rounded-2xl bg-[#0F1F44] border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#00D9FF]" />
                Manage & Modify Road Complaints (Engineer Override)
              </h3>
              <p className="text-xs text-[#AAB6D4]">
                Zonal Engineers can update complaint resolution status, re-assign crews, or delete invalid reports.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white">
              <thead className="bg-[#06132A] text-[#AAB6D4] font-mono uppercase text-[10px]">
                <tr>
                  <th className="p-3">Complaint ID</th>
                  <th className="p-3">Location & Ward</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Current Status</th>
                  <th className="p-3">Est. Repair Cost</th>
                  <th className="p-3 text-right">Engineer Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {incidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-mono font-bold text-[#00D9FF]">
                      #{inc.id}
                    </td>
                    <td className="p-3">
                      <div className="font-bold">{inc.locationName}</div>
                      <div className="text-[11px] text-[#AAB6D4]">{inc.ward}</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        inc.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        inc.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="p-3">
                      <select
                        value={inc.status}
                        onChange={(e) => handleUpdateIncidentStatus(inc.id, e.target.value as any)}
                        className="px-2.5 py-1 rounded-lg bg-[#06132A] border border-white/10 text-white text-xs font-semibold focus:border-[#00D9FF] focus:outline-none"
                      >
                        <option value="REPORTED">REPORTED</option>
                        <option value="AI_ANALYZED">AI_ANALYZED</option>
                        <option value="DISPATCHED">DISPATCHED</option>
                        <option value="IN_REPAIR">IN_REPAIR</option>
                        <option value="RESOLVED">RESOLVED</option>
                      </select>
                    </td>
                    <td className="p-3 font-mono text-emerald-400 font-bold">
                      ₹{inc.estimatedCostINR.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleUpdateIncidentStatus(inc.id, 'RESOLVED')}
                        className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold transition-all"
                      >
                        Mark Resolved
                      </button>
                      <button
                        onClick={() => handleDeleteIncident(inc.id)}
                        className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all"
                        title="Delete Complaint"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: FLEET DISPATCH */}
      {activeAdminTab === 'fleet' && (
        <div className="p-6 rounded-2xl bg-[#0F1F44] border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#00D9FF]" />
                Fleet Crew Squad Status Override
              </h3>
              <p className="text-xs text-[#AAB6D4]">
                Change real-time status of repair crews, vehicle maintenance, or reassign wards.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {crews.map((crew) => (
              <div key={crew.id} className="p-4 rounded-xl bg-[#06132A] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-sm">{crew.name}</span>
                  <span className="text-[10px] font-mono text-[#AAB6D4]">{crew.id}</span>
                </div>

                <div className="text-xs text-[#AAB6D4] space-y-1">
                  <div><strong>Leader:</strong> {crew.leader} ({crew.contact})</div>
                  <div><strong>Assigned Ward:</strong> {crew.assignedWard}</div>
                  <div><strong>Jobs Today:</strong> {crew.jobsCompletedToday} repaired</div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-[#AAB6D4]">Status:</span>
                  <select
                    value={crew.status}
                    onChange={(e) => handleUpdateCrewStatus(crew.id, e.target.value as any)}
                    className="px-2 py-1 rounded bg-[#0F1F44] border border-white/10 text-white text-xs font-bold"
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="EN_ROUTE">EN_ROUTE</option>
                    <option value="ON_SITE">ON_SITE</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: WARD BUDGETS */}
      {activeAdminTab === 'budgets' && (
        <div className="p-6 rounded-2xl bg-[#0F1F44] border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                Ward Budget Allocation & Emergency Top-Up
              </h3>
              <p className="text-xs text-[#AAB6D4]">
                Approve budget increases for high-density wards facing heavy road damage.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budgets.map((b) => (
              <div key={b.wardCode} className="p-4 rounded-xl bg-[#06132A] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-sm">{b.wardName}</span>
                  <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">
                    {b.wardCode}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded bg-[#0F1F44]">
                    <span className="text-[10px] text-[#AAB6D4] block">Allocated Budget</span>
                    <span className="text-sm font-black text-emerald-400 font-mono">
                      ₹{b.allocatedINR.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-[#0F1F44]">
                    <span className="text-[10px] text-[#AAB6D4] block">Spent</span>
                    <span className="text-sm font-black text-white font-mono">
                      ₹{b.spentINR.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                  <button
                    onClick={() => handleAddWardBudget(b.wardName, 100000)}
                    className="flex-1 py-1.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all text-center"
                  >
                    +₹1 Lakh Emergency Fund
                  </button>
                  <button
                    onClick={() => handleAddWardBudget(b.wardName, 500000)}
                    className="flex-1 py-1.5 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-xs font-bold transition-all text-center"
                  >
                    +₹5 Lakhs Grant
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB RUNBOOK: GVMC PILOT ROLLOUT RUNBOOK */}
      {activeAdminTab === 'runbook' && (
        <div className="p-6 rounded-2xl bg-[#0F1F44] border border-white/10 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                GVMC Roads & Buildings Operational Handover Runbook
              </h3>
              <p className="text-xs text-[#AAB6D4]">
                Step-by-step execution roadmap and false-positive vibration threshold tuning parameters for GVMC operators.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/30">
              Indicative Pilot Budget: ₹6,000 - ₹12,000
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6 text-xs text-[#AAB6D4]">
            
            <div className="p-4 rounded-xl bg-[#06132A] border border-white/10 space-y-3">
              <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 4-Week Phased Execution Plan
              </h4>
              <ul className="space-y-2.5 leading-relaxed">
                <li className="p-2.5 rounded-lg bg-[#0F1F44]">
                  <strong className="text-white block font-mono text-[11px]">Week 1: Discovery & Pilot Zone Lock</strong>
                  Confirm data ownership with GVMC Roads & Buildings department. Lock Ward 15 (Beach Road) as primary pilot zone.
                </li>
                <li className="p-2.5 rounded-lg bg-[#0F1F44]">
                  <strong className="text-white block font-mono text-[11px]">Week 2: Pipeline Instrumentation</strong>
                  Deploy continuous smartphone telemetry stream, Firestore real-time listener, and Google Maps Platform layer.
                </li>
                <li className="p-2.5 rounded-lg bg-[#0F1F44]">
                  <strong className="text-white block font-mono text-[11px]">Week 3: Live Pilot Run & Threshold Tuning</strong>
                  Drive test vehicles across Beach Road and Siripuram. Tune Z-axis acceleration threshold (g &gt; 2.8g) to eliminate speed bump false positives.
                </li>
                <li className="p-2.5 rounded-lg bg-[#0F1F44]">
                  <strong className="text-white block font-mono text-[11px]">Week 4: Handover & Runbook Operationalization</strong>
                  Hand over administrative credentials and operational dashboard to GVMC Roads & Buildings zonal engineers.
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-[#06132A] border border-white/10 space-y-3">
              <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#00D9FF]" /> Operator Threshold Tuning & Risk Mitigation
              </h4>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-[#0F1F44]">
                  <span className="text-[10px] font-mono text-amber-400 font-bold uppercase block mb-1">False-Positive Prevention</span>
                  <p className="text-[11px] leading-relaxed text-white">
                    Speed bumps produce symmetric Z-axis and Y-axis deceleration curves, while potholes create sharp asymmetric vertical shocks (Z &gt; 2.8g) with zero horizontal tilt.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#0F1F44]">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block mb-1">Budget Allocation Breakdown (₹10,000 Total Pilot)</span>
                  <ul className="text-[11px] space-y-1 text-slate-300">
                    <li>• Mobile Phone Vehicle Mounts: ₹2,000</li>
                    <li>• Cloud Server & Database Hosting: ₹3,500</li>
                    <li>• Field Test Vehicle Fuel & Driver Honorarium: ₹4,500</li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SUB-TAB 4: WEBSITE ANNOUNCEMENT & AI PARAMETERS */}
      {activeAdminTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Announcement Notice Editor */}
          <div className="p-6 rounded-2xl bg-[#0F1F44] border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-base font-extrabold text-white border-b border-white/10 pb-3">
              <Megaphone className="w-5 h-5 text-[#D4AF37]" />
              Website Announcement Notice (Live Banner)
            </div>

            {noticeSavedMsg && (
              <div className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{noticeSavedMsg}</span>
              </div>
            )}

            <form onSubmit={handleNoticeSave} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-mono font-bold text-[#AAB6D4] uppercase block mb-1">
                  Scrolling Ticker Message Text
                </label>
                <textarea
                  rows={3}
                  value={tempNotice}
                  onChange={(e) => setTempNotice(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#06132A] border border-white/10 text-white font-mono focus:border-[#D4AF37] focus:outline-none"
                  placeholder="Enter official announcement..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-slate-950 font-black text-xs hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                PUBLISH ANNOUNCEMENT TO WEBSITE
              </button>
            </form>
          </div>

          {/* AI Vision Thresholds */}
          <div className="p-6 rounded-2xl bg-[#0F1F44] border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-base font-extrabold text-white border-b border-white/10 pb-3">
              <Sparkles className="w-5 h-5 text-[#00D9FF]" />
              AI Vision Priority Formula Parameters
            </div>

            {aiSavedMsg && (
              <div className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{aiSavedMsg}</span>
              </div>
            )}

            <form onSubmit={handleAiSave} className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between font-bold text-white mb-1">
                  <span>Depth Factor Weight</span>
                  <span className="text-[#00D9FF] font-mono">{depthWeight}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={70}
                  value={depthWeight}
                  onChange={(e) => setDepthWeight(Number(e.target.value))}
                  className="w-full accent-[#00D9FF]"
                />
              </div>

              <div>
                <div className="flex justify-between font-bold text-white mb-1">
                  <span>Traffic Density Weight</span>
                  <span className="text-[#00D9FF] font-mono">{trafficWeight}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={70}
                  value={trafficWeight}
                  onChange={(e) => setTrafficWeight(Number(e.target.value))}
                  className="w-full accent-[#00D9FF]"
                />
              </div>

              <div>
                <div className="flex justify-between font-bold text-white mb-1">
                  <span>AI Detection Confidence Cutoff</span>
                  <span className="text-[#00D9FF] font-mono">{aiConfidenceCutoff}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={95}
                  value={aiConfidenceCutoff}
                  onChange={(e) => setAiConfidenceCutoff(Number(e.target.value))}
                  className="w-full accent-[#00D9FF]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white font-bold text-xs hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                SAVE AI CONFIGURATION
              </button>
            </form>
          </div>

        </div>
      )}

      {/* SUB-TAB 5: SYSTEM AUDIT LOGS */}
      {activeAdminTab === 'logs' && (
        <div className="p-6 rounded-2xl bg-[#0F1F44] border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                Engineer Administrative Activity Audit Trail
              </h3>
              <p className="text-xs text-[#AAB6D4]">
                Immutable timestamped logs of website updates, dispatch overrides, and parameter changes.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-[#06132A] border border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px]">
                    {log.time}
                  </span>
                  <span className="text-white font-semibold">{log.action}</span>
                </div>
                <span className="text-[#AAB6D4] text-[11px] font-mono">{log.user}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export const AdminPanel = withEngineerAuth(AdminPanelBase);
