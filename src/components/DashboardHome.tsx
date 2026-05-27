/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, Activity, MapPin, AlertTriangle, ShieldCheck, 
  Compass, Zap, RefreshCw, Eye, Heart, Ambulance, Truck, Shield, 
  TrendingUp, Layers, CheckCircle, Bell, User as UserIcon, AlertOctagon,
  Radar, HelpCircle, HardHat, Sparkles, Send, Flame, ChevronRight, Info, X
} from 'lucide-react';
import { User, AlertNotification, LawSection } from '../types.ts';

interface DashboardHomeProps {
  user: User;
  alerts: AlertNotification[];
  rules: LawSection[];
  onNavigate: (dashboardIndex: number) => void;
  refreshDb: () => void;
  selectedCityId: string;
  setSelectedCityId: (id: string) => void;
}

// Full smart cities geographical mock database
interface CityTelemetry {
  id: string;
  name: string;
  lat: number;
  lng: number;
  activeIncidents: number;
  complianceRatio: number;
  activeRescueUnits: number;
  trafficLoad: 'Low' | 'Moderate' | 'Heavy' | 'Critical';
  mapNodes: {
    id: string;
    name: string;
    type: 'hotspots' | 'police' | 'trauma' | 'hospitals' | 'rescue';
    info: string;
    riskScore: number;
    x: number; // Percentage coordinate inside map box
    y: number; // Percentage coordinate inside map box
  }[];
}

const METRO_CITIES: CityTelemetry[] = [
  {
    id: 'del',
    name: 'Delhi NCR',
    lat: 28.6139,
    lng: 77.2090,
    activeIncidents: 14,
    complianceRatio: 84,
    activeRescueUnits: 8,
    trafficLoad: 'Critical',
    mapNodes: [
      { id: 'del-1', name: 'Connaught Place Circle', type: 'police', info: 'Naka Speed Check & Breathalyzer Unit Active', riskScore: 42, x: 50, y: 48 },
      { id: 'del-2', name: 'Delhi-Gurgaon Toll Plaza (NH-48)', type: 'hotspots', info: 'Critical Congestion: 12-minute commute delays', riskScore: 92, x: 25, y: 75 },
      { id: 'del-3', name: 'AIIMS Flyover Intersection', type: 'trauma', info: 'Emergency Green Corridor cleared for Ambulance 4', riskScore: 68, x: 55, y: 65 },
      { id: 'del-4', name: 'DND Flyway Gate 4', type: 'police', info: 'Laser Speed Camera intercept enabled', riskScore: 35, x: 80, y: 60 },
      { id: 'del-5', name: 'Signature Bridge Loop', type: 'hotspots', info: 'Aggressive weaving flagged by camera node 9', riskScore: 78, x: 70, y: 22 }
    ]
  },
  {
    id: 'blr',
    name: 'Bengaluru Tech Core',
    lat: 12.9716,
    lng: 77.5946,
    activeIncidents: 22,
    complianceRatio: 78,
    activeRescueUnits: 12,
    trafficLoad: 'Heavy',
    mapNodes: [
      { id: 'blr-1', name: 'Silk Board Junction Underpass', type: 'hotspots', info: 'Gridlock Warning: Average vehicle speed 4 KM/H', riskScore: 98, x: 45, y: 70 },
      { id: 'blr-2', name: 'Outer Ring Road (Marathahalli)', type: 'police', info: 'Two-Wheeler Lane Management enforcement checkpoint', riskScore: 65, x: 80, y: 50 },
      { id: 'blr-3', name: 'Electronic City Express Phase 1', type: 'trauma', info: 'Trauma response interceptor deployed', riskScore: 50, x: 55, y: 85 },
      { id: 'blr-4', name: 'Hebbal Flyover Ingress', type: 'hotspots', info: 'Three-way merge buffer queue overflowing', riskScore: 84, x: 52, y: 25 },
      { id: 'blr-5', name: 'MG Road Metro Boulevard', type: 'police', info: 'Smart Surveillance cameras monitoring helmet compliance', riskScore: 28, x: 40, y: 45 }
    ]
  },
  {
    id: 'bom',
    name: 'Mumbai Marine Link',
    lat: 19.0760,
    lng: 72.8777,
    activeIncidents: 16,
    complianceRatio: 88,
    activeRescueUnits: 10,
    trafficLoad: 'Moderate',
    mapNodes: [
      { id: 'bom-1', name: 'Bandra-Worli Sea Link Entrance', type: 'police', info: 'ANPR smart camera radar tracking over-speeding', riskScore: 24, x: 20, y: 45 },
      { id: 'bom-2', name: 'Western Express Highway (WEH)', type: 'hotspots', info: 'Waterlogging risk warning on low shoulder lanes', riskScore: 80, x: 30, y: 20 },
      { id: 'bom-3', name: 'Sion Circle Interchange', type: 'accidents' as any, info: 'Heavy multi-axle freight vehicles merging', riskScore: 88, x: 60, y: 55 },
      { id: 'bom-4', name: 'Lower Parel Ridge', type: 'trauma', info: 'Dedicated response ambulance unit staged', riskScore: 40, x: 25, y: 72 },
      { id: 'bom-5', name: 'Eastern Freeway Gateway', type: 'police', info: 'Dynamic cargo mass sensor terminal calibrated', riskScore: 45, x: 75, y: 65 }
    ]
  },
  {
    id: 'maa',
    name: 'Chennai Coast System',
    lat: 13.0827,
    lng: 80.2707,
    activeIncidents: 9,
    complianceRatio: 89,
    activeRescueUnits: 7,
    trafficLoad: 'Low',
    mapNodes: [
      { id: 'maa-1', name: 'Adyar Cloverleaf Junction', type: 'police', info: 'RTO speed checking unit deployed near IIT entrance', riskScore: 30, x: 45, y: 65 },
      { id: 'maa-2', name: 'East Coast Road (ECR) Sec 4', type: 'hotspots', info: 'Slight hazard: cross-gust high winds warnings', riskScore: 72, x: 70, y: 80 },
      { id: 'maa-3', name: 'Mount Road Chennai Central', type: 'trauma', info: 'Multi-specialty emergency support node synced', riskScore: 35, x: 50, y: 35 },
      { id: 'maa-4', name: 'OMR Tech Corridor Gate 2', type: 'police', info: 'Lane compliance rating scanner operational', riskScore: 20, x: 55, y: 75 },
      { id: 'maa-5', name: 'Kathipara Cloverleaf Bridge', type: 'hotspots', info: 'Peak transit load leveling down smoothly', riskScore: 55, x: 30, y: 55 }
    ]
  },
  {
    id: 'hyd',
    name: 'Hyderabad Citadel Node',
    lat: 17.3850,
    lng: 78.4867,
    activeIncidents: 11,
    complianceRatio: 82,
    activeRescueUnits: 6,
    trafficLoad: 'Moderate',
    mapNodes: [
      { id: 'hyd-1', name: 'Gachibowli Outer Ring Road', type: 'police', info: 'Laser sensor tracking 120km/h overspeeding violations', riskScore: 65, x: 20, y: 35 },
      { id: 'hyd-2', name: 'Madhapur Hitex Flyover Junction', type: 'hotspots', info: 'High-density tech commute congestion backlogs', riskScore: 78, x: 28, y: 50 },
      { id: 'hyd-3', name: 'Charminar Heritage Plaza', type: 'police', info: 'Active visual pedestrian safety buffer boundary established', riskScore: 22, x: 60, y: 75 },
      { id: 'hyd-4', name: 'Begumpet Underpass Station', type: 'trauma', info: 'Water level safety sensor calibrated online', riskScore: 40, x: 50, y: 30 },
      { id: 'hyd-5', name: 'Secunderabad Terminal link', type: 'hotspots', info: 'Bus and rail commuter transit merger queue active', riskScore: 68, x: 75, y: 25 }
    ]
  }
];

