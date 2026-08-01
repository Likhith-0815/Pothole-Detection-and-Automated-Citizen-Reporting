import React, { useState, useEffect } from 'react';
import { Incident } from '../types';
import { auth, db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { 
  FileText, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  MapPin, 
  Phone, 
  User, 
  Smartphone, 
  ShieldCheck, 
  ArrowRight,
  RefreshCw,
  Bell,
  Sparkles
} from 'lucide-react';

interface CitizenDashboardProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({
  incidents,
  onSelectIncident
}) => {
  const [currentUserProfile, setCurrentUserProfile] = useState<{ name: string; email: string; phone: string; uid: string } | null>(null);
  const [searchIdInput, setSearchIdInput] = useState('');
  const [searchedIncident, setSearchedIncident] = useState<Incident | null>(null);
  const [searchError, setSearchError] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'my-complaints' | 'sms-inbox'>('my-complaints');
  const [smsMessages, setSmsMessages] = useState<Array<{
    id: string;
    recipientPhone: string;
    recipientName: string;
    message: string;
    sentAt: string;
    incidentId: string;
    status: string;
  }>>([]);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // 1. Observe Firebase Auth and load user details & matching SMS logs
  useEffect(() => {
    let unsubscribeSms: () => void = () => {};

    const loadUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        setLoadingProfile(true);
        try {
          const userSnap = await getDoc(doc(db, 'users', user.uid));
          if (userSnap.exists()) {
            const data = userSnap.data();
            setCurrentUserProfile({
              uid: user.uid,
              name: data.name || 'Vizag Resident',
              email: user.email || '',
              phone: data.mobileNumber || '+91 98765 43210'
            });

            // Set up real-time listener for SMS notifications sent to this user's mobile number
            const phoneForQuery = data.mobileNumber || '+91 98765 43210';
            const smsQuery = query(
              collection(db, 'sms_notifications'),
              where('recipientPhone', '==', phoneForQuery)
            );

            unsubscribeSms = onSnapshot(smsQuery, (snapshot) => {
              const smsList: any[] = [];
              snapshot.forEach((doc) => {
                smsList.push({ id: doc.id, ...doc.data() });
              });
              // Sort by date descending
              smsList.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
              setSmsMessages(smsList);
            }, (err) => {
              console.warn("SMS snapshot reading failed. Falling back to local:", err);
            });
          } else {
            setCurrentUserProfile({
              uid: user.uid,
              name: 'Vizag Resident',
              email: user.email || '',
              phone: '+91 98765 43210'
            });
          }
        } catch (err) {
          console.error("Error loading user profile:", err);
        } finally {
          setLoadingProfile(false);
        }
      } else {
        // Guest user fallback or static demo mode SMS alerts
        const localSmsStr = localStorage.getItem('civiceye_sms_logs');
        if (localSmsStr) {
          try {
            setSmsMessages(JSON.parse(localSmsStr));
          } catch (e) {
            console.warn(e);
          }
        }
      }
    };

    loadUserData();
    return () => {
      unsubscribeSms();
    };
  }, []);

  // Sort incidents by date descending
  const sortedIncidents = [...incidents].sort(
    (a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
  );

  // Filter complaints logged by the current user
  const myComplaints = sortedIncidents.filter(inc => {
    const user = auth.currentUser;
    if (user) {
      return inc.reporterUid === user.uid;
    }
    // Fallback: If anonymous session, show recently created demo incidents in current session
    return inc.id.startsWith('GVMC-ACCEL-') || inc.id.includes('GVMC-2026');
  });

  const handleSearchIncidentById = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    setSearchedIncident(null);

    const cleanId = searchIdInput.trim().toUpperCase().replace('#', '');
    if (!cleanId) return;

    const found = incidents.find(i => i.id.toUpperCase() === cleanId);
    if (found) {
      setSearchedIncident(found);
    } else {
      setSearchError(`No official GVMC complaint matches ID: #${cleanId}. Please check the ID and try again.`);
    }
  };

  return (
    <div className="space-y-6" id="citizen-dashboard-container">
      
      {/* Top Banner */}
      <div className="bg-[#0A2540] text-white p-6 rounded-2xl border-b-4 border-amber-500 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded font-mono">
                Citizen Portal
              </span>
              <span className="text-slate-400 text-xs font-semibold">• GVMC Visakhapatnam</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              My Complaints & Service Dashboard
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Real-time accountability dashboard for Visakhapatnam residents. Check resolution progress and view verified mobile SMS alerts sent to your registered number.
            </p>
          </div>
          
          <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl text-xs space-y-1 md:w-80">
            <span className="text-[10px] font-mono text-amber-300 uppercase block font-black">
              Logged-in Resident Identity
            </span>
            {currentUserProfile ? (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-white font-bold">
                  <User className="w-4 h-4 text-sky-400" />
                  <span>{currentUserProfile.name}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300 text-[11px] font-mono">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Registered Mobile: <strong className="text-white">{currentUserProfile.phone}</strong></span>
                </div>
              </div>
            ) : (
              <div className="text-slate-300 leading-relaxed text-[11px]">
                You are currently viewing as a <strong className="text-white">Guest Resident</strong>. Login to your official Aadhaar-verified resident portal to track custom complaints.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Complaints Tracking */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Dashboard Subtabs Navigation */}
          <div className="flex items-center gap-1.5 border-b border-slate-200 pb-px">
            <button
              onClick={() => setActiveSubTab('my-complaints')}
              className={`px-4 py-2 text-xs font-black tracking-wide uppercase border-b-2 transition-all flex items-center gap-2 ${
                activeSubTab === 'my-complaints'
                  ? 'border-blue-600 text-blue-600 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              My Road Complaints ({myComplaints.length})
            </button>
            <button
              onClick={() => setActiveSubTab('sms-inbox')}
              className={`px-4 py-2 text-xs font-black tracking-wide uppercase border-b-2 transition-all flex items-center gap-2 ${
                activeSubTab === 'sms-inbox'
                  ? 'border-blue-600 text-blue-600 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              Registered Phone Alerts Log ({smsMessages.length})
              {smsMessages.length > 0 && (
                <span className="bg-red-500 text-white font-mono text-[9px] px-1.5 py-px rounded-full font-bold animate-pulse">
                  NEW
                </span>
              )}
            </button>
          </div>

          {activeSubTab === 'my-complaints' && (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Live Pothole Rectification Pipeline
                </h2>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded font-mono">
                  REFRESHES LIVE
                </span>
              </div>

              {myComplaints.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-slate-950">No Active Complaints Filed</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    You haven't uploaded any pothole defect complaints from this account yet. Use the "Upload Pothole Photo" tab to file your first complaint.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-800">
                    <thead className="bg-slate-100/80 text-slate-600 font-mono text-[9px] uppercase border-b border-slate-200">
                      <tr>
                        <th className="p-3">ID</th>
                        <th className="p-3">Location / Defect</th>
                        <th className="p-3">Severity</th>
                        <th className="p-3">Current Status</th>
                        <th className="p-3">Reported On</th>
                        <th className="p-3 text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {myComplaints.map((inc) => {
                        // Invariant Enforced: Until resolved, always display "PENDING"
                        const isResolved = inc.status === 'RESOLVED';
                        return (
                          <tr key={inc.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-3 font-mono font-bold text-blue-600">
                              #{inc.id}
                            </td>
                            <td className="p-3">
                              <div className="font-extrabold text-slate-950">{inc.locationName}</div>
                              <div className="text-[11px] text-slate-500 truncate max-w-xs">{inc.title}</div>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-extrabold ${
                                inc.severity === 'CRITICAL' ? 'bg-red-50 text-red-700 border border-red-200' :
                                inc.severity === 'HIGH' ? 'bg-amber-5 text-amber-700 border border-amber-200' :
                                'bg-blue-5 text-blue-700 border border-blue-200'
                              }`}>
                                {inc.severity}
                              </span>
                            </td>
                            <td className="p-3">
                              {isResolved ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  Resolved
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase animate-pulse">
                                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                                  Pending
                                </span>
                              )}
                              <div className="text-[9px] text-slate-400 font-mono mt-0.5 pl-5">
                                {isResolved ? 'Road Repaired!' : `Phase: ${inc.status}`}
                              </div>
                            </td>
                            <td className="p-3 text-slate-500 text-[11px] font-mono">
                              {new Date(inc.reportedAt).toLocaleDateString()}
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => onSelectIncident(inc)}
                                className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-[11px] font-bold transition-all"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'sms-inbox' && (
            <div className="bg-slate-100 border border-slate-200 rounded-3xl p-6 relative shadow-inner overflow-hidden max-w-lg mx-auto">
              {/* Phone Device Frame Overlay */}
              <div className="absolute top-0 inset-x-0 h-4 bg-slate-300 rounded-t-3xl flex items-center justify-center">
                <div className="w-20 h-2 bg-slate-400 rounded-full" />
              </div>

              <div className="mt-2 space-y-4">
                <div className="flex items-center justify-between text-slate-500 font-mono text-[10px] px-2">
                  <span className="font-bold">GVMC LIVE ALERTS NETWORK</span>
                  <span>LTE / GPS ACTIVE</span>
                </div>

                <div className="space-y-3.5 max-h-[420px] overflow-y-auto px-1">
                  {smsMessages.length === 0 ? (
                    <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-slate-200">
                      <Smartphone className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                      <h4 className="text-xs font-bold text-slate-900">Inbox is Empty</h4>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Automated SMS logs are generated and dispatched to your registered number the moment Zonal Engineers resolve your reports.
                      </p>
                    </div>
                  ) : (
                    smsMessages.map((msg) => (
                      <div key={msg.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm relative animate-in slide-in-from-bottom duration-300">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono font-bold text-slate-700 flex items-center gap-1">
                            <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                            To: {msg.recipientPhone}
                          </span>
                          <span className="text-[9px] font-mono text-slate-400">
                            {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11.5px] text-slate-800 font-sans leading-relaxed">
                          {msg.message}
                        </div>

                        <div className="mt-2 flex items-center justify-between text-[10px] font-mono">
                          <span className="text-emerald-600 font-extrabold flex items-center gap-0.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                            DELIVERED VIA GVMC TELECOM
                          </span>
                          <span className="text-blue-600 font-semibold">Ref: #{msg.incidentId}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right 1 Column: Incident ID Tracker Search & FAQ */}
        <div className="space-y-6">
          
          {/* Incident ID Quick Tracker Search Card */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Search className="w-4 h-4 text-blue-600" />
              Quick Complaint ID Tracker
            </h3>
            
            <form onSubmit={handleSearchIncidentById} className="space-y-2">
              <label className="text-[10px] font-mono text-slate-500 block uppercase font-extrabold">
                Enter 13-Digit Complaint ID (e.g. GVMC-2026-8800)
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={searchIdInput}
                  onChange={(e) => setSearchIdInput(e.target.value)}
                  placeholder="e.g. GVMC-2026-88"
                  className="w-full pl-3 pr-10 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono text-xs font-extrabold uppercase focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 p-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {searchError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-[11px] leading-relaxed">
                {searchError}
              </div>
            )}

            {searchedIncident && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3.5 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-blue-600 font-extrabold">#{searchedIncident.id}</span>
                  {searchedIncident.status === 'RESOLVED' ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-extrabold uppercase flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Resolved
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-extrabold uppercase flex items-center gap-0.5 animate-pulse">
                      <Clock className="w-3 h-3 text-amber-600" />
                      Pending
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-950">{searchedIncident.locationName}</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{searchedIncident.title}</p>
                </div>

                <div className="pt-2 border-t border-slate-200 text-[10px] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-mono">SEVERITY</span>
                    <span className="text-slate-900 font-mono font-extrabold">{searchedIncident.severity}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-mono">WARD</span>
                    <span className="text-slate-900 font-bold">{searchedIncident.ward}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-mono">CURRENT PHASE</span>
                    <span className="text-slate-900 font-mono font-bold text-[9px] bg-slate-200 px-1.5 py-0.5 rounded uppercase">{searchedIncident.status}</span>
                  </div>
                </div>

                <button
                  onClick={() => onSelectIncident(searchedIncident)}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
                >
                  <span>Inspect Repair Status</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Citizen Accountability Guarantee Card */}
          <div className="bg-[#0A2540] text-white border border-white/10 rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-mono font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              GVMC Citizen SLA Guarantee
            </h4>
            <div className="text-[11.5px] text-slate-300 leading-relaxed space-y-2.5">
              <p>
                GVMC SLA requires that all <strong className="text-red-400">CRITICAL</strong> severity pothole reports on arterial corridors must be dispatched within <strong className="text-white">15 minutes</strong> and completed within <strong className="text-white">24 hours</strong>.
              </p>
              <p>
                Until the defect is resolved by our zonal engineer, the complaint maintains a <strong className="text-amber-400 font-mono">PENDING</strong> status on all portal boards. Once repaired, you will automatically receive an SMS alert containing coordinates and the resolution timestamp.
              </p>
            </div>
            
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[10px] leading-relaxed">
              <span className="text-white font-extrabold uppercase block font-mono text-[9px] mb-0.5 text-sky-400">
                Official Resolution Process:
              </span>
              1. Auto-detected by Vision AI / Accel Sensor.<br/>
              2. Work-Order Dispatched to Field Crew.<br/>
              3. Zonal Engineer validates repair quality on-site.<br/>
              4. Zonal Engineer pushes "RESOLVED" status update.<br/>
              5. Citizen registered phone receives automated SMS text.
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
