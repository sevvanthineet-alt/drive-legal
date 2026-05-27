/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, Bot, FileText, BarChart3, Heart, Lock, 
  Menu, X, Bell, User as UserIcon, Scale, Calendar, AlertOctagon, 
  CornerDownRight, Check, RefreshCw, Eye, Settings, Compass, Sparkles
} from 'lucide-react';

import { User, LawSection, Challan, EmergencyContact, AlertNotification, ChatMessage, PlatformStats } from './types.ts';
import DashboardHome from './components/DashboardHome.tsx';
import DashboardLegalAssistant from './components/DashboardLegalAssistant.tsx';
import DashboardChallanScanner from './components/DashboardChallanScanner.tsx';
import DashboardTrafficAnalytics from './components/DashboardTrafficAnalytics.tsx';
import DashboardEmergency from './components/DashboardEmergency.tsx';
import DashboardAdmin from './components/DashboardAdmin.tsx';
import DashboardCitizenRecords from './components/DashboardCitizenRecords.tsx';
import DashboardSurveillanceLogs from './components/DashboardSurveillanceLogs.tsx';
import DashboardSettings from './components/DashboardSettings.tsx';
import SecureAuthScreen from './components/SecureAuthScreen.tsx';

export default function App() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // App-level state for selected city, shared across Navbar and Home map
  const [selectedCityId, setSelectedCityId] = useState<string>('del');

  // Real-time ticking system clock state for high fidelity
  const [currentTime, setCurrentTime] = useState<string>('2026-05-27 06:40:00 UTC');

  // States
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const [rules, setRules] = useState<LawSection[]>([]);
  const [challans, setChallans] = useState<Challan[]>([]);
  const [emergencies, setEmergencies] = useState<EmergencyContact[]>([]);
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [stats, setStats] = useState<PlatformStats>({
    activeUsersCount: 148202,
    totalChallansIssued: 84920,
    totalFinesCollected: 42194000,
    overallComplianceRate: 84,
    aiQueriesResolved: 3824
  });

  // Load database files
  const fetchDbState = async (tokenOverride?: string) => {
    const activeToken = tokenOverride || token || localStorage.getItem('drivelegal_session_token');
    
    try {
      if (activeToken) {
        setToken(activeToken);
        const parts = activeToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const userResponse = await fetch('/api/user').then(r => r.json());
          if (userResponse.success && userResponse.user && userResponse.user.email.toLowerCase() === payload.email.toLowerCase()) {
            setUser(userResponse.user);
          } else {
            setUser({
              id: payload.id,
              name: payload.name,
              email: payload.email,
              role: payload.role as 'citizen' | 'officer' | 'admin' | 'superadmin',
              safetyScore: 90,
              complianceRating: 90,
              riskPercentage: 10
            });
          }
        }
      } else {
        setUser(null);
        setToken(null);
      }

      const [resRules, resChallans, resEmergencies, resAlerts, resChat, resStats] = await Promise.all([
        fetch('/api/rules').then(r => r.json()),
        fetch('/api/challans').then(r => r.json()),
        fetch('/api/emergencies').then(r => r.json()),
        fetch('/api/alerts').then(r => r.json()),
        fetch('/api/chat/history').then(r => r.json()),
        fetch('/api/stats').then(r => r.json())
      ]);

      if (resRules.success) setRules(resRules.sections);
      if (resChallans.success) setChallans(resChallans.challans);
      if (resEmergencies.success) setEmergencies(resEmergencies.emergencies);
      if (resAlerts.success) setAlerts(resAlerts.alerts);
      if (resChat.success) setChatHistory(resChat.history);
      if (resStats.success) setStats(resStats.stats);
    } catch (e) {
      console.warn("Express backend connection delay. Re-syncing local variables index.", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (newToken: string, authenticatedUser: User) => {
    setToken(newToken);
    setUser(authenticatedUser);
    localStorage.setItem('drivelegal_session_token', newToken);
    fetchDbState(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('drivelegal_session_token');
    setUser(null);
    setToken(null);
    setActiveTab(0);
  };

  useEffect(() => {
    fetchDbState();

    // Clock ticker trigger
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.getUTCFullYear() + '-' + 
        String(now.getUTCMonth() + 1).padStart(2,'0') + '-' + 
        String(now.getUTCDate()).padStart(2,'0') + ' ' + 
        String(now.getUTCHours()).padStart(2,'0') + ':' + 
        String(now.getUTCMinutes()).padStart(2,'0') + ':' + 
        String(now.getUTCSeconds()).padStart(2,'0') + ' UTC'
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // UI Event Handlers
  const handleAddNewChallan = (challan: Partial<Challan>) => {
    setChallans(prev => [challan as Challan, ...prev]);
    // Increment total fine tally representation
    setStats(prev => ({
      ...prev,
      totalChallansIssued: prev.totalChallansIssued + 1,
      totalFinesCollected: prev.totalFinesCollected + (challan.fineAmount || 0)
    }));
  };

  const handleAddNewRule = (rule: LawSection) => {
    setRules(prev => [rule, ...prev]);
  };

  const handleUpdateRole = async (role: User['role']) => {
    try {
      setUser(prev => ({ ...prev, role }));
      await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      fetchDbState();
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearHistory = async () => {
    try {
      setChatHistory([]);
      await fetch('/api/chat/clear', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
  };

  const getVisibleTabs = () => {
    if (!user) return [];
    if (user.role === 'admin' || user.role === 'superadmin') {
      return [0, 1, 2, 3, 4, 5, 6, 7, 8];
    }
    if (user.role === 'officer') {
      return [0, 2, 3, 4, 7, 8]; // Command, scanner, analytics, emergency, logs, settings
    }
    // citizen
    return [0, 1, 2, 4, 6, 8]; // Command, AI assistant, scanner, emergency, records, settings
  };

  const visibleTabs = getVisibleTabs();

  useEffect(() => {
    if (user && visibleTabs.length > 0 && !visibleTabs.includes(activeTab)) {
      setActiveTab(visibleTabs[0]);
    }
  }, [user]);

  const menuItems = [
    { title: "Command Center", icon: ShieldAlert, desc: "Regional telemetry, safety rating & map alerts" },
    { title: "AI Legal Assistant", icon: Bot, desc: "Grounded MV Act statutory advice" },
    { title: "e-Challan Scanner", icon: FileText, desc: "OCR compliance audits & fraud verifier" },
    { title: "Traffic Analytics", icon: BarChart3, desc: "Predictive heatmaps & statutory fine metrics" },
    { title: "Emergency Rescue", icon: Heart, desc: "Patrol coordination & Good Samaritan guidelines" },
    { title: "Admin Terminal", icon: Lock, desc: "Code enactments & RTO monitoring controls" },
    { title: "Citizen Records", icon: UserIcon, desc: "Points, license records & compliance index" },
    { title: "AI Surveillance Logs", icon: Eye, desc: "Radar plate scanning & camera snapshots" },
    { title: "Settings", icon: Settings, desc: "Manage alerts threshold & radar parameters" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#020617] flex flex-col items-center justify-center text-center font-mono relative overflow-hidden text-xs text-slate-350" id="applet-startup-spinner">
        {/* Background Grid Atmosphere */}
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#00bcd4_1px,transparent_1px),linear-gradient(to_bottom,#00bcd4_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none -z-10"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none -z-20 animate-pulse"></div>

        <RefreshCw className="w-10 h-10 animate-spin text-cyan-400 mb-4" />
        <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest animate-pulse font-bold">Initializing National Traffic Security Grid...</span>
        <span className="text-[9px] text-slate-650 uppercase tracking-widest block mt-2">Checking Authentication Token Handshakes</span>
      </div>
    );
  }

  if (!user) {
    return <SecureAuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-cyan-500/35 selection:text-white" id="applet-core-context">
      
      {/* Background radial atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-20">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-cyan-900/10 rounded-full blur-[160px] opacity-75"></div>
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[140px] opacity-50"></div>
      </div>

      {/* Cyber Grid back-overlay */}
      <div className="fixed inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#00bcd4_1px,transparent_1px),linear-gradient(to_bottom,#00bcd4_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none -z-10"></div>

      {/* Primary Left Navigation Panel (Sidebar) */}
      <aside 
        className={`fixed inset-y-0 left-0 bg-[#07111F]/90 backdrop-blur-xl border-r border-slate-800/80 w-72 transform xl:transform-none transition-transform duration-300 z-40 flex flex-col justify-between ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'
        }`}
        id="applet-sidebar-aside"
      >
        <div className="p-5 flex flex-col h-full justify-between" id="sidebar-container-box">
          
          <div className="space-y-6">
            {/* Logo and Sentinel Info */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-5" id="sidebar-header-box">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/15">
                  <Scale className="w-5 h-5 text-white animate-pulse" />
                </div>
                <div>
                  <h1 className="text-base font-extrabold tracking-tight text-white font-mono flex items-center gap-1">
                    DriveLegal <span className="text-[10px] text-cyan-400 font-bold">HQ</span>
                  </h1>
                  <span className="text-[9px] tracking-widest text-slate-500 font-mono font-bold uppercase block">National Safety Matrix</span>
                </div>
              </div>

              {/* Mobile Close Button */}
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="xl:hidden p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                id="btn-sidebar-close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav Menu Channels */}
            <nav className="space-y-1 max-h-[480px] overflow-y-auto pr-1" id="sidebar-nav">
              {menuItems.map((item, idx) => {
                if (!visibleTabs.includes(idx)) return null;
                const Icon = item.icon;
                const isActive = activeTab === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveTab(idx);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl transition flex items-center gap-3 relative border group cursor-pointer ${
                      isActive 
                        ? 'bg-gradient-to-r from-cyan-500/15 to-blue-600/15 border-cyan-500/35 text-white shadow-md' 
                        : 'bg-transparent border-transparent hover:bg-slate-900/35 hover:border-slate-800/60 text-slate-400 hover:text-slate-200'
                    }`}
                    id={`sidebar-anchor-${idx}`}
                  >
                    <Icon className={`w-4 h-4 transition ${isActive ? 'text-cyan-400 font-bold' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    <div>
                      <span className="text-xs font-bold block">{item.title}</span>
                      <span className="text-[8px] text-slate-500 font-mono mt-0.5 block line-clamp-1">{item.desc}</span>
                    </div>

                    {/* Active accent dot */}
                    {isActive && (
                      <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Citizen Active Registry (Footer Item of Sidebar) */}
          <div className="border-t border-slate-800 pt-4 space-y-2.5" id="sidebar-footer-card">
            <div className="flex flex-col gap-2 bg-slate-950/40 p-3 rounded-xl border border-slate-850">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-slate-200 block truncate">{user?.name}</span>
                  <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider block font-bold truncate">{user?.role} console</span>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="w-full mt-1.5 py-1.5 px-3 bg-red-950/25 hover:bg-red-900/40 border border-red-900/40 text-red-400 hover:text-red-350 rounded-lg font-mono text-[9px] tracking-wider uppercase transition cursor-pointer flex items-center justify-center gap-1.5"
                id="lnk-vault-logout"
              >
                <Lock className="w-3 h-3 text-red-500" /> Terminate Session
              </button>
            </div>

            <div className="text-[8px] font-mono text-slate-600 leading-normal uppercase">
              Clearance Level: {user?.role?.toUpperCase()} • Node CP-4290
            </div>
          </div>

        </div>
      </aside>

      {/* Primary Main Workspace Wrapper */}
      <div className="flex-1 xl:pl-72 flex flex-col min-h-screen" id="applet-primary-layout">
        
        {/* Industry-Level Upper Header Control panel (TOP NAVBAR) */}
        <header className="sticky top-0 bg-[#020617]/90 backdrop-blur-md border-b border-slate-905 z-30 p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4" id="applet-primary-header">
          
          {/* Brand/Network Info & Collapsible Trigger */}
          <div className="flex items-center justify-between sm:justify-start gap-4" id="header-brand-box">
            <div className="flex items-center gap-3">
              {/* Mobile Sidebar Trigger */}
              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="xl:hidden p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                id="btn-mobile-menu-trigger"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-[pulse_1.5s_infinite]"></span>
                <div>
                  <h1 className="text-xs font-black font-mono tracking-widest text-slate-100 uppercase leading-none">
                    National Traffic Intelligence Network
                  </h1>
                  <span className="text-[8px] font-bold text-slate-500 font-mono tracking-widest block mt-0.5">FEDERAL LAW ENFORCEMENT LABS</span>
                </div>
              </div>
            </div>
          </div>

          {/* Centralized Shared City Switcher (Navbar Indicator) */}
          <div className="flex items-center flex-wrap sm:flex-nowrap gap-3 font-mono text-xs" id="header-center-controls">
            
            <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 border border-slate-855 rounded-xl">
              <span className="text-slate-500 uppercase text-[8px] font-bold px-1.5 shrink-0">Command Sector:</span>
              <select
                value={selectedCityId}
                onChange={(e) => setSelectedCityId(e.target.value)}
                className="bg-slate-900 border-none outline-none font-bold text-cyan-400 text-[10px] py-1 px-2.5 rounded-lg cursor-pointer"
                id="header-city-switcher"
              >
                <option value="del">Delhi NCR Region</option>
                <option value="blr">Bengaluru Tech Link</option>
                <option value="bom">Mumbai Marine Portal</option>
                <option value="maa">Chennai Coast Loop</option>
                <option value="hyd">Hyderabad Citadel Node</option>
              </select>
            </div>

            {/* AI Decisive pulse status index */}
            <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-2 border border-slate-850 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider flex items-center gap-1">
                AI Status: <span className="text-emerald-400">Decisive Node</span>
              </span>
            </div>
          </div>

          {/* Clock Ticker, Bell notification, Profile Avatar */}
          <div className="flex items-center justify-between sm:justify-end gap-3 font-mono text-xs" id="header-right-desk">
            
            <span className="hidden lg:flex items-center gap-1.5 text-xs text-slate-405 shrink-0">
              <Calendar className="w-4 h-4 text-slate-600" /> <span className="text-slate-200 font-bold">{currentTime}</span>
            </span>

            <div className="flex items-center gap-2">
              {/* Bells notification with count badge */}
              <button 
                className="p-2 bg-slate-950/60 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition relative cursor-pointer border border-slate-850"
                id="btn-header-bell"
                title="Municipal Alert Notifications Feed"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-[8px] font-black text-white flex items-center justify-center animate-pulse border border-slate-900">
                  4
                </span>
              </button>

              {/* Avatar indicator */}
              <div className="flex items-center gap-2 bg-slate-950/60 h-8 pl-2 pr-3 border border-slate-850 rounded-xl select-none">
                <div className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                  <UserIcon className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <span className="text-[9px] font-black text-slate-300 hidden md:block">RAJESH KUMAR</span>
              </div>
            </div>

          </div>

        </header>

        {/* Dynamic Inner Workspace */}
        <main className="flex-1 p-5 md:p-6 lg:p-7 overflow-y-auto" id="applet-viewport-main">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-20" id="app-loading-pane">
              <RefreshCw className="w-8 h-8 animate-spin text-cyan-400 mb-2" />
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest animate-pulse">Initializing Cyber Traffic Grid...</span>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="h-full"
                id={`dashboard-anchor-slot-${activeTab}`}
              >
                {activeTab === 0 && (
                  <DashboardHome 
                    user={user} 
                    alerts={alerts} 
                    rules={rules} 
                    onNavigate={(tabIdx) => setActiveTab(tabIdx)}
                    refreshDb={fetchDbState}
                    selectedCityId={selectedCityId}
                    setSelectedCityId={setSelectedCityId}
                  />
                )}
                {activeTab === 1 && (
                  <DashboardLegalAssistant 
                    user={user}
                    chatHistory={chatHistory}
                    onAddMessage={async (msg) => {
                      const response = await fetch('/api/chat/ask', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message: msg.content })
                      });
                      const data = await response.json();
                      fetchDbState();
                      return data.message;
                    }}
                    onClearHistory={handleClearHistory}
                  />
                )}
                {activeTab === 2 && (
                  <DashboardChallanScanner 
                    challans={challans}
                    onAddNewChallan={handleAddNewChallan}
                    onRefresh={fetchDbState}
                  />
                )}
                {activeTab === 3 && (
                  <DashboardTrafficAnalytics 
                    challans={challans}
                  />
                )}
                {activeTab === 4 && (
                  <DashboardEmergency 
                    user={user}
                    emergencies={emergencies}
                  />
                )}
                {activeTab === 5 && (
                  <DashboardAdmin 
                    user={user}
                    stats={stats}
                    rules={rules}
                    onAddNewRule={handleAddNewRule}
                    onUpdateRole={handleUpdateRole}
                  />
                )}
                {activeTab === 6 && (
                  <DashboardCitizenRecords />
                )}
                {activeTab === 7 && (
                  <DashboardSurveillanceLogs />
                )}
                {activeTab === 8 && (
                  <DashboardSettings user={user} />
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </main>

      </div>
    </div>
  );
}