export default function DashboardHome({ user, alerts, rules, onNavigate, refreshDb, selectedCityId, setSelectedCityId }: DashboardHomeProps) {
  // Cities State
  const [mapFilter, setMapFilter] = useState<'all' | 'hotspots' | 'police' | 'trauma'>('all');
  const [loading, setLoading] = useState(false);
  const [activeAlertIndex, setActiveAlertIndex] = useState(0);
  const [sysTime, setSysTime] = useState<string>('2026-05-27 06:40:00 UTC');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Quick reporting Violations form state
  const [reportingViolation, setReportingViolation] = useState(false);
  const [reportForm, setReportForm] = useState({
    vehicleNo: '',
    violationType: 'Speeding',
    location: '',
    notes: ''
  });
  const [reportInjectedMsg, setReportInjectedMsg] = useState(false);

  // Selected City Details
  const activeCity = METRO_CITIES.find(c => c.id === selectedCityId) || METRO_CITIES[0];

  useEffect(() => {
    // Dynamic Clock Ticker
    const timer = setInterval(() => {
      const now = new Date();
      setSysTime(now.getUTCFullYear() + '-' + 
        String(now.getUTCMonth() + 1).padStart(2,'0') + '-' + 
        String(now.getUTCDate()).padStart(2,'0') + ' ' + 
        String(now.getUTCHours()).padStart(2,'0') + ':' + 
        String(now.getUTCMinutes()).padStart(2,'0') + ':' + 
        String(now.getUTCSeconds()).padStart(2,'0') + ' UTC'
      );
    }, 1000);

    // Auto-scroll Ticker alert pointer
    const alertTimer = setInterval(() => {
      setActiveAlertIndex(prev => (prev + 1) % SCROLLING_ALERTS.length);
    }, 4500);

    return () => {
      clearInterval(timer);
      clearInterval(alertTimer);
    };
  }, []);

  const handleSimulateUpdate = () => {
    setLoading(true);
    setTimeout(() => {
      refreshDb();
      setLoading(false);
    }, 800);
  };

  const handleReportViolationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReportInjectedMsg(true);
    setTimeout(() => {
      setReportingViolation(false);
      setReportForm({ vehicleNo: '', violationType: 'Speeding', location: '', notes: '' });
      setReportInjectedMsg(false);
    }, 2000);
  };

  // Authentic live alert warnings ticker
  const SCROLLING_ALERTS = [
    { text: "CRITICAL WATER ACCUMULATION ACCUMULATED UNDER SILK BOARD BRIDGE - SPEEDS LIMITED TO 10KM/H", level: "critical", time: "10s ago", state: "KA" },
    { text: "AI SURVEILLANCE RADAR DETECTED COMPLIANCE DROPOUT RATE SWELLING 14% ON ADYAR LOOP HIGHWAY", level: "warning", time: "2m ago", state: "TN" },
    { text: "EMERGENCY REASSURANCE TRANSIT PASS CORRIDOR ESTABLISHED FOR TRAUMA MED-AMBULANCE 09 EXTINGUISHING CHANNELS ON NH-8", level: "info", time: "4m ago", state: "DL" },
    { text: "INTOXICATION ENFORCEMENT STRIKE TEAM ACTIVE AT JUBILEE HILLS SECTOR 4 CHECKPOINT - AP MV ACT CLAUSE 185", level: "warning", time: "8m ago", state: "TS" },
    { text: "CITIZEN SAFETY COMPLIANCE EXCELLED IN CENTRAL REGION BLOCK; OVERALL INDEX TOUCHE 91.5% SECURE", level: "compliance", time: "12m ago", state: "GOV" }
  ];

  // AI Surveillance System Real-time events mock queue
  const SURVEILLANCE_EVENTS = [
    { stamp: "06:33:14", text: "Plate MH-12-PQ-9032 triggered Lane Cutting Section 184", score: 94, level: "High" },
    { stamp: "06:29:40", text: "Helmet absent detected on DL-3C-CA-4952 rider by Cam_A8_CP", score: 85, level: "Medium" },
    { stamp: "06:24:08", text: "Unauthorized heavy logistics cargo trailer bypassed toll boundary", score: 98, level: "Critical" },
    { stamp: "06:18:55", text: "Verified security token signed for NIC translink audit", score: 12, level: "Low" }
  ];

  const filteredMapNodes = activeCity.mapNodes.filter(node => {
    if (mapFilter === 'all') return true;
    return node.type === mapFilter;
  });

  return (
    <div className="space-y-6 relative" id="governance-hq-root">
      
      {/* Visual background atmospheric enhancements: Scan lines & radar sweeps */}
      <div className="absolute inset-x-0 top-[-20px] h-[300px] bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none -z-10 blur-xl"></div>
      <div className="absolute top-10 right-10 w-[400px] h-[400px] border border-cyan-500/[0.02] rounded-full pointer-events-none -z-10 animate-[spin_50s_linear_infinite]"></div>
      
      {/* Scrolling Ticker Line */}
      <div className="bg-slate-950 border-y border-slate-800/80 p-2.5 overflow-hidden flex items-center gap-3 w-full rounded-xl" id="cyber-ticker-bar">
        <span className="shrink-0 text-[10px] font-mono font-bold tracking-widest text-cyan-400 bg-cyan-700/10 border border-cyan-500/25 px-2 py-0.5 rounded animate-pulse uppercase flex items-center gap-1">
          <Radar className="w-3.5 h-3.5 text-cyan-400" /> LIVE TELEMETRY STREAM
        </span>
        <div className="relative flex-1 h-5 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeAlertIndex}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="absolute inset-0 flex items-center justify-between text-[11px] font-mono text-slate-300"
            >
              <span className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  SCROLLING_ALERTS[activeAlertIndex].level === 'critical' ? 'bg-rose-500 animate-ping' :
                  SCROLLING_ALERTS[activeAlertIndex].level === 'warning' ? 'bg-amber-550' :
                  SCROLLING_ALERTS[activeAlertIndex].level === 'compliance' ? 'bg-emerald-400' : 'bg-blue-400'
                }`}></span>
                <span className="font-extrabold text-slate-100 uppercase tracking-tight">[{SCROLLING_ALERTS[activeAlertIndex].state}]</span>
                <span className="line-clamp-1">{SCROLLING_ALERTS[activeAlertIndex].text}</span>
              </span>
              <span className="text-[10px] text-slate-500 shrink-0 font-medium">{SCROLLING_ALERTS[activeAlertIndex].time}</span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Cyber-Tactical Governance Hero Banner with Safety dial */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="military-hero-structure">
        
        {/* Left Aspect: Statement & Telemetry Lines */}
        <div className="lg:col-span-2 p-7 bg-slate-900/40 border border-slate-800 rounded-2xl relative overflow-hidden flex flex-col justify-between" id="platform-banner-left">
          <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-500/[0.02] rounded-br-full blur-2xl pointer-events-none"></div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-600/[0.02] rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-widest uppercase font-mono bg-cyan-500/10 text-cyan-400 px-2.5 py-1 rounded-md border border-cyan-500/20 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> STATE INTERFACE ACTIVE
              </span>
              <span className="text-[10px] tracking-widest uppercase font-mono text-slate-500">Node Secure Translink SSL: 3000</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
                AI-Powered National Traffic Governance Platform
              </h1>
              <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Welcome to <span className="text-cyan-400 font-bold font-mono">DrivesLegal HQ</span>, a military-grade municipal enforcement framework. Synced live with state RTO registries and emergency trauma rooms, we monitor traffic safety margins, automate OCR ticket audit authentications, and power predictive hazard avoidance.
              </p>
            </div>

            {/* Hover Telemetry Lines representation */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80 font-mono text-xs">
              <div className="p-3 bg-slate-950/45 rounded-xl border border-slate-850">
                <span className="text-slate-500 text-[10px] block uppercase">Network Tunnels</span>
                <span className="text-slate-200 block font-bold mt-0.5">24 Connected</span>
                <span className="text-[9px] text-emerald-400 flex items-center gap-0.5 mt-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Safe Latency
                </span>
              </div>
              <div className="p-3 bg-slate-950/45 rounded-xl border border-slate-850">
                <span className="text-slate-500 text-[10px] block uppercase">NIC Registry DB</span>
                <span className="text-slate-200 block font-bold mt-0.5">Synced Live</span>
                <span className="text-[9px] text-cyan-400 mt-1 font-semibold">↳ 10 Central MV Laws</span>
              </div>
              <div className="p-3 bg-slate-950/45 rounded-xl border border-slate-850">
                <span className="text-slate-500 text-[10px] block uppercase">Sensor Latency</span>
                <span className="text-slate-200 block font-bold mt-0.5">8 ms</span>
                <span className="text-[9px] text-emerald-400 mt-1 font-semibold">● OPTIMAL RATIO</span>
              </div>
              <div className="p-3 bg-slate-950/45 rounded-xl border border-slate-850">
                <span className="text-slate-500 text-[10px] block uppercase">Target Horizon</span>
                <span className="text-slate-200 block font-bold mt-0.5">5 Metros Linked</span>
                <span className="text-[9px] text-purple-400 mt-1 font-semibold">↳ Heatmaps Online</span>
              </div>
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-500 mt-4 flex items-center gap-1.5 uppercase tracking-wide">
            <Activity className="w-4 h-4 text-cyan-400 animate-pulse" /> Live System Timestamp ticker: <span className="text-slate-300 font-bold">{sysTime}</span>
          </div>
        </div>

        {/* Right Aspect: Premium Safety Score Radial Dial */}
        <div className="p-7 bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col items-center justify-between text-center relative overflow-hidden" id="platform-banner-right">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/[0.02] rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="w-full text-left flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-cyan-400 animate-pulse" /> SECURE INDEX ASSAYER
            </h2>
            <span className="text-[9px] font-mono text-slate-500 uppercase">{user.name.split(' ')[0]} G1</span>
          </div>

          {/* Animated 3D-Style Rotating Rings Safety Dial */}
          <div className="relative my-4 flex items-center justify-center h-40 w-40" id="tactical-safety-dial">
            {/* Pulsing Outer Neon Ring */}
            <div className="absolute inset-0 rounded-full border border-dashed border-cyan-500/15 animate-[spin_40s_linear_infinite]"></div>
            <div className="absolute inset-2 rounded-full border-2 border-slate-800/40"></div>
            
            {/* Rotator Ring Graphic */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90 scale-95">
              <circle
                cx="80"
                cy="80"
                r="68"
                stroke="#091524"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r="68"
                stroke="url(#neonScoreGrad)"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 68}
                strokeDashoffset={2 * Math.PI * 68 * (1 - user.safetyScore / 100)}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]"
              />
              <defs>
                <linearGradient id="neonScoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00e5ff" />
                  <stop offset="50%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
            </svg>

            {/* Dial Center Overlay Text */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-lg font-mono font-extrabold text-cyan-400 uppercase tracking-widest text-[9px]">YOUR SECURE RATING</span>
              <span className="text-5xl font-black text-white font-mono tracking-tighter filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{user.safetyScore}%</span>
              <span className="text-[8px] uppercase font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10 mt-1">Grade Alpha</span>
            </div>
          </div>

          {/* Stats Breakdown */}
          <div className="w-full grid grid-cols-3 gap-2 p-2 bg-slate-950/60 rounded-xl border border-slate-850 text-left font-mono text-[10px]">
            <div>
              <span className="text-slate-500 block uppercase font-bold text-[8px]">Penalty Points</span>
              <span className="text-xs font-extrabold text-amber-400">02 Points</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-bold text-[8px]">Compliance</span>
              <span className="text-xs font-extrabold text-emerald-400">{user.complianceRating}%</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-bold text-[8px]">Risk Offset</span>
              <span className="text-xs font-extrabold text-rose-500">18% Ratio</span>
            </div>
          </div>
        </div>

      </div>

      {/* Cyber Smart City Interactive Map Module Panel */}
      <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-4" id="smart-city-map-container">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold tracking-wider text-cyan-400 uppercase font-mono flex items-center gap-2">
              <Compass className="w-5 h-5 text-rose-400" /> Smart Cities Real-time Surveillance Arena
            </h2>
            <p className="text-xs text-slate-400 mt-1">Tactical satellite interface mapping municipal check-points, accident hotspots, active emergency corridors, and speed sensors.</p>
          </div>

          {/* Combined City Switchers and Toggle Filters */}
          <div className="flex flex-wrap items-center gap-2" id="map-controls-group">
            
            {/* City Selector */}
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 font-mono text-[10px]">
              {METRO_CITIES.map(city => (
                <button
                  key={city.id}
                  onClick={() => setSelectedCityId(city.id)}
                  className={`px-2.5 py-1.5 rounded transition font-bold uppercase cursor-pointer ${
                    selectedCityId === city.id 
                      ? 'bg-gradient-to-r from-cyan-500/10 to-blue-600/10 text-cyan-400 border border-cyan-500/20 shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {city.name.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Overlay Layers Filter Selector */}
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 font-mono text-[10px]">
              {[
                { id: 'all', label: 'All Layers' },
                { id: 'hotspots', label: 'Accident Hotspots' },
                { id: 'police', label: 'Checkpoints' },
                { id: 'trauma', label: 'Ambulance Units' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setMapFilter(opt.id as any)}
                  className={`px-2.5 py-1.5 rounded transition capitalize cursor-pointer ${
                    mapFilter === opt.id 
                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20 font-bold' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* Tactical Map Canvas */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6" id="map-canvas-structure">
          
          {/* Main Visual Arena Grid */}
          <div className="xl:col-span-3 h-[380px] bg-slate-950/85 border border-slate-850 rounded-xl relative overflow-hidden flex items-center justify-center border border-slate-800 shadow-inner" id="visual-map-arena">
            {/* Custom radar scope scanning overlay */}
            <div className="absolute inset-0 bg-[#020617] opacity-60 pointer-events-none"></div>
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-35"></div>
            
            {/* Scanner Sweep effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/0 via-cyan-500/0 to-cyan-500/5 origin-center animate-[spin_10s_linear_infinite] pointer-events-none"></div>

            {/* Central Radar concentric warning rings */}
            <div className="absolute w-[450px] h-[450px] border-2 border-slate-900/30 rounded-full animate-pulse"></div>
            <div className="absolute w-[250px] h-[250px] border border-cyan-500/5 rounded-full"></div>
            <div className="absolute w-[100px] h-[100px] border border-dashed border-rose-550/10 rounded-full pointer-events-none"></div>

            {/* Geographical Vectors representation */}
            <svg className="absolute inset-0 w-full h-full text-slate-800/20 pointer-events-none" viewBox="0 0 800 380" preserveAspectRatio="none">
              <path d="M0,190 C200,90 400,290 600,190 T800,190" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="8,8" />
              <path d="M100,0 L120,380" fill="none" stroke="currentColor" strokeWidth="1" />
              <path d="M500,0 L510,380" fill="none" stroke="currentColor" strokeWidth="1" />
              <circle cx="400" cy="190" r="120" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" />
            </svg>

            {/* Dynamic Interactive City coordinates nodes */}
            <div className="absolute inset-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedCityId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full relative"
                  id={`metro-overlay-${selectedCityId}`}
                >
                  {/* Central Node HUD label marker */}
                  <div className="absolute left-6 top-6 text-[10px] uppercase font-mono p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1 z-1 pointer-events-none tracking-wider shadow-xl max-w-sm">
                    <span className="text-cyan-400 font-black block">COMMAND DESK TERMINAL</span>
                    <span className="text-slate-300 block">Metropolitan: {activeCity.name}</span>
                    <span className="text-slate-500 block">Radar Intercept: {activeCity.lat.toFixed(4)}°N, {activeCity.lng.toFixed(4)}°E</span>
                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/10 px-1.5 py-0.5 rounded inline-block mt-2">
                      Active Rescues: {activeCity.activeRescueUnits} Units
                    </span>
                  </div>

                  {filteredMapNodes.map((node) => {
                    const isHovered = hoveredNodeId === node.id;
                    const styleMapColor = 
                      node.type === 'police' ? 'bg-blue-500' :
                      node.type === 'hotspots' ? 'bg-amber-500' :
                      node.type === 'trauma' ? 'bg-purple-500' : 'bg-emerald-500';

                    const borderGlow =
                      node.type === 'police' ? 'border-blue-500/30 text-blue-400' :
                      node.type === 'hotspots' ? 'border-amber-500/30 text-amber-400' :
                      node.type === 'trauma' ? 'border-purple-500/30 text-purple-400' : 'border-emerald-500/30 text-emerald-400';

                    return (
                      <div 
                        key={node.id}
                        className="absolute cursor-pointer select-none"
                        style={{ left: `${node.x}%`, top: `${node.y}%` }}
                        onMouseEnter={() => setHoveredNodeId(node.id)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                      >
                        <div className="relative group/node">
                          {/* Pulse wave ring */}
                          <span className="flex h-5 w-5 relative">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${styleMapColor}`}></span>
                            <span className={`relative inline-flex rounded-full h-5 w-5 border border-slate-950 flex items-center justify-center text-[7px] font-bold font-mono text-white ${styleMapColor}`}>
                              {node.riskScore}
                            </span>
                          </span>

                          {/* Float visual card HUD */}
                          <div className={`absolute bottom-7 left-1/2 transform -translate-x-1/2 w-52 p-3 bg-slate-950 border ${borderGlow} rounded-xl text-[10px] font-mono pointer-events-none transition-all duration-200 z-10 shadow-2xl ${
                            isHovered ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-1'
                          }`}>
                            <div className="font-bold flex items-center justify-between border-b border-slate-800 pb-1 mb-1 bg-slate-950">
                              <span className="text-slate-100 line-clamp-1">{node.name}</span>
                              <span className="text-[8px] uppercase tracking-wider px-1 bg-slate-900 rounded">{node.type}</span>
                            </div>
                            <span className="text-slate-300 block leading-relaxed">{node.info}</span>
                            <span className="text-[9px] text-cyan-400 block mt-1 font-bold">↳ Hazard Index: {node.riskScore}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>
            
          </div>

          {/* Right Metrics Sidebar Digest within Map panel */}
          <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl flex flex-col justify-between" id="map-tactical-metrics">
            <div className="space-y-4">
              <span className="text-xs uppercase font-mono tracking-widest text-slate-400 font-extrabold block border-b border-slate-900 pb-2">HQ METRO CONSOLE</span>
              
              <div className="space-y-3 font-mono text-[10px] leading-relaxed">
                <div className="border-l-2 border-slate-700 pl-3">
                  <span className="text-slate-500 block uppercase">Selected Jurisdiction</span>
                  <span className="text-slate-200 font-bold">{activeCity.name} Portal</span>
                </div>
                <div className="border-l-2 border-slate-705 pl-3">
                  <span className="text-slate-500 block uppercase">Traffic Congestion Index</span>
                  <span className={`font-extrabold uppercase ${
                    activeCity.trafficLoad === 'Critical' ? 'text-rose-400' :
                    activeCity.trafficLoad === 'Heavy' ? 'text-amber-400' : 'text-emerald-400'
                  }`}>{activeCity.trafficLoad} load</span>
                </div>
                <div className="border-l-2 border-slate-705 pl-3">
                  <span className="text-slate-500 block uppercase">Metro Compliance Tally</span>
                  <span className="text-indigo-400 font-bold">{activeCity.complianceRatio}% Total Score</span>
                </div>
                <div className="border-l-2 border-slate-705 pl-3">
                  <span className="text-slate-500 block uppercase">Active Incident Nodes</span>
                  <span className="text-rose-500 font-bold">{activeCity.activeIncidents} Incidents Flagged</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-850 text-[9.5px] font-mono text-slate-500 mt-4 leading-normal">
              <span className="text-slate-400 font-bold block mb-1 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> METRO RECOMMENDATION:
              </span>
              RTO patrols must execute lane containment near {METRO_CITIES.find(c => c.id === selectedCityId)?.mapNodes[0].name.split(' (')[0] || 'artery loop'}.
            </div>
          </div>

        </div>
      </div>

      {/* Cyber tactical quick action panels */}
      <div className="space-y-3" id="quick-action-zone">
        <label className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold block">Tactical Gateway Rapid Controls:</label>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3" id="quick-actions-grid">
          {[
            { tag: "Scan e-Challan", desc: "OCR Verification", tab: 2, icon: ShieldAlert, border: "hover:border-blue-500/30 hover:bg-blue-500/5 text-blue-400" },
            { tag: "Report Infraction", desc: "Citizen Logging", action: () => setReportingViolation(true), icon: AlertTriangle, border: "hover:border-rose-500/30 hover:bg-rose-500/5 text-rose-400" },
            { tag: "AI Case Counselor", desc: "MV Act Advisory", tab: 1, icon: Compass, border: "hover:border-purple-500/30 hover:bg-purple-500/5 text-purple-400" },
            { tag: "Emergency SOS", desc: "Dispatch Rescue", tab: 4, icon: Heart, border: "hover:border-red-500/35 hover:bg-red-500/5 text-red-400" },
            { tag: "Compliance Report", desc: "Print Records", tab: 3, icon: CheckCircle, border: "hover:border-emerald-500/30 hover:bg-emerald-500/5 text-emerald-400" },
            { tag: "Database Enactments", desc: "Statutory Admin", tab: 5, icon: Zap, border: "hover:border-cyan-500/30 hover:bg-cyan-500/5 text-cyan-400" }
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <button
                key={idx}
                onClick={() => {
                  if (card.tab !== undefined) onNavigate(card.tab);
                  else if (card.action) card.action();
                }}
                className={`p-4 bg-slate-950/60 border border-slate-850 rounded-xl transition-all duration-300 text-left relative overflow-hidden flex flex-col justify-between h-[115px] cursor-pointer group hover:translate-y-[-2px] ${card.border}`}
                id={`quick-gate-button-${idx}`}
              >
                <div className="absolute top-0 right-0 w-12 h-12 bg-slate-900/20 rounded-full group-hover:scale-110 transition-transform"></div>
                <Icon className="w-5 h-5 mb-1" />
                <div>
                  <span className="text-xs font-bold text-slate-105 block group-hover:text-white transition">{card.tag}</span>
                  <span className="text-[9px] text-slate-500 font-mono mt-0.5 block line-clamp-1">{card.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Structured Citizen reporting Violation Modal */}
      <AnimatePresence>
        {reportingViolation && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-mono" id="reporters-viol-modal">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
                  <span className="text-xs font-bold tracking-widest text-white uppercase">REPORT CITIZEN INFRACTION</span>
                </div>
                <button 
                  onClick={() => setReportingViolation(false)}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {reportInjectedMsg ? (
                <div className="py-12 text-center space-y-3">
                  <CheckCircle className="w-12 h-12 text-emerald-400 animate-bounce mx-auto" />
                  <h4 className="text-xs uppercase font-extrabold text-white">INFRACTION FILED SECURELY</h4>
                  <p className="text-[11px] text-slate-405 leading-relaxed">
                    National highway surveillance index has captured report parameters. NIC node translink sync will review camera timestamps immediately.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleReportViolationSubmit} className="space-y-4 text-xs font-mono">
                  <div className="space-y-1">
                    <label className="text-slate-500 text-[10px] block uppercase font-bold">Plate Registration Number:</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., DL-3C-CA-4952"
                      value={reportForm.vehicleNo}
                      onChange={(e) => setReportForm({ ...reportForm, vehicleNo: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-850 rounded-xl outline-none text-slate-100 placeholder-slate-600 uppercase"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-500 text-[10px] block uppercase font-bold">Apparent Violation Code:</label>
                    <select
                      value={reportForm.violationType}
                      onChange={(e) => setReportForm({ ...reportForm, violationType: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-850 rounded-xl outline-none text-slate-200"
                    >
                      <option value="Speeding">Speed Boundaries Violation (Section 183)</option>
                      <option value="No Helmet">Absent Head Gear / Safety Helmet (Section 194D)</option>
                      <option value="Drunk Driving">Intoxicated Transit Control Loss (Section 185)</option>
                      <option value="Wrong Side">Dangerous Wrong-Side Merges (Section 184)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-500 text-[10px] block uppercase font-bold">Geotarget Coordinates/Location Name:</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., NH-8 Exit 2, DND Ring intersect"
                      value={reportForm.location}
                      onChange={(e) => setReportForm({ ...reportForm, location: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-850 rounded-xl outline-none text-slate-100 placeholder-slate-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-500 text-[10px] block uppercase font-bold">Additional Memo / Context:</label>
                    <textarea
                      placeholder="Attach speed thresholds details, cargo description, or any physical landmarks observed..."
                      value={reportForm.notes}
                      onChange={(e) => setReportForm({ ...reportForm, notes: e.target.value })}
                      rows={2}
                      className="w-full p-2.5 bg-slate-950 border border-slate-850 rounded-xl outline-none text-slate-100 placeholder-slate-600 resize-none leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-455 hover:to-red-500 font-bold text-xs text-white rounded-xl active:scale-95 transition cursor-pointer"
                  >
                    Commit Offense Alert to Security Hub
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Standard Analytics Row Matrix of Compliance and collection lines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="middle-metrics-layout">
        
        {/* Widget 1: Helmet Compliance Ratio SVG Dial */}
        <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col justify-between h-[255px]" id="compliance-helmet-widget-container">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <HardHat className="w-4 h-4 text-cyan-400" /> Helmet Safety Compliance
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Two-Wheelers</span>
          </div>

          <div className="flex items-center justify-between gap-4 py-3">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="56" cy="56" r="44" stroke="#091421" strokeWidth="8" fill="transparent" />
                <circle 
                  cx="56" 
                  cy="56" 
                  r="44" 
                  stroke="#00e5ff" 
                  strokeWidth="8" 
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 44}
                  strokeDashoffset={2 * Math.PI * 44 * (1 - 0.91)} // 91%
                  strokeLinecap="round"
                  className="drop-shadow-[0_0_4px_rgba(0,229,255,0.4)]"
                />
              </svg>
              <span className="absolute text-xl font-bold text-slate-100 font-mono">91%</span>
            </div>

            <div className="flex-1 font-mono text-[10.5px] leading-relaxed space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Active Riders</span>
                <span className="text-slate-200">91.4% Rate</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pillion Riders</span>
                <span className="text-slate-400">82.1% Rate</span>
              </div>
              <div className="text-[9px] text-emerald-400 italic bg-emerald-950/20 p-2 rounded border border-emerald-950/20 mt-2 block">
                ▲ Up +2.4% past fortnight due to AI radar deployments on loop-ways.
              </div>
            </div>
          </div>

          <span className="text-[9px] font-mono text-slate-550 uppercase tracking-widest block font-semibold">National Compliance Target: 98.0%</span>
        </div>

        {/* Widget 2: Seatbelt Usage Metrics SVG chart representation */}
        <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col justify-between h-[255px]" id="compliance-seatbelt-widget-container">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-purple-400" /> Passenger Seatbelt Check
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Four-Wheelers</span>
          </div>

          <div className="py-2.5 space-y-3 font-mono text-[10px]">
            <div className="space-y-1">
              <div className="flex justify-between items-center text-slate-300">
                <span>Front Cabin Lock Safety Rate</span>
                <span className="text-purple-400 font-bold">82.5%</span>
              </div>
              <div className="w-full h-2 bg-slate-950 border border-slate-850 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" style={{ width: '82.5%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-slate-300">
                <span>Rear Cabin Passenger Compliance</span>
                <span className="text-cyan-400 font-bold">39.0%</span>
              </div>
              <div className="w-full h-2 bg-slate-950 border border-slate-850 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: '39%' }} />
              </div>
            </div>

            <p className="text-[9.5px] text-slate-400 italic leading-relaxed pt-2 border-t border-slate-900 leading-normal">
              Rear-cabin lock rate remains critically low. Police and transport units enacting Section 194B active warnings checking.
            </p>
          </div>

          <span className="text-[9px] font-mono text-slate-550 uppercase block font-semibold">Rear Cabin Warning Fine: ₹1,000</span>
        </div>

        {/* Widget 3: AI Threat & Surveillance flags detection Feed */}
        <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col justify-between h-[255px]" id="compliance-threat-feed">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
              <AlertOctagon className="w-4 h-4 text-rose-450" /> AI Threat Detection Feed
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Surveillance Live</span>
          </div>

          <div className="space-y-2.5 max-h-[145px] overflow-y-auto pr-1">
            {SURVEILLANCE_EVENTS.map((item, idx) => (
              <div key={idx} className="p-2.5 bg-slate-950 rounded-lg space-y-1 font-mono text-[10px] leading-relaxed border border-slate-900">
                <div className="flex items-center justify-between text-[9px]">
                  <span className="text-rose-400 font-bold uppercase">{item.level} Severity</span>
                  <span className="text-slate-500 font-medium">{item.stamp}</span>
                </div>
                <p className="text-slate-300 font-semibold">{item.text}</p>
                <div className="text-slate-500 text-[9px] flex items-center gap-1 justify-between">
                  <span>Confidence rating score:</span>
                  <span className="text-cyan-400 font-black">{item.score}%</span>
                </div>
              </div>
            ))}
          </div>

          <span className="text-[8.5px] font-mono text-slate-600 block uppercase font-bold">↳ Auto-archiving logs stream within 24h</span>
        </div>

      </div>

      {/* Large Bottom Analytics Panels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="bottom-charts-telemetry-grid">
        
        {/* Panel 1: Crash Zone Heatmap Analysis */}
        <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3 font-mono text-[11px] h-[210px] flex flex-col justify-between" id="panel-crash-weight">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-cyan-400 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-400" /> Crash Zone Heatmaps
            </span>
            <span className="text-[10px] uppercase text-rose-500 font-black">Matrix Live</span>
          </div>

          <div className="grid grid-cols-4 gap-2 h-20 text-center font-bold">
            {[
              { label: "Zone Alpha", score: "88%", color: "bg-rose-500/15 text-rose-400 border border-rose-500/10" },
              { label: "Zone Beta", score: "42%", color: "bg-amber-500/15 text-amber-400 border border-amber-500/10" },
              { label: "Zone Gamma", score: "19%", color: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/10" },
              { label: "Zone Delta", score: "68%", color: "bg-rose-500/15 text-rose-400 border border-rose-500/10" }
            ].map((cell, idx) => (
              <div key={idx} className={`p-2 rounded-xl flex flex-col justify-center gap-1 ${cell.color}`}>
                <span className="text-[8px] uppercase tracking-wider block text-slate-400">{cell.label.split(' ')[1]}</span>
                <span className="text-sm font-extrabold">{cell.score}</span>
              </div>
            ))}
          </div>

          <p className="text-[9.5px] text-slate-500 leading-normal">
            * Score denotes high-impact heavy vehicular merger conflicts mapped past 90 days.
          </p>
        </div>

        {/* Panel 2: Traffic Density Analytics */}
        <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3 font-mono text-[11px] h-[210px] flex flex-col justify-between" id="panel-traffic-volume">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-purple-400 flex items-center gap-1.5">
              <Compass className="w-4 h-4" /> Traffic Intensity Streams
            </span>
            <span className="text-[10px] text-slate-500">Live Load</span>
          </div>

          <div className="space-y-2 py-1.5 text-[10px]">
            <div className="flex justify-between text-slate-400">
              <span>Arterial Commute Highways</span>
              <span className="text-slate-200 font-bold">84% Load</span>
            </div>
            <div className="w-full h-1.5 bg-slate-950 border border-slate-850 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500" style={{ width: '84%' }}></div>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Feeder Connector Roadways</span>
              <span className="text-slate-200 font-bold">59% Load</span>
            </div>
            <div className="w-full h-1.5 bg-slate-950 border border-slate-850 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-400" style={{ width: '59%' }}></div>
            </div>
          </div>

          <p className="text-[9px] text-slate-500 italic pt-1 border-t border-slate-900 leading-normal">
            High tech-corridor traffic peak hours expected within 3 hours in Bengaluru and Hyderabad areas.
          </p>
        </div>

        {/* Panel 3: Citizen Compliance Trends Area Curve metric */}
        <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3 font-mono text-[11px] h-[210px] flex flex-col justify-between" id="panel-citizen-curves">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" /> National Safety Graph
            </span>
            <span className="text-[10px] text-slate-500">Quarterly</span>
          </div>

          <div className="h-20 flex items-end gap-1 px-2 border-b border-slate-900 pb-1 justify-between">
            {/* Simple high fidelity CSS bars representing safe compliance growth index */}
            {[25, 42, 38, 55, 62, 79, 84, 91].map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 group/bar relative">
                <div className="w-full bg-gradient-to-t from-emerald-600/60 to-cyan-400 rounded-t h-12 hover:to-white transition-all cursor-pointer" style={{ height: `${(val / 100) * 60}px` }}></div>
                <div className="absolute bottom-16 bg-slate-950 border border-slate-800 px-1 py-0.5 rounded text-[8px] opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {val}% Score
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-[8.5px] text-slate-600 font-mono">
            <span>SEP-25</span>
            <span>NOV-25</span>
            <span>JAN-26</span>
            <span>MAY-26 REGION</span>
          </div>
        </div>

        {/* Panel 4: Emergency Response Performance Indicators */}
        <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3 font-mono text-[11px] h-[210px] flex flex-col justify-between" id="panel-trauma-weight">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-rose-450 flex items-center gap-1.5">
              <Heart className="w-4 h-4" /> Trauma Response Index
            </span>
            <span className="text-[10px] text-rose-500 font-extrabold uppercase">Critical Node</span>
          </div>

          <div className="space-y-2 py-1.5 leading-normal">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[10px]">Average Dispatch Delay:</span>
              <span className="text-white font-extrabold text-xs">4.2 Minutes</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[10px]">Golden Hour Recovery Score:</span>
              <span className="text-emerald-400 font-extrabold text-xs">94.8% (Target 95%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[10px]">Highway SOS Coverage Radius:</span>
              <span className="text-purple-400 font-extrabold text-xs">&lt; 15 km Intercept</span>
            </div>
          </div>

          <p className="text-[9px] text-slate-600 leading-normal uppercase">
            * Real-time GPS coordinates directly connected to 39 trauma nodes.
          </p>
        </div>

      </div>

      {/* Floating Tactical SOS Rescue Alert Buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col sm:flex-row gap-3 font-mono text-xs items-end" id="floating-command-panel">
        <button
          onClick={() => onNavigate(4)} // Connect to ambulance dispatch in emergency tab
          style={{ cursor: 'pointer' }}
          className="p-4 px-5 bg-rose-600 hover:bg-rose-500 text-white rounded-full flex items-center gap-2 shadow-2xl drop-shadow-[0_4px_12px_rgba(239,68,68,0.4)] hover:scale-105 active:scale-95 transition-all outline-none font-extrabold group border border-white"
        >
          <Ambulance className="w-5 h-5 text-white animate-bounce" />
          <span>EMERGENCY SOS SPARK DISPATCH</span>
        </button>
      </div>

    </div>
  );
}
