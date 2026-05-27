/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, TrendingDown, Eye, AlertCircle, ShieldCheck, Timer, Landmark, 
  MapPin, Compass, Shuffle, Info, PieChart, Activity, Sparkles, ChevronRight
} from 'lucide-react';
import { Challan } from '../types.ts';

interface DashboardTrafficAnalyticsProps {
  challans: Challan[];
}

export default function DashboardTrafficAnalytics({ challans }: DashboardTrafficAnalyticsProps) {
  // Region Selection for heatmaps
  const [selectedMetropolitan, setSelectedMetropolitan] = useState<'del' | 'mum' | 'blr' | 'maa'>('del');
  const [hoveredDataPoint, setHoveredDataPoint] = useState<number | null>(null);

  // Hardcoded Indian Metropolitan Traffic intelligence dataset
  const REGIONAL_METRIC_DATA = {
    del: {
      fullName: "Delhi National Capital Territory (NCR)",
      safetyIndex: "84.2%",
      accidentIncidentRate: "Medium-High",
      majorRiskArea: "NH-48 Border & Ring Road Intersection",
      peakAccidentTime: "20:00 - 23:00 (Heavy Night Transit)",
      helmetCompliance: 91,
      seatbeltCompliance: 82,
      reductionTrend: "-14.2% (Past 2 Quarters)",
      heatmapsPoints: [
        { zone: "ITO Crossing Radial", risk: 85, coordinate: "DL-ITO-09", activeAlert: "Active Speed Checks" },
        { zone: "Connaught Circus Outer Ring", risk: 42, coordinate: "DL-CP-14", activeAlert: "High Pedestrian Density" },
        { zone: "Delhi-Gurgaon Highway Border", risk: 94, coordinate: "DL-NH48-02", activeAlert: "Critical Overloading Target" },
        { zone: "Mayur Vihar Tunnel Interchange", risk: 68, coordinate: "DL-DND-11", activeAlert: "Waterlogging Alert" }
      ],
      monthlyFines: [24, 38, 52, 45, 62, 59, 78, 85, 92, 104, 118, 124] // in Lakhs
    },
    mum: {
      fullName: "Mumbai Metropolitan Region",
      safetyIndex: "88.5%",
      accidentIncidentRate: "Medium",
      majorRiskArea: "Eastern Express Highway & Sion Radial",
      peakAccidentTime: "08:30 - 10:30 (Morning Commute Dash)",
      helmetCompliance: 94,
      seatbeltCompliance: 89,
      reductionTrend: "-18.9% (Past 2 Quarters)",
      heatmapsPoints: [
        { zone: "Lower Parel Bridge Node", risk: 70, coordinate: "MH-LP-01", activeAlert: "Naka Nodal Check" },
        { zone: "Sion Circle Traffic Interchange", risk: 88, coordinate: "MH-SC-08", activeAlert: "High Aggressive Weaving" },
        { zone: "Bandra-Worli Sea Link Entrance", risk: 35, coordinate: "MH-BWSL-02", activeAlert: "Radar Camera Gate Active" },
        { zone: "Western Express Highway Exit 4", risk: 80, coordinate: "MH-WEH-14", activeAlert: "Pothole Risk Zone" }
      ],
      monthlyFines: [30, 42, 48, 55, 50, 68, 72, 80, 89, 95, 102, 110]
    },
    blr: {
      fullName: "Bengaluru Outer Areas & Tech Corridors",
      safetyIndex: "79.8%",
      accidentIncidentRate: "High",
      majorRiskArea: "Silk Board Interchange & Outer Ring Road (ORR)",
      peakAccidentTime: "18:00 - 21:00 (Evening Peak Transit)",
      helmetCompliance: 82,
      seatbeltCompliance: 74,
      reductionTrend: "-8.4% (Past 2 Quarters)",
      heatmapsPoints: [
        { zone: "Silk Board Crossing Radial", risk: 98, coordinate: "KA-SB-03", activeAlert: "Critical Gridlock Index" },
        { zone: "Marathahalli Bridge Underpass", risk: 78, coordinate: "KA-MH-09", activeAlert: "Two-Wheeler Lane Infractions" },
        { zone: "Electronic City Expressway Ramp", risk: 45, coordinate: "KA-EC-12", activeAlert: "Smart Radar Active" },
        { zone: "Hebbal Flyover Loop Sector 2", risk: 84, coordinate: "KA-HB-04", activeAlert: "Severe Lane Cutting Zone" }
      ],
      monthlyFines: [45, 58, 62, 70, 85, 94, 102, 118, 124, 138, 142, 150]
    },
    maa: {
      fullName: "Chennai Metropolitan Coastal Link",
      safetyIndex: "89.1%",
      accidentIncidentRate: "Low-Medium",
      majorRiskArea: "East Coast Road (ECR) & Mount Road Junction",
      peakAccidentTime: "22:00 - 01:00 (Late Night Over-speeding)",
      helmetCompliance: 92,
      seatbeltCompliance: 84,
      reductionTrend: "-22.1% (Past 2 Quarters)",
      heatmapsPoints: [
        { zone: "Adyar Flyover Descent", risk: 55, coordinate: "TN-AD-01", activeAlert: "Speed Interceptor deployed" },
        { zone: "ECR Highway Sector 4 (Thiruvanmiyur)", risk: 92, coordinate: "TN-ECR-04", activeAlert: "Dangerous Passing Zone" },
        { zone: "Guindy Cloverleaf Interchange", risk: 75, coordinate: "TN-GD-09", activeAlert: "Lane Management Enforced" },
        { zone: "Mount Road Multi-Lane Tunnel", risk: 42, coordinate: "TN-MR-12", activeAlert: "High occupancy check" }
      ],
      monthlyFines: [18, 25, 32, 28, 40, 38, 52, 48, 59, 68, 72, 81]
    }
  };

  const activeRegion = REGIONAL_METRIC_DATA[selectedMetropolitan];

  // Render vector details for the custom SVG fine trends graph
  const points = activeRegion.monthlyFines;
  const maxVal = Math.max(...points) * 1.1; // padding
  const height = 180;
  const width = 500;
  
  // Create coordinates for line drawing
  const xCoords = points.map((_, i) => (i / (points.length - 1)) * (width - 40) + 20);
  const yCoords = points.map(val => height - (val / maxVal) * (height - 30) - 10);
  
  // Construct path string
  let linePath = `M ${xCoords[0]} ${yCoords[0]} `;
  for (let i = 1; i < xCoords.length; i++) {
    linePath += `L ${xCoords[i]} ${yCoords[i]} `;
  }

  // Shaded area path (closes at the bottom)
  const areaPath = `${linePath} L ${xCoords[xCoords.length-1]} ${height-10} L ${xCoords[0]} ${height-10} Z`;

  return (
    <div className="space-y-6" id="analytics-root">
      
      {/* City Switchers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900/40 border border-slate-800 rounded-2xl" id="analytics-region-header">
        <div>
          <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider block">Intelligent Filter Module</span>
          <h2 className="text-sm font-bold tracking-tight text-white mt-0.5">Metropolitan Region Telemetry Node</h2>
        </div>

        <div className="flex flex-wrap gap-1 bg-slate-950 p-1 border border-slate-800 rounded-lg text-xs font-mono">
          {[
            { id: 'del', label: 'Delhi (NCR)' },
            { id: 'mum', label: 'Mumbai Metro' },
            { id: 'blr', label: 'Bengaluru Core' },
            { id: 'maa', label: 'Chennai Coast' }
          ].map((city) => (
            <button
              key={city.id}
              onClick={() => setSelectedMetropolitan(city.id as any)}
              className={`px-3.5 py-1.5 rounded transition cursor-pointer ${
                selectedMetropolitan === city.id
                  ? 'bg-gradient-to-r from-cyan-500/10 to-blue-600/10 text-cyan-400 border border-cyan-500/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {city.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: SVG Live graph and Safety indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="analytics-charts-grid">
        
        {/* Core Stat Chart Grid */}
        <div className="lg:col-span-2 p-6 bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col justify-between" id="card-fine-trends">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold tracking-wider text-cyan-400 uppercase font-mono flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-cyan-400" /> Regional Enforcement Financials
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">Continuous digital spot fines logged in Rupees (Lakhs) • Fiscal 2026</span>
              </div>
              <div className="font-mono text-right">
                <span className="text-[9px] text-slate-500 block uppercase">Peak Fiscal Month</span>
                <span className="text-xs font-bold text-slate-200">₹{points[points.length-1]}L</span>
              </div>
            </div>

            {/* Pure SVG Neon Tally Graph */}
            <div className="relative w-full h-[200px]" id="financials-canvas-vcontainer">
              <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                {/* Horizontal scale grids */}
                <line x1="20" y1="30" x2={width-20} y2="30" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3,3" />
                <line x1="20" y1="80" x2={width-20} y2="80" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3,3" />
                <line x1="20" y1="130" x2={width-20} y2="130" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3,3" />
                <line x1="20" y1={height-10} x2={width-20} y2={height-10} stroke="#334155" strokeWidth="1" />

                <defs>
                  {/* Subtle area gradient */}
                  <linearGradient id="glowAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Shaded Area under the path */}
                <path d={areaPath} fill="url(#glowAreaGrad)" />

                {/* Main Neon Line */}
                <path d={linePath} fill="none" stroke="#00e5ff" strokeWidth="2.5" className="drop-shadow-[0_2px_8px_rgba(0,229,255,0.4)]" />

                {/* Plot point Circles */}
                {xCoords.map((x, i) => (
                  <circle
                    key={i}
                    cx={x}
                    cy={yCoords[i]}
                    r={hoveredDataPoint === i ? "6" : "3.5"}
                    fill={hoveredDataPoint === i ? "#00e5ff" : "#07111f"}
                    stroke={hoveredDataPoint === i ? "#ffffff" : "#00e5ff"}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredDataPoint(i)}
                    onMouseLeave={() => setHoveredDataPoint(null)}
                  />
                ))}
              </svg>

              {/* Dynamic hover popup details display */}
              <AnimatePresence>
                {hoveredDataPoint !== null && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                    animate={{ opacity: 0.95, scale: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute p-2 bg-slate-950 border border-slate-800 rounded-lg text-[10px] font-mono text-cyan-400 z-10 pointer-events-none"
                    style={{ 
                      left: `${((xCoords[hoveredDataPoint] / width) * 100).toFixed(1)}%`,
                      top: `${((yCoords[hoveredDataPoint] / height) * 100 - 24).toFixed(1)}%`
                    }}
                  >
                    <span className="text-slate-400 block uppercase">Month {hoveredDataPoint + 1} Tally</span>
                    ₹{points[hoveredDataPoint]} Lakhs Collected
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* X Axis Ticks */}
            <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono px-4 mt-2 border-b border-slate-900 pb-2">
              <span>JUN-25</span>
              <span>AUG-25</span>
              <span>OCT-25</span>
              <span>DEC-25</span>
              <span>FEB-26</span>
              <span>APR-26</span>
              <span>MAY-26 (LIVE)</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-950/40 rounded-xl border border-slate-850 text-xs text-slate-400 leading-relaxed mt-4">
            <TrendingDown className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="font-semibold text-slate-200">Compliance Factor Increase: </span>
              Deployment of real-time AI Speed Speed Enforcement Radars resulted in a net <span className="text-emerald-400 font-bold">{activeRegion.reductionTrend}</span> drop in high-speed reckless passives over the current window.
            </div>
          </div>
        </div>

        {/* Safety Gears Compliance Panel */}
        <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col justify-between" id="card-compliance-ratios">
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-cyan-400 uppercase font-mono flex items-center gap-1.5 mb-4">
              <PieChart className="w-4 h-4 text-purple-400" /> Safety Gears Enforcement
            </h3>

            {/* Helmet Compliance Tracker */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300">Helmet Compliance Ratio (Two-Wheelers)</span>
                  <span className="text-cyan-400 font-bold">{activeRegion.helmetCompliance}%</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-850">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-1000"
                    style={{ width: `${activeRegion.helmetCompliance}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 font-mono block">Target: 98% (Goal State 2027)</span>
              </div>

              {/* Seatbelt Compliance Tracker */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300">Front Seatbelt Locks (LMV Passenger Cabin)</span>
                  <span className="text-purple-400 font-bold">{activeRegion.seatbeltCompliance}%</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-850">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-1000"
                    style={{ width: `${activeRegion.seatbeltCompliance}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 font-mono block">Target: 95% (Amended Penalties active)</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-4 mt-6 space-y-3 font-mono text-[10px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Overall Regional Rating</span>
              <span className="text-emerald-400 font-bold uppercase">{selectedMetropolitan === 'del' ? 'GRADE B1' : selectedMetropolitan === 'mum' ? 'GRADE A3' : selectedMetropolitan === 'blr' ? 'GRADE C2' : 'GRADE A2'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Peak Active Infractions Unit</span>
              <span className="text-slate-300">{activeRegion.peakAccidentTime}</span>
            </div>
            <div className="p-2.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-400 text-[10px] leading-relaxed">
              <span className="text-purple-400 font-semibold block uppercase">AI Prevention Strategy:</span>
              Deploy Speed interceptor units 1.5km preceding the &quot;{activeRegion.majorRiskArea.split(' & ')[0]}&quot; node to taper momentum.
            </div>
          </div>
        </div>
      </div>

      {/* Cyber Grid Intersection Accident Heatmap Matrix */}
      <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-4" id="card-traffic-heatmaps">
        <div>
          <h3 className="text-sm font-semibold tracking-wider text-cyan-400 uppercase font-mono flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-rose-400" /> Interactive Accident Hazard Heatmaps
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">High-definition sensor coordinates tagging micro-accidents and aggressive driving clusters over the selected regional sector.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="heatmap-panel-grid">
          {/* Virtual Radar Board */}
          <div className="lg:col-span-3 h-[280px] bg-slate-950 border border-slate-800 rounded-xl relative overflow-hidden flex items-center justify-center" id="grid-radar-board">
            
            {/* Cyber Radar Swips */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
            {/* Overlay grid lines */}
            <div className="absolute h-px w-full bg-slate-800/40 top-1/2"></div>
            <div className="absolute w-px h-full bg-slate-800/40 left-1/2"></div>
            {/* Radar scanner sweep */}
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/0 via-cyan-500/0 to-cyan-500/5 origin-center animate-[spin_8s_linear_infinite]"></div>

            {/* Virtual Plot Hotspots */}
            {activeRegion.heatmapsPoints.map((point, idx) => {
              // Position math using unique index placement
              const xPos = [20, 65, 45, 80][idx % 4];
              const yPos = [35, 75, 18, 55][idx % 4];
              
              return (
                <div 
                  key={idx}
                  className="absolute"
                  style={{ left: `${xPos}%`, top: `${yPos}%` }}
                >
                  <div className="relative group">
                    {/* Glowing pulse ring */}
                    <span className="flex h-5 w-5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-60"></span>
                      <span className="relative inline-flex rounded-full h-5 w-5 bg-rose-600 border border-slate-950 flex items-center justify-center text-[7px] font-bold font-mono text-white">
                        {point.risk}
                      </span>
                    </span>

                    {/* Rich hover metrics tooltip */}
                    <div className="absolute bottom-7 left-1/2 transform -translate-x-1/2 w-48 p-2.5 bg-slate-950 border border-rose-900/35 rounded-xl text-[9px] font-mono pointer-events-none opacity-0 group-hover:opacity-100 z-10 transition-opacity">
                      <span className="text-[8px] tracking-wider text-rose-450 block font-bold uppercase">HAZARD POINT INDEX: {point.risk}%</span>
                      <span className="text-slate-200 block mt-0.5 font-bold line-clamp-1">{point.zone}</span>
                      <span className="text-slate-500 block">Cam Node: {point.coordinate}</span>
                      <span className="text-cyan-400 block font-bold mt-1">↳ Alert: {point.activeAlert}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="absolute left-4 top-4 text-[9px] font-mono text-slate-550 border border-slate-850 bg-slate-950 p-2 rounded">
              <span className="font-bold text-slate-400 uppercase block">Map Toggles</span>
              {activeRegion.fullName}
            </div>
          </div>

          {/* Heatmaps analytics summary cards */}
          <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl flex flex-col justify-between" id="heatmap-insight-cards">
            <div className="space-y-4">
              <span className="text-xs uppercase font-mono tracking-widest text-slate-500 block font-bold">Predictive Risk Digest</span>
              
              <div className="space-y-3 font-mono text-[10px] leading-relaxed">
                <div className="border-l-2 border-l-rose-500 pl-2.5">
                  <span className="text-slate-500 block">Accident Hotspot Concentration</span>
                  <span className="text-slate-200 font-bold">{activeRegion.majorRiskArea}</span>
                </div>
                <div className="border-l-2 border-l-amber-500 pl-2.5">
                  <span className="text-slate-500 block">High Density Window</span>
                  <span className="text-slate-200 font-bold">{activeRegion.peakAccidentTime}</span>
                </div>
                <div className="border-l-2 border-l-cyan-500 pl-2.5">
                  <span className="text-slate-500 block">Relative Roadway Safety Factor</span>
                  <span className="text-cyan-400 font-bold">{activeRegion.safetyIndex} Secure</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-900 mt-4 text-[9px] font-mono text-slate-500 leading-normal">
              <span className="text-slate-400 font-bold block mb-0.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" /> AI Safety Forecast:
              </span>
              Expect increased commercial cargo congestions near Ring Road interfaces tonight. Maintain bumper spacing of minimum 4 meters.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
