/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Eye, Video, AlertTriangle, Play, Check, ShieldCheck, 
  RefreshCw, Camera, Radar, Tag, MapPin, Sparkles, Filter
} from 'lucide-react';

interface SurveillanceFrame {
  id: string;
  sourceCamera: string;
  location: string;
  plateScanned: string;
  detectedOffense: 'Lane Straddling' | 'No Helmet' | 'Seatbelt Absent' | 'Overspeeding' | 'None (Clear)';
  level: 'Critical' | 'High' | 'Medium' | 'Low' | 'Compliance';
  timestamp: string;
  confidenceScore: number;
  thumbnailSeed: string; // Aesthetic gradient proxy representation
}

const SURVEILLANCE_DATAPOOL: SurveillanceFrame[] = [
  { id: "cam-ev-1", sourceCamera: "CAM_NCR_NH48_G1", location: "Delhi Gurgaon Tollway Outer", plateScanned: "DL-3C-CA-4952", detectedOffense: "Seatbelt Absent", level: "Medium", timestamp: "06:33:14", confidenceScore: 94, thumbnailSeed: "from-blue-600/30 to-slate-900/40" },
  { id: "cam-ev-2", sourceCamera: "CAM_BLR_ORR_E4", location: "Silk Board Overpass Link", plateScanned: "KA-03-MY-8051", detectedOffense: "Overspeeding", level: "Critical", timestamp: "06:31:05", confidenceScore: 98, thumbnailSeed: "from-rose-600/30 to-slate-900/40" },
  { id: "cam-ev-3", sourceCamera: "CAM_MUM_WEH_M2", location: "Western Express Highway, Sion", plateScanned: "MH-12-PQ-9032", detectedOffense: "Lane Straddling", level: "High", timestamp: "06:29:40", confidenceScore: 92, thumbnailSeed: "from-amber-600/30 to-slate-900/40" },
  { id: "cam-ev-4", sourceCamera: "CAM_MAA_OMR_T1", location: "OMR Tech Gate Intersection", plateScanned: "TN-07-BY-1102", detectedOffense: "No Helmet", level: "High", timestamp: "06:25:12", confidenceScore: 96, thumbnailSeed: "from-rose-600/30 to-slate-900/40" },
  { id: "cam-ev-5", sourceCamera: "CAM_HYD_ORR_S2", location: "Gachibowli Loop Gate 3", plateScanned: "TS-09-ER-5534", detectedOffense: "Overspeeding", level: "Critical", timestamp: "06:18:55", confidenceScore: 99, thumbnailSeed: "from-rose-600/30 to-slate-900/40" },
  { id: "cam-ev-6", sourceCamera: "CAM_NCR_DND_A8", location: "DND Exit Tunnel Wing", plateScanned: "HR-26-BQ-4590", detectedOffense: "None (Clear)", level: "Compliance", timestamp: "06:14:02", confidenceScore: 100, thumbnailSeed: "from-emerald-600/30 to-slate-900/40" }
];

