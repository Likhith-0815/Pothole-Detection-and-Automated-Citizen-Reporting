/**
 * CivicEye Vizag - Municipal AI Road Defect Command Center
 * Greater Visakhapatnam Municipal Corporation (GVMC)
 * Team Allide • HackYatra AP State Hackathon 2026
 */

import React, { useState, useEffect } from 'react';
import { UserRole, Incident, FleetCrew, WardBudget, DailyBrief, NotificationItem } from './types';
import { 
  INITIAL_INCIDENTS, 
  INITIAL_FLEET, 
  INITIAL_BUDGETS, 
  INITIAL_NOTIFICATIONS, 
  DEFAULT_DAILY_BRIEF 
} from './data/mockData';

import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { UploadComplaint } from './components/UploadComplaint';
import { GISDashboard } from './components/GISDashboard';
import { FleetPanel } from './components/FleetPanel';
import { BudgetPanel } from './components/BudgetPanel';
import { IncidentDetailsModal } from './components/IncidentDetailsModal';
import { DemoEngineModal } from './components/DemoEngineModal';
import { ReportModal } from './components/ReportModal';
import { GVMCLoginPage } from './components/GVMCLoginPage';
import { AdminPanel } from './components/AdminPanel';
import { DashcamAnalyzer } from './components/DashcamAnalyzer';
import { CitizenDashboard } from './components/CitizenDashboard';

import { auth, db } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

