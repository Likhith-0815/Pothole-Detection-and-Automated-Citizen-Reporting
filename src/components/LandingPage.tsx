import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Sparkles, 
  Cpu, 
  MapPin, 
  Truck, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  Car, 
  ArrowRight,
  Eye,
  CheckCircle2,
  Zap,
  BarChart3,
  Search,
  Building2,
  FileText,
  PhoneCall,
  Megaphone,
  CreditCard,
  FileCheck2,
  HelpCircle,
  Download,
  Calendar,
  Layers,
  Map,
  ShieldAlert,
  Building,
  User,
  Camera
} from 'lucide-react';

interface LandingPageProps {
  onExplore: () => void;
  onLiveDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onExplore, onLiveDemo }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'news' | 'tenders' | 'circulars'>('news');

  const popularServices = [
    { title: 'Pay Property Tax', desc: 'Online Assessment & Tax Payment', category: 'e-Payment' },
    { title: 'Pay Water Charges', desc: 'Monthly Consumption & Tap Billing', category: 'e-Payment' },
    { title: 'File AI Defect Complaint', desc: 'Report Road Potholes with Photo', category: 'e-Complaint' },
    { title: 'Birth Certificate', desc: 'Download Registered Birth Certificate', category: 'e-Request' },
    { title: 'Death Certificate', desc: 'Municipal Death Registration', category: 'e-Request' },
    { title: 'Fire NOC Permission', desc: 'Commercial & Highrise Safety NOC', category: 'e-Request' },
    { title: 'Building Permissions', desc: 'Town Planning Layout Approval', category: 'e-Request' },
    { title: 'RTI Applications', desc: 'Right to Information Online Portal', category: 'e-Request' },
  ];

  const filteredServices = searchQuery.trim()
    ? popularServices.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.desc.toLowerCase().includes(searchQuery.toLowerCase()))
    : popularServices;

  return (
    <div className="space-y-10 font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* HERO SECTION WITH GLOBAL MUNICIPAL SERVICE SEARCH */}
      <section className="relative rounded-3xl bg-gradient-to-b from-[#0A2540] to-[#1E3A8A] text-white p-6 sm:p-10 shadow-xl border-2 border-amber-500/40 overflow-hidden">
        
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center space-y-6 z-10">
          
          {/* Official Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-bold uppercase tracking-wider shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Greater Visakhapatnam Municipal Corporation • Official Digital Portal</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase leading-tight">
              Visakhapatnam Smart City Municipal Services
            </h1>
            <p className="text-sm sm:text-base text-slate-200 font-medium max-w-2xl mx-auto leading-relaxed">
              Instant access to Property Tax payments, Water Billing, AI Vision Road Defect Grievance Reporting, Birth & Death certificates, and Ward Secretariat services across all 98 Wards.
            </p>
          </div>

          {/* GLOBAL SERVICE SEARCH BAR */}
          <div className="max-w-2xl mx-auto space-y-3 pt-2">
            <div className="relative shadow-2xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Search className="w-5 h-5 text-amber-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a service, e.g. 'Pay Property Tax', 'Water Bill', 'File Defect'..."
                className="w-full pl-12 pr-32 py-4 rounded-2xl bg-white text-slate-900 placeholder-slate-400 font-bold text-sm shadow-inner focus:outline-none focus:ring-4 focus:ring-amber-400/50"
              />
              <button
                onClick={onExplore}
                className="absolute right-2 top-2 bottom-2 px-5 rounded-xl bg-[#0A2540] hover:bg-[#1E3A8A] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>
            </div>

            {/* QUICK SERVICE CHIPS */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-slate-300 font-bold text-[11px] uppercase mr-1">Popular Quick Links:</span>
              {['Pay Property Tax', 'Water Charges', 'File Defect', 'Birth Certificate', 'Fire NOC'].map((chip) => (
                <button
                  key={chip}
                  onClick={() => {
                    setSearchQuery(chip);
                    onExplore();
                  }}
                  className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-[11px] transition-all"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={onExplore}
              className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs transition-all shadow-md flex items-center gap-2 uppercase tracking-wider"
            >
              <Building2 className="w-4 h-4" />
              <span>Explore All 98 Wards Command Center</span>
            </button>

            <button
              onClick={onLiveDemo}
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/30 text-white font-extrabold text-xs transition-all flex items-center gap-2 uppercase tracking-wider"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>5-Sec AI Scripted Demo</span>
            </button>
          </div>

        </div>
      </section>

      {/* GVMC PROBLEM STATEMENT & PILOT BLUEPRINT SECTION */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-md space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[11px] font-mono font-bold uppercase mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" /> GVMC Audit Baseline & Problem Blueprint
            </div>
            <h2 className="text-xl font-black text-[#0A2540] uppercase tracking-wide">
              GVMC Continuous Pothole Monitoring & AI Repair System
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              Replacing manual periodic road audits with automated smartphone telemetry and real-time GIS dispatch
            </p>
          </div>

          <button
            onClick={onExplore}
            className="px-4 py-2.5 rounded-xl bg-[#0A2540] hover:bg-[#1E3A8A] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 w-fit"
          >
            <span>Open Command Center</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>

        {/* AUDIT BENCHMARK METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-amber-950">
            <span className="text-[10px] font-mono font-bold uppercase block text-amber-800">Nov 2024 Identified Potholes</span>
            <div className="text-3xl font-black text-amber-900 mt-1">4,441</div>
            <p className="text-[11px] text-amber-800 mt-1">Detected via statewide manual audit & citizen complaint logs</p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 text-blue-950">
            <span className="text-[10px] font-mono font-bold uppercase block text-blue-800">Repaired Potholes (Nov 2024)</span>
            <div className="text-3xl font-black text-blue-900 mt-1">2,100</div>
            <p className="text-[11px] text-blue-800 mt-1">47.3% repair rate achieved under reactive complaint process</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-emerald-950">
            <span className="text-[10px] font-mono font-bold uppercase block text-emerald-800">Total Expenditure (Nov 2024)</span>
            <div className="text-3xl font-black text-emerald-900 mt-1">₹6.9 Crore</div>
            <p className="text-[11px] text-emerald-800 mt-1">High financial cost due to delayed detection & water erosion</p>
          </div>
        </div>

        {/* WHY UNSOLVED & SOLUTION ARCHITECTURE */}
        <div className="grid md:grid-cols-2 gap-6 pt-2">
          
          {/* Current Gap */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h3 className="font-extrabold text-sm text-[#0A2540] flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-600" />
              The Root Problem: Manual Audit & Monsoon Latency
            </h3>
            <ul className="space-y-2 text-xs text-slate-700 leading-relaxed list-disc list-inside">
              <li><strong>Monsoon Velocity:</strong> New potholes form during monsoon downpours much faster than periodic manual audits can detect.</li>
              <li><strong>Reactive Repair Loop:</strong> Repairs rely solely on citizen complaints, leaving un-reported potholes to degrade sub-base layers.</li>
              <li><strong>Lack of Spatial Tracking:</strong> No unified real-time GIS map for zonal engineers to track repeat failures.</li>
            </ul>
          </div>

          {/* The Solution */}
          <div className="p-5 rounded-2xl bg-[#0A2540] text-white space-y-3 shadow-md">
            <h3 className="font-extrabold text-sm text-amber-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              The Pilot Solution: Continuous Automated Monitoring
            </h3>
            <ul className="space-y-2 text-xs text-slate-200 leading-relaxed list-disc list-inside">
              <li><strong>Smartphone Telemetry:</strong> Vehicles mounted with mobile phones record vertical Z-axis accelerometer shocks (g &gt; 2.8g) to auto-log potholes.</li>
              <li><strong>Multimodal Vision AI:</strong> Automated image detection calculates surface area in m², depth in cm, and estimated repair cost in ₹.</li>
              <li><strong>GVMC Dispatch Engine:</strong> Auto-allocates nearest fleet squad with automated ward budget tracking across all 98 wards.</li>
            </ul>
          </div>

        </div>

        {/* STAKEHOLDERS & USER PERSONAS */}
        <div className="border-t border-slate-100 pt-5 space-y-3">
          <h3 className="text-xs font-mono font-bold text-[#0A2540] uppercase tracking-wider flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-700" /> Key Stakeholders & User Roles
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <strong className="text-[#0A2540] block mb-1">👷 GVMC Roads & Buildings Field Officers</strong>
              <p className="text-slate-600 text-[11px]">Primary operators receiving live ward-level data to act on defect alerts before escalation.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <strong className="text-[#0A2540] block mb-1">🏛️ Commissioner's Office & City Operations Center</strong>
              <p className="text-slate-600 text-[11px]">Secondary operators utilizing a single cross-department dashboard for budget and staff deployment.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <strong className="text-[#0A2540] block mb-1">🏙️ Visakhapatnam Residents</strong>
              <p className="text-slate-600 text-[11px]">End beneficiaries reporting defects and tracking real-time repair status from their smartphones.</p>
            </div>
          </div>
        </div>

        {/* 4-WEEK PILOT ROLLOUT ROADMAP */}
        <div className="border-t border-slate-100 pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-[#0A2540] uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600" /> 4-Week Working Pilot Rollout Roadmap (Indicative Budget: ₹6,000 - ₹12,000)
            </h3>
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
              GVMC Ready
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-mono font-bold text-blue-700 block uppercase">Week 1: Discovery</span>
              <strong className="text-[#0A2540] block text-xs">Data Ownership & Zone Lock</strong>
              <p className="text-slate-600 text-[11px]">Confirm data ownership with GVMC Roads & Buildings; lock pilot zone (e.g. Ward 15 Beach Road).</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-mono font-bold text-blue-700 block uppercase">Week 2: Build</span>
              <strong className="text-[#0A2540] block text-xs">Pipeline Core Build</strong>
              <p className="text-slate-600 text-[11px]">Ship continuous capture → Firestore → Google Maps GIS visualization pipeline with pilot zone data.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-mono font-bold text-blue-700 block uppercase">Week 3: Pilot Run</span>
              <strong className="text-[#0A2540] block text-xs">Live Zone Testing</strong>
              <p className="text-slate-600 text-[11px]">Run continuous sensor stream against live pilot zone; tune $g$-force thresholds against false positives.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-mono font-bold text-emerald-700 block uppercase">Week 4: Handover</span>
              <strong className="text-[#0A2540] block text-xs">Runbook & Staff Handover</strong>
              <p className="text-slate-600 text-[11px]">Package as standalone service with GVMC operator runbook for seamless execution without hand-holding.</p>
            </div>
          </div>
        </div>

      </section>

      {/* CORE CITIZEN SERVICE CATEGORIES GRID */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-lg font-black text-[#0A2540] uppercase tracking-wide flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-700" />
              Primary Municipal Citizen Services
            </h2>
            <p className="text-xs text-slate-500 font-medium">Select a service to initiate payment, registration or complaint filing</p>
          </div>
          <button onClick={onExplore} className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1">
            View All Services <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: e-Payment */}
          <div 
            onClick={onExplore}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3 group"
          >
            <div className="p-3 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 w-fit group-hover:scale-105 transition-transform">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-blue-700 uppercase tracking-wider">01. e-Payment</span>
              <h3 className="text-base font-extrabold text-[#0A2540] group-hover:text-blue-700 transition-colors">Property & Water Tax</h3>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">Pay municipal property assessments, water charges, and vacant land tax online with instant digital receipts.</p>
            </div>
            <div className="pt-2 text-xs font-bold text-blue-700 flex items-center gap-1">
              <span>Access Payment Portal</span> <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2: e-Complaint */}
          <div 
            onClick={onExplore}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3 group"
          >
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 w-fit group-hover:scale-105 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase tracking-wider">02. e-Complaint</span>
              <h3 className="text-base font-extrabold text-[#0A2540] group-hover:text-emerald-700 transition-colors">AI Defect Grievances</h3>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">Upload road pothole photos. AI Vision auto-calculates depth ($cm$), area ($m^2$) & dispatches local ward repair crews.</p>
            </div>
            <div className="pt-2 text-xs font-bold text-emerald-700 flex items-center gap-1">
              <span>Launch Vision AI Scanner</span> <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3: e-Request */}
          <div 
            onClick={onExplore}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-500 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3 group"
          >
            <div className="p-3 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 w-fit group-hover:scale-105 transition-transform">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-amber-800 uppercase tracking-wider">03. e-Request</span>
              <h3 className="text-base font-extrabold text-[#0A2540] group-hover:text-amber-800 transition-colors">Certificates & NOC</h3>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">Request official Birth Certificates, Death Registrations, Fire Safety NOCs, and Trade Licensing certificates.</p>
            </div>
            <div className="pt-2 text-xs font-bold text-amber-800 flex items-center gap-1">
              <span>Request Certificate</span> <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 4: e-Booking */}
          <div 
            onClick={onExplore}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-purple-500 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3 group"
          >
            <div className="p-3 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 w-fit group-hover:scale-105 transition-transform">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-purple-700 uppercase tracking-wider">04. e-Booking</span>
              <h3 className="text-base font-extrabold text-[#0A2540] group-hover:text-purple-700 transition-colors">Facilities & Community</h3>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">Book GVMC Municipal Community Halls, sports arenas, exhibition grounds and public grounds for events.</p>
            </div>
            <div className="pt-2 text-xs font-bold text-purple-700 flex items-center gap-1">
              <span>Book Facility</span> <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>
      </section>

      {/* FILTERED POPULAR SERVICES RESULTS GRID */}
      <section className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-extrabold text-[#0A2540] uppercase flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-600" />
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Popular Quick Citizen Service Links'}
          </h3>
          <span className="text-xs text-slate-500 font-mono font-bold">{filteredServices.length} Available Services</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {filteredServices.map((service, idx) => (
            <button
              key={idx}
              onClick={onExplore}
              className="p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 text-left transition-all space-y-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase px-1.5 py-0.5 rounded bg-slate-200">
                  {service.category}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-700 transition-colors" />
              </div>
              <h4 className="text-xs font-bold text-[#0A2540] group-hover:text-blue-900">{service.title}</h4>
              <p className="text-[10px] text-slate-500">{service.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* NOTIFICATIONS, TENDERS & OFFICIAL CIRCULARS TABBED SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left 8 Cols: Notifications & Tenders */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-blue-700" />
              <h3 className="text-base font-extrabold text-[#0A2540] uppercase">Official GVMC Announcements & Tenders</h3>
            </div>
            
            {/* Tab buttons */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
              {(['news', 'tenders', 'circulars'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-3 py-1 rounded-lg capitalize transition-all ${
                    activeTab === t ? 'bg-[#0A2540] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {activeTab === 'news' && [
              { title: 'GVMC Monsoons Road Repair Drive in Active Progress across Wards 1 to 98', date: '31 July 2026', tag: 'Infrastructure', desc: 'Special engineering teams dispatched with Jetpatcher vehicles for AI-verified road defects.' },
              { title: 'Eco-Vizag Cleanliness Drive: Single-Use Plastic Ban Enforcement in Zone 2', date: '30 July 2026', tag: 'Environment', desc: 'Sanitation officers conduct surprise inspections in commercial markets.' },
              { title: 'Property Tax Early Rebate Scheme Extended till August 15', date: '28 July 2026', tag: 'Revenue', desc: '5% rebate available on full annual property tax payments made online.' }
            ].map((item, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-mono font-bold">{item.tag}</span>
                  <span className="text-slate-400 font-mono flex items-center gap-1"><Calendar className="w-3 h-3" />{item.date}</span>
                </div>
                <h4 className="text-xs font-bold text-[#0A2540]">{item.title}</h4>
                <p className="text-[11px] text-slate-600">{item.desc}</p>
              </div>
            ))}

            {activeTab === 'tenders' && [
              { title: 'Tender Notice No. GVMC/ENGG/2026/102: Bituminous Road Overlay Works in Zone 3', date: 'Deadline: 12 Aug 2026', tag: 'E-Procurement', desc: 'Estimated value: ₹45.8 Lakhs. Eligible Class-I Contractors may apply.' },
              { title: 'Tender Notice No. GVMC/PH/2026/88: Automated Street Sweeping Machine Procurement', date: 'Deadline: 20 Aug 2026', tag: 'Public Health', desc: 'Supply and 3-year AMC for heavy duty municipal road sweepers.' }
            ].map((item, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 hover:border-amber-300 transition-colors">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono font-bold">{item.tag}</span>
                  <span className="text-slate-500 font-mono">{item.date}</span>
                </div>
                <h4 className="text-xs font-bold text-[#0A2540]">{item.title}</h4>
                <p className="text-[11px] text-slate-600">{item.desc}</p>
              </div>
            ))}

            {activeTab === 'circulars' && [
              { title: 'Circular No. 44/2026: Mandatory Usage of GVMC CivicEye Portal for Ward Secretariats', date: '25 July 2026', tag: 'Administrative', desc: 'All Ward Administrative Secretaries must record daily civic complaints into the unified ERP.' }
            ].map((item, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-mono font-bold">{item.tag}</span>
                  <span className="text-slate-500 font-mono">{item.date}</span>
                </div>
                <h4 className="text-xs font-bold text-[#0A2540]">{item.title}</h4>
                <p className="text-[11px] text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right 4 Cols: Zonal Map Overview & Emergency Numbers */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-mono font-bold text-[#0A2540] uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-700" />
              GVMC Zonal Offices Directory
            </h3>
            <div className="space-y-2 text-xs">
              {[
                { zone: 'Zone 1 - Bheemunipatnam', wards: 'Wards 1 - 12' },
                { zone: 'Zone 2 - Madhurawada', wards: 'Wards 13 - 28' },
                { zone: 'Zone 3 - Asilmetta', wards: 'Wards 29 - 42' },
                { zone: 'Zone 4 - Suryabagh', wards: 'Wards 43 - 56' },
                { zone: 'Zone 5 - Gajuwaka', wards: 'Wards 57 - 72' },
                { zone: 'Zone 6 - Gopalapatnam', wards: 'Wards 73 - 86' },
                { zone: 'Zone 7 - Anakapalle', wards: 'Wards 87 - 98' }
              ].map((z, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-800">{z.zone}</span>
                  <span className="font-mono text-blue-700 font-semibold">{z.wards}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0A2540] text-white space-y-3 shadow-md">
            <h3 className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-amber-400" />
              Emergency & Toll-Free Numbers
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 flex items-center justify-between">
                <span>GVMC Civic Helpline</span>
                <strong className="font-mono text-amber-300">1913</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 flex items-center justify-between">
                <span>Disaster Control Room</span>
                <strong className="font-mono text-white">0891-2746400</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 flex items-center justify-between">
                <span>Water Supply Emergency</span>
                <strong className="font-mono text-white">0891-2869100</strong>
              </div>
            </div>
          </div>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="p-6 rounded-2xl bg-[#0A2540] text-slate-300 text-xs border-t-2 border-amber-500 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
              GVMC
            </div>
            <div>
              <span className="font-extrabold text-white text-sm uppercase">Greater Visakhapatnam Municipal Corporation</span>
              <p className="text-[10px] text-slate-400">Tenneti Bhavan, Beach Road, Visakhapatnam - 530002</p>
            </div>
          </div>
          <div className="text-right text-[11px]">
            <span>Official Municipal Portal • HackYatra AP 2026</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