export default function DashboardSurveillanceLogs() {
  const [logs, setLogs] = useState<SurveillanceFrame[]>(SURVEILLANCE_DATAPOOL);
  const [filterOffense, setFilterOffense] = useState<'all' | 'Overspeeding' | 'No Helmet' | 'Seatbelt Absent' | 'Clear'>('all');
  const [scanning, setScanning] = useState(false);

  const handleManualScan = () => {
    setScanning(true);
    setTimeout(() => {
      // Prepend a dummy live surveillance capture to simulate real surveillance AI logic
      const randomId = Math.floor(Math.random() * 900) + 100;
      const newFrame: SurveillanceFrame = {
        id: `cam-ev-${randomId}`,
        sourceCamera: "CAM_HYD_Gachibowli_9",
        location: "Gachibowli ORR Sector 2",
        plateScanned: `TS-09-${String.fromCharCode(65 + Math.random()*26)}${String.fromCharCode(65 + Math.random()*26)}-${Math.floor(Math.random()*9000)+1000}`,
        detectedOffense: Math.random() > 0.5 ? "Overspeeding" : "Seatbelt Absent",
        level: "High",
        timestamp: new Date().getUTCHours().toString().padStart(2,'0') + ":" + new Date().getUTCMinutes().toString().padStart(2,'0') + ":" + new Date().getUTCSeconds().toString().padStart(2,'0'),
        confidenceScore: Math.floor(Math.random() * 15) + 85,
        thumbnailSeed: "from-cyan-600/30 to-slate-900/40"
      };
      setLogs(prev => [newFrame, ...prev]);
      setScanning(false);
    }, 1200);
  };

  const filtered = logs.filter(log => {
    if (filterOffense === 'all') return true;
    if (filterOffense === 'Clear') return log.detectedOffense === 'None (Clear)';
    return log.detectedOffense === filterOffense;
  });

  return (
    <div className="space-y-6 font-mono text-xs text-slate-300" id="surveillance-logs-viewport">
      
      {/* Top Controller dashboard banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-slate-900/40 border border-slate-800 rounded-2xl relative overflow-hidden" id="surveillance-hud-header">
        <div className="absolute top-0 right-0 w-44 h-44 bg-blue-600/[0.02] rounded-full blur-3xl pointer-events-none"></div>
        <div>
          <h2 className="text-sm font-bold tracking-wider text-rose-400 uppercase flex items-center gap-1.5 animate-pulse">
            <Camera className="w-5 h-5 text-rose-455 animate-[pulse_2s_infinite]" /> AI Smart Surveillance Scan logs
          </h2>
          <p className="text-[11px] text-slate-400 mt-1">Live automated plate tracking, lane occupancy grids and optical behavior models capturing highway compliance ratings.</p>
        </div>

        <button
          onClick={handleManualScan}
          disabled={scanning}
          className="mt-4 md:mt-0 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 font-bold text-white rounded-xl active:scale-95 transition flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/10"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
          {scanning ? 'INTERCEPT SCANNING...' : 'TRIGGER VOLATILE AIR SCAN'}
        </button>
      </div>

      {/* Layer selector bar */}
      <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl flex items-center gap-3">
        <span className="text-slate-500 font-bold uppercase flex items-center gap-1 text-[10px]">
          <Filter className="w-3.5 h-3.5 text-slate-650" /> Filter Offense Category:
        </span>
        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-[10px]">
          {['all', 'Overspeeding', 'No Helmet', 'Seatbelt Absent', 'Clear'].map((category) => (
            <button
              key={category}
              onClick={() => setFilterOffense(category as any)}
              className={`px-3 py-1.5 rounded transition font-bold cursor-pointer ${
                filterOffense === category 
                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/10' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Grid displays */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="surveillance-grid">
        {filtered.map((log) => {
          const ratingColor = 
            log.level === 'Critical' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20' :
            log.level === 'High' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' :
            log.level === 'Compliance' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
            'bg-slate-900 text-slate-300 border border-slate-800';

          return (
            <div 
              key={log.id} 
              className="p-5 bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col justify-between h-[310px] space-y-4 hover:border-slate-700/80 transition relative overflow-hidden group"
            >
              {/* Virtualized Laser Scanning Camera Snapshot display */}
              <div className={`relative h-[115px] bg-gradient-to-tr ${log.thumbnailSeed} border border-slate-850 rounded-xl overflow-hidden flex flex-col justify-between p-3`}>
                <div className="absolute inset-0 bg-slate-900/20 pointer-events-none"></div>
                
                {/* Visual Camera Scan Reticle Overlay lines */}
                <div className="absolute inset-x-2 top-1/2 border-t border-dashed border-rose-500/40 origin-center pointer-events-none group-hover:scale-x-110 transition"></div>
                <div className="absolute inset-y-2 left-1/2 border-l border-dashed border-rose-500/40 origin-center pointer-events-none group-hover:scale-y-110 transition"></div>
                <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-950/80 text-[8.5px] text-slate-400 border border-slate-800 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span> FEED 107
                </div>

                <div className="space-y-1 z-1 font-mono text-[9px] text-slate-350 bg-slate-950/80 p-1.5 rounded w-max border border-slate-800">
                  <span className="block text-slate-500 uppercase text-[7.5px] font-bold">CAM SOURCE</span>
                  <span className="text-slate-100 font-black tracking-wider block">{log.sourceCamera}</span>
                </div>

                <div className="flex items-center justify-between z-1 mt-auto bg-slate-950/80 p-2 border border-slate-800 rounded-lg">
                  <div className="font-mono text-[9.5px]">
                    <span className="text-slate-500 block text-[7.5px] uppercase font-bold">Plate Scanning Verified</span>
                    <span className="text-cyan-400 font-black block select-all tracking-wider">{log.plateScanned}</span>
                  </div>
                  <div className="text-right text-[9.5px]">
                    <span className="text-slate-500 block text-[7.5px] uppercase font-bold">Confidence</span>
                    <span className="text-emerald-400 font-bold block">{log.confidenceScore}% Acc</span>
                  </div>
                </div>
              </div>

              {/* Data parameters */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-650" /> {log.location}
                  </span>
                  <span className="text-[9.5px] text-slate-500 font-medium">{log.timestamp}</span>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl space-y-1 border border-slate-850">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold">Offense Tag:</span>
                    <span className={`px-2 py-0.5 rounded text-[8.5px] uppercase font-bold ${ratingColor}`}>
                      {log.detectedOffense}
                    </span>
                  </div>
                  {log.detectedOffense !== 'None (Clear)' && (
                    <span className="text-[9px] text-slate-500 block mt-1 font-semibold">
                      ↳ Section warning triggers: {
                        log.detectedOffense === 'Overspeeding' ? 'Section 183 fine warning ₹2k' :
                        log.detectedOffense === 'No Helmet' ? 'Section 194D fine warning ₹1k' : 'Section 194B fine warning ₹1k'
                      }
                    </span>
                  )}
                </div>
              </div>

              {/* Footer action */}
              <div className="pt-2 border-t border-slate-905 flex items-center justify-between font-bold text-[9px] text-slate-550">
                <span>SYSTEM ID: {log.id.toUpperCase()}</span>
                <span className="text-cyan-400 font-bold">✓ SCAN PARSED</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
