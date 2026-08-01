import React, { useState } from 'react';
import { 
  Building2, 
  Map, 
  Camera, 
  Truck, 
  PieChart, 
  ShieldCheck,
  UserCheck, 
  Zap, 
  CloudSun, 
  Bell, 
  Home,
  Lock,
  ChevronDown,
  PhoneCall,
  Globe,
  Search,
  Sparkles,
  FileCheck2,
  Building,
  Video
} from 'lucide-react';
import { UserRole, NotificationItem } from '../types';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  onOpenDemo: () => void;
  onOpenLogin: () => void;
  notifications: NotificationItem[];
  unreadCount: number;
  isEngineerVerified?: boolean;
}

// Government of Andhra Pradesh Emblem SVG
const AndhraPradeshEmblemMini: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="96" fill="#0A3622" stroke="#D4AF37" strokeWidth="6" />
    <circle cx="100" cy="100" r="86" fill="#0A2540" stroke="#FFF8DC" strokeWidth="3" />
    {Array.from({ length: 16 }).map((_, i) => (
      <line
        key={i}
        x1="100"
        y1="100"
        x2={100 + 82 * Math.cos((i * 22.5 * Math.PI) / 180)}
        y2={100 + 82 * Math.sin((i * 22.5 * Math.PI) / 180)}
        stroke="#D4AF37"
        strokeWidth="1.5"
        strokeOpacity="0.4"
      />
    ))}
    <path d="M75 125 C75 140, 125 140, 125 125 C125 105, 115 95, 100 95 C85 95, 75 105, 75 125 Z" fill="#E2B857" stroke="#B8860B" strokeWidth="2" />
    <circle cx="100" cy="78" r="14" fill="#854D0E" stroke="#FEF08A" strokeWidth="1.5" />
    <text x="100" y="172" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold">
      సత్యమేవ జయతే
    </text>
  </svg>
);