import { FileText, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [userRole, setUserRole] = useState<UserRole>('citizen');
  const [announcementNotice, setAnnouncementNotice] = useState<string>(
    'GVMC Smart City Announcement: Monsoons Road Repair Drive Active in Wards 1 to 98. Report defect images for AI dispatch.'
  );

  // Firebase Auth Verification State for Engineer Role
  const [firebaseUser, setFirebaseUser] = useState<User | null>(auth.currentUser);
  const [isEngineerVerified, setIsEngineerVerified] = useState<boolean>(false);

  // Application State
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [crews, setCrews] = useState<FleetCrew[]>(INITIAL_FLEET);
  const [budgets, setBudgets] = useState<WardBudget[]>(INITIAL_BUDGETS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [dailyBrief, setDailyBrief] = useState<DailyBrief>(DEFAULT_DAILY_BRIEF);

  // Modals State
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showDemoModal, setShowDemoModal] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  // Enforce Citizen Role Scope: Citizens are restricted to pothole photo reporting, citizen dashboard, live dashcam & home
  useEffect(() => {
    if (userRole === 'citizen' && activeTab !== 'upload' && activeTab !== 'dashcam' && activeTab !== 'landing' && activeTab !== 'login' && activeTab !== 'citizen-dashboard') {
      setActiveTab('upload');
    }
  }, [userRole, activeTab]);

  // Firebase Auth Role Verification & Firestore Role Loader
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const { doc, getDoc } = await import('firebase/firestore');
          const userDocRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userDocRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            const fetchedRole = userData.role as UserRole;
            setUserRole(fetchedRole);
            setIsEngineerVerified(fetchedRole === 'engineer' || fetchedRole === 'admin');
          } else {
            // No custom profile doc, fallback to default role or token claims
            const idTokenResult = await user.getIdTokenResult();
            const roleClaim = (idTokenResult.claims.role as string) || (idTokenResult.claims.engineer ? 'engineer' : null);
            const isVerified = Boolean(
              roleClaim === 'engineer' ||
              roleClaim === 'admin' ||
              userRole === 'engineer' ||
              userRole === 'admin'
            );
            setIsEngineerVerified(isVerified);
          }
        } catch (err) {
          console.warn("Failed to load user profile from Firestore:", err);
          setIsEngineerVerified(userRole === 'engineer' || userRole === 'admin');
        }
      } else {
        // Unauthenticated users or non-Firebase session
        setIsEngineerVerified(userRole === 'engineer' || userRole === 'admin');
      }
    });

    return () => unsubscribe();
  }, [userRole]);

  // Fetch initial data from backend API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch('/api/dashboard');
        if (res.ok) {
          const data = await res.json();
          if (data.recentIncidents && data.recentIncidents.length > 0) {
            setIncidents(data.recentIncidents);
          }
          if (data.dailyBrief) {
            setDailyBrief(data.dailyBrief);
          }
          if (data.notifications) {
            setNotifications(data.notifications);
          }
        }
      } catch (err) {
        console.warn("Backend API sync fallback to local state:", err);
      }
    };

    fetchDashboardData();
  }, []);

  // Handlers
  const handleIncidentCreated = (newIncident: Incident) => {
    setIncidents(prev => [newIncident, ...prev]);
    // update ward budget pending estimate
    setBudgets(prev => prev.map(b => {
      if (b.wardName === newIncident.ward) {
        return {
          ...b,
          pendingEstimatesINR: b.pendingEstimatesINR + newIncident.estimatedCostINR,
          activePotholesCount: b.activePotholesCount + 1,
          criticalCount: newIncident.severity === 'CRITICAL' ? b.criticalCount + 1 : b.criticalCount
        };
      }
      return b;
    }));
  };

  const handleDispatchCrew = async (incidentId: string, crewId?: string) => {
    const targetCrewId = crewId || 'CREW-ALPHA';
    
    try {
      await fetch('/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incidentId, crewId: targetCrewId })
      });
    } catch (e) {
      console.warn("API Dispatch fallback:", e);
    }

    setIncidents(prev => prev.map(i => {
      if (i.id === incidentId) {
        return {
          ...i,
          status: 'DISPATCHED',
          assignedCrewId: targetCrewId,
          assignedCrewName: crews.find(c => c.id === targetCrewId)?.name || 'GVMC Repair Squad Alpha',
          etaMinutes: 14
        };
      }
      return i;
    }));

    setCrews(prev => prev.map(c => {
      if (c.id === targetCrewId) {
        return {
          ...c,
          status: 'EN_ROUTE',
          activeIncidentId: incidentId,
          etaMinutes: 14
        };
      }
      return c;
    }));

    setNotifications(prev => [
      {
        id: `NOTIF-${Date.now()}`,
        title: 'DISPATCH CONFIRMED',
        message: `Fleet Crew ${targetCrewId} assigned to incident ${incidentId}.`,
        time: 'Just now',
        type: 'DISPATCH',
        read: false
      },
      ...prev
    ]);
  };

  const handleRefreshDailyBrief = async () => {
    try {
      const res = await fetch('/api/ai-brief', { method: 'POST' });
      if (res.ok) {
        const brief = await res.json();
        setDailyBrief(brief);
      }
    } catch (e) {
      console.warn("AI Brief error:", e);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        setUserRole={setUserRole}
        onOpenDemo={() => setShowDemoModal(true)}
        onOpenLogin={() => setActiveTab('login')}
        notifications={notifications}
        unreadCount={unreadCount}
        isEngineerVerified={isEngineerVerified}
      />

      {/* Quick floating report button */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={() => setShowReportModal(true)}
          className="px-4 py-3 rounded-2xl bg-[#0A2540] hover:bg-[#1E3A8A] text-white font-extrabold text-xs shadow-xl transition-all flex items-center gap-2 border border-amber-400"
        >
          <FileText className="w-4 h-4 text-amber-400" />
          <span>Export GVMC Official PDF</span>
        </button>
      </div>

      {/* Main View Container */}
      {activeTab === 'login' ? (
        <GVMCLoginPage
          onSelectRole={(role) => {
            setUserRole(role);
          }}
          onLoginSuccess={(role) => {
            setUserRole(role);
            if (role === 'admin') {
              setActiveTab('admin');
            } else if (role === 'engineer') {
              setActiveTab('gis');
            } else if (role === 'citizen') {
              setActiveTab('upload');
            } else {
              setActiveTab('dashboard');
            }
          }}
        />
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'landing' && (
            <LandingPage
              onExplore={() => setActiveTab('dashboard')}
              onLiveDemo={() => setShowDemoModal(true)}
            />
          )}

          {activeTab === 'dashboard' && (
            <ExecutiveDashboard
              incidents={incidents}
              crews={crews}
              budgets={budgets}
              dailyBrief={dailyBrief}
              notifications={notifications}
              onOpenDemo={() => setShowDemoModal(true)}
              onSelectIncident={setSelectedIncident}
              onNavigateTab={setActiveTab}
              onRefreshDailyBrief={handleRefreshDailyBrief}
            />
          )}

          {activeTab === 'citizen-dashboard' && (
            <CitizenDashboard
              incidents={incidents}
              onSelectIncident={setSelectedIncident}
            />
          )}

          {activeTab === 'upload' && (
            <UploadComplaint
              onIncidentCreated={handleIncidentCreated}
              crews={crews}
              onOpenDispatch={(incId) => handleDispatchCrew(incId)}
              userRole={userRole}
            />
          )}

          {activeTab === 'dashcam' && (
            <DashcamAnalyzer
              onIncidentCreated={handleIncidentCreated}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'gis' && (
            <GISDashboard
              incidents={incidents}
              crews={crews}
              onSelectIncident={setSelectedIncident}
              onDispatchCrew={(incId) => handleDispatchCrew(incId)}
            />
          )}

          {activeTab === 'fleet' && (
            <FleetPanel
              crews={crews}
              incidents={incidents}
              onDispatchToIncident={(crewId, incId) => handleDispatchCrew(incId, crewId)}
            />
          )}

          {activeTab === 'budget' && (
            <BudgetPanel
              budgets={budgets}
            />
          )}

          {activeTab === 'admin' && (
            <AdminPanel
              userRole={userRole}
              setUserRole={setUserRole}
              incidents={incidents}
              setIncidents={setIncidents}
              crews={crews}
              setCrews={setCrews}
              budgets={budgets}
              setBudgets={setBudgets}
              onNavigateTab={setActiveTab}
              announcementNotice={announcementNotice}
              setAnnouncementNotice={setAnnouncementNotice}
            />
          )}
        </main>
      )}

      {/* Incident Details Inspection Modal */}
      <IncidentDetailsModal
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
        onDispatch={(incId) => handleDispatchCrew(incId)}
        crews={crews}
      />

      {/* 5-Sec Scripted Demo Modal */}
      <DemoEngineModal
        isOpen={showDemoModal}
        onClose={() => setShowDemoModal(false)}
        onCompleteDemo={() => {
          setShowDemoModal(false);
          setActiveTab('dashboard');
        }}
      />

      {/* Municipal Report Generator Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        incidents={incidents}
        budgets={budgets}
      />


    </div>
  );
}