// GVMC Corporation Logo SVG
const GVMCLogoMini: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="96" fill="#1E3A8A" stroke="#D4AF37" strokeWidth="6" />
    <circle cx="100" cy="100" r="86" fill="#0A2540" stroke="#00D9FF" strokeWidth="2" />
    <path d="M20 135 Q 60 120, 100 135 T 180 135 L 180 180 L 20 180 Z" fill="#0284C7" />
    <path d="M30 135 Q 70 85, 110 135 Z" fill="#15803D" stroke="#166534" strokeWidth="2" />
    <circle cx="100" cy="65" r="18" fill="#F59E0B" />
    <rect x="65" y="162" width="70" height="18" rx="4" fill="#D4AF37" />
    <text x="100" y="175" textAnchor="middle" fill="#0F172A" fontSize="12" fontWeight="900">
      GVMC
    </text>
  </svg>
);

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  onOpenDemo,
  notifications,
  unreadCount,
  isEngineerVerified = false
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [language, setLanguage] = useState<'EN' | 'TE'>('EN');

  const canAccessAdmin = (userRole === 'engineer' || userRole === 'admin') && isEngineerVerified;
  const isCitizen = userRole === 'citizen';

  const navItems = isCitizen
    ? [
        { id: 'upload', label: language === 'EN' ? 'Upload Pothole Photo & GPS' : 'ఫోటో & జీపీఎస్ అప్‌లోడ్', icon: Camera, highlight: true },
        { id: 'citizen-dashboard', label: language === 'EN' ? 'Citizen Dashboard (My Complaints)' : 'నా ఫిర్యాదులు', icon: FileCheck2 },
        { id: 'dashcam', label: language === 'EN' ? 'Live Dashcam AI' : 'లైవ్ డ్యాష్‌క్యామ్', icon: Video },
        { id: 'landing', label: language === 'EN' ? 'Home' : 'హోమ్', icon: Home },
        { id: 'login', label: language === 'EN' ? 'Portal Login' : 'లాగిన్', icon: Lock },
      ]
    : [
        { id: 'landing', label: language === 'EN' ? 'Home' : 'హోమ్', icon: Home },
        { id: 'dashboard', label: language === 'EN' ? 'Citizen Services' : 'పౌర సేవలు', icon: Building2 },
        { id: 'upload', label: language === 'EN' ? 'AI Defect Report' : 'ఏఐ నివేదిక', icon: Camera },
        { id: 'dashcam', label: language === 'EN' ? 'Live Dashcam AI' : 'లైవ్ డ్యాష్‌క్యామ్', icon: Video },
        { id: 'gis', label: language === 'EN' ? 'GIS Smart Map' : 'జిఐఎస్ మ్యాప్', icon: Map },
        { id: 'fleet', label: language === 'EN' ? 'Fleet Dispatch' : 'ఫ్లీట్ డిస్పాచ్', icon: Truck },
        { id: 'budget', label: language === 'EN' ? 'Ward Budgets' : 'వార్డు బడ్జెట్', icon: PieChart },
        ...(canAccessAdmin ? [{ id: 'admin', label: language === 'EN' ? 'Admin Panel' : 'అడ్మిన్ ప్యానెల్', icon: ShieldCheck, highlight: true }] : []),
        { id: 'login', label: language === 'EN' ? 'Portal Login' : 'లాగిన్', icon: Lock },
      ];

  const roleLabels: Record<UserRole, { title: string; color: string }> = {
    admin: { title: 'GVMC Admin', color: 'bg-red-100 text-red-900 border-red-300' },
    engineer: { title: 'Zonal Engineer', color: 'bg-blue-100 text-blue-900 border-blue-300' },
    citizen: { title: 'Vizag Citizen', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
    guest: { title: 'Guest Reviewer', color: 'bg-amber-100 text-amber-900 border-amber-300' },
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b-2 border-amber-500 shadow-md">
      
      {/* 1. TOP UTILITY BAR */}
      <div className="bg-[#0A2540] text-slate-200 px-4 py-1.5 text-xs border-b border-amber-500/30">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-amber-300 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {language === 'EN' ? 'Govt of Andhra Pradesh • GVMC Municipal Portal' : 'ఆంధ్రప్రదేశ్ ప్రభుత్వం • విశాఖపట్నం పురపాలక సంస్థ'}
            </span>
            <span className="hidden md:inline text-slate-500">|</span>
            <span className="hidden lg:flex items-center gap-1.5 text-slate-300">
              <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
              Toll-Free Helpline: <strong className="text-white font-mono">1913</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center bg-[#1E3A8A] border border-blue-400/30 rounded px-2 py-0.5 text-[10px] text-slate-200 gap-1.5">
              <span>Text Size:</span>
              <button className="hover:text-white font-bold px-1">A-</button>
              <button className="hover:text-white font-bold px-1 border-x border-blue-400/30">A</button>
              <button className="hover:text-white font-bold px-1">A+</button>
            </div>

            <button 
              onClick={() => setLanguage(language === 'EN' ? 'TE' : 'EN')}
              className="px-2.5 py-0.5 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[11px] transition-colors flex items-center gap-1 shadow-sm"
            >
              <Globe className="w-3.5 h-3.5" />
              {language === 'EN' ? 'తెలుగు' : 'English'}
            </button>
          </div>

        </div>
      </div>

      {/* 2. MAIN BRANDING & LOGO HEADER */}
      <div className="px-4 lg:px-8 py-3 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand & Municipal Identity */}
          <button 
            onClick={() => setActiveTab('landing')} 
            className="flex items-center gap-3 group text-left focus:outline-none"
          >
            <div className="flex items-center gap-2">
              <AndhraPradeshEmblemMini className="w-10 h-10 md:w-12 md:h-12" />
              <GVMCLogoMini className="w-10 h-10 md:w-12 md:h-12" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base md:text-xl tracking-tight text-[#0A2540] group-hover:text-blue-700 transition-colors uppercase">
                  Greater Visakhapatnam Municipal Corporation
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 rounded">
                  GVMC
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-semibold hidden md:block">
                Visakhapatnam Smart City Municipal ERP & Road Defect Audit Portal
              </p>
            </div>
          </button>

          {/* Right Actions & Controls */}
          <div className="flex items-center gap-3">
            
            {/* Weather Widget */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
              <CloudSun className="w-4 h-4 text-amber-600" />
              <span>Vizag Coastal 28°C</span>
            </div>

            {/* Scripted Demo Button */}
            <button
              onClick={onOpenDemo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0A2540] hover:bg-[#1E3A8A] text-white text-xs font-bold shadow-sm hover:scale-105 active:scale-95 transition-all"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-current animate-bounce" />
              <span className="hidden sm:inline">5-Sec</span> Scripted Demo
            </button>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                className="relative p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-blue-900 hover:bg-slate-200 transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotificationsDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-[#0A2540]">GVMC Municipal Notifications</span>
                    <span className="text-[10px] text-blue-700 font-mono font-bold">{notifications.length} alerts</span>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className={`font-bold ${n.type === 'CRITICAL' ? 'text-red-700' : 'text-blue-900'}`}>
                            {n.title}
                          </span>
                          <span className="text-[10px] text-slate-500">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{n.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Account / Profile & Sign Out dropdown */}
            <div className="relative">
              {auth.currentUser ? (
                <>
                  <button
                    onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm ${roleLabels[userRole].color}`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">
                      {auth.currentUser.email ? auth.currentUser.email.split('@')[0].toUpperCase() : 'PORTAL USER'} ({userRole.toUpperCase()})
                    </span>
                    <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
                  </button>

                  {showRoleDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-2xl py-1 z-50 text-xs text-slate-800 animate-in fade-in duration-100">
                      <div className="px-3 py-2 border-b border-slate-100 bg-slate-50 rounded-t-xl text-left">
                        <div className="font-extrabold text-[#0A2540] truncate">
                          {auth.currentUser.email || 'Municipal Official'}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                          Role: <strong className="text-blue-700 uppercase">{userRole}</strong>
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            await signOut(auth);
                            setUserRole('guest');
                            setActiveTab('landing');
                            setShowRoleDropdown(false);
                          } catch (err) {
                            console.error("Logout failed:", err);
                          }
                        }}
                        className="w-full text-left px-3 py-2 text-red-600 font-bold hover:bg-red-50 hover:text-red-700 transition-all flex items-center gap-1.5"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Log Out of Portal</span>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={() => {
                    setActiveTab('login');
                    setShowRoleDropdown(false);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-300 bg-blue-50 text-blue-950 text-xs font-extrabold shadow-sm hover:bg-blue-100 transition-all"
                >
                  <Lock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Portal Login</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* 3. PRIMARY NAVIGATION BAR */}
      <div className="bg-[#0A2540] text-white px-4 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto py-1">
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold transition-all whitespace-nowrap border-b-2 ${
                    isActive
                      ? 'border-amber-400 bg-white/10 text-amber-300'
                      : 'border-transparent text-slate-200 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 text-amber-400" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

    </header>
  );
};
