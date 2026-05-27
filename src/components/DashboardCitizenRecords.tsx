/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, ShieldCheck, ShieldAlert, Award, FileText, Search, Filter, 
  RefreshCw, CheckCircle2, AlertOctagon, Scale, Badge, ChevronRight, Fingerprint
} from 'lucide-react';

interface CitizenRecord {
  id: string;
  name: string;
  licenseNumber: string;
  vehicleNo: string;
  safetyScore: number;
  complianceRating: number;
  activePenaltyPoints: number;
  status: 'Safe' | 'Warning' | 'Revoked' | 'Provisional';
  lastOffense: string;
  nationalRankPercentile: number;
}

const INITIAL_CITIZENS: CitizenRecord[] = [
  { id: "cit-1", name: "Rajesh Kumar", licenseNumber: "DL-142010482901", vehicleNo: "DL-3C-CA-4952", safetyScore: 82, complianceRating: 88, activePenaltyPoints: 2, status: "Safe", lastOffense: "Speed Limit overreach - Section 183", nationalRankPercentile: 15 },
  { id: "cit-2", name: "Anita Sharma", licenseNumber: "MH-12AQ200948", vehicleNo: "MH-12-PQ-9032", safetyScore: 94, complianceRating: 96, activePenaltyPoints: 0, status: "Safe", lastOffense: "None (Pristine Audit)", nationalRankPercentile: 3 },
  { id: "cit-3", name: "Vikramaditya Pal", licenseNumber: "KA-03B20150938", vehicleNo: "KA-03-MY-8051", safetyScore: 48, complianceRating: 54, activePenaltyPoints: 8, status: "Warning", lastOffense: "Intoxicated driving arrest - Section 185", nationalRankPercentile: 82 },
  { id: "cit-4", name: "Shruti Hegde", licenseNumber: "DL-12C201849182", vehicleNo: "DL-3C-BY-1102", safetyScore: 71, complianceRating: 75, activePenaltyPoints: 4, status: "Provisional", lastOffense: "No safety Helmet - Section 194D", nationalRankPercentile: 45 },
  { id: "cit-5", name: "Gaurav Sen", licenseNumber: "TS-09Q201248021", vehicleNo: "TS-09-ER-5534", safetyScore: 15, complianceRating: 12, activePenaltyPoints: 14, status: "Revoked", lastOffense: "3x Reckless Weaving Speed Limits Bypass", nationalRankPercentile: 99 }
];

export default function DashboardCitizenRecords() {
  const [citizens, setCitizens] = useState<CitizenRecord[]>(INITIAL_CITIZENS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Safe' | 'Warning' | 'Revoked'>('all');
  const [selectedRecord, setSelectedRecord] = useState<CitizenRecord | null>(INITIAL_CITIZENS[0]);

  const filtered = citizens.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.licenseNumber.includes(searchTerm.toUpperCase()) ||
                          c.vehicleNo.includes(searchTerm.toUpperCase());
    const matchesFilter = statusFilter === 'all' ? true : c.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 font-mono text-xs text-slate-300" id="citizen-registry-viewport">
      
      {/* HUD Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900/40 border border-slate-800 rounded-2xl relative" id="cit-hud-header">
        <div>
          <h2 className="text-sm font-bold tracking-wider text-cyan-400 uppercase flex items-center gap-1.5">
            <Fingerprint className="w-5 h-5 text-cyan-400" /> Unified National Citizen Compliance Registry
          </h2>
          <p className="text-[11px] text-slate-400 mt-1">Cross-jurisdictional biometric profiles, risk assessment quotients and live points trackers linked with NIC servers.</p>
        </div>
        <div className="text-[10px] text-slate-505 bg-slate-950 p-3 rounded-xl border border-slate-850">
          SECURE ENCRYPTED LEDGER: <span className="text-emerald-400 font-bold">ONLINE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Aspect: Listing & Filters */}
        <div className="xl:col-span-2 space-y-4">
          <div className="p-4 bg-slate-900/30 border border-slate-800 rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Query Biometric Name, License, Platemark..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl outline-none text-slate-100 placeholder-slate-650"
                />
              </div>

              <div className="flex gap-2">
                {['all', 'Safe', 'Warning', 'Revoked'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f as any)}
                    className={`px-3 py-2 rounded-xl border font-bold capitalize cursor-pointer transition ${
                      statusFilter === f 
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' 
                        : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Records Table style grid list */}
          <div className="bg-slate-950/40 border border-slate-850 rounded-xl overflow-hidden shadow-inner">
            <div className="grid grid-cols-12 gap-2 p-3 bg-slate-950 border-b border-slate-850 font-extrabold text-slate-500 text-[9px] uppercase tracking-wider">
              <span className="col-span-4">Citizen Name / ID</span>
              <span className="col-span-3">Reg. License / Plate</span>
              <span className="col-span-2 text-center">Safety Rating</span>
              <span className="col-span-2 text-right">Points</span>
              <span className="col-span-1"></span>
            </div>

            <div className="divide-y divide-slate-900">
              {filtered.length === 0 ? (
                <div className="p-12 text-center text-slate-500">No Citizen match queries within the live database sector.</div>
              ) : (
                filtered.map((cit) => (
                  <div
                    key={cit.id}
                    onClick={() => setSelectedRecord(cit)}
                    className={`grid grid-cols-12 gap-2 p-4 items-center cursor-pointer transition ${
                      selectedRecord?.id === cit.id 
                        ? 'bg-cyan-500/5' 
                        : 'hover:bg-slate-900/10'
                    }`}
                  >
                    <div className="col-span-4 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                        <User className="w-4 h-4 text-slate-400" />
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-200 block">{cit.name}</span>
                        <span className="text-[9px] text-slate-500 block">ID: {cit.id}</span>
                      </div>
                    </div>

                    <div className="col-span-3">
                      <span className="text-slate-300 block">{cit.licenseNumber}</span>
                      <span className="text-[9px] text-cyan-500 font-bold block bg-slate-900/40 px-1 py-0.5 rounded border border-slate-850/50 w-max">{cit.vehicleNo}</span>
                    </div>

                    <div className="col-span-2 text-center">
                      <span className={`text-base font-black font-mono leading-none ${
                        cit.safetyScore > 80 ? 'text-emerald-400' :
                        cit.safetyScore > 50 ? 'text-amber-400' : 'text-rose-500'
                      }`}>{cit.safetyScore}%</span>
                    </div>

                    <div className="col-span-2 text-right">
                      <span className={`font-extrabold text-xs px-2 py-1 rounded-md ${
                        cit.activePenaltyPoints > 10 ? 'bg-rose-550/15 text-rose-455 border border-rose-500/10' :
                        cit.activePenaltyPoints > 4 ? 'bg-amber-550/15 text-amber-400 border border-amber-500/10' :
                        'bg-slate-900 text-slate-300 border border-slate-800'
                      }`}>{cit.activePenaltyPoints} Points</span>
                    </div>

                    <div className="col-span-1 text-right">
                      <ChevronRight className="w-4 h-4 text-slate-500 ml-auto" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Aspect: Detailed HUD Inspector Card */}
        <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl relative flex flex-col justify-between" id="record-detailed-panel">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-700/5 rounded-full blur-2xl pointer-events-none"></div>

          {selectedRecord ? (
            <div className="space-y-6">
              <div className="text-center pb-5 border-b border-slate-800 space-y-3">
                <div className="w-16 h-16 rounded-full bg-cyan-550/10 border-2 border-cyan-500/30 flex items-center justify-center mx-auto relative">
                  <Fingerprint className="w-8 h-8 text-cyan-400" />
                  <span className={`absolute bottom-0 right-0 w-4.5 h-4.5 rounded-full border border-slate-900 flex items-center justify-center text-[7.5px] font-black ${
                    selectedRecord.status === 'Safe' ? 'bg-emerald-500 text-white' :
                    selectedRecord.status === 'Warning' ? 'bg-amber-400 text-slate-950' : 'bg-rose-550 text-white'
                  }`}>✓</span>
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-100 uppercase">{selectedRecord.name}</h3>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-950 text-slate-500 font-bold tracking-widest uppercase border border-slate-850">
                    STATUS: {selectedRecord.status} PASS
                  </span>
                </div>
              </div>

              <div className="space-y-3 leading-normal">
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 space-y-1">
                  <span className="text-[9px] text-slate-550 block uppercase font-extrabold">State Licence Registry No:</span>
                  <span className="text-slate-200 font-bold select-all block">{selectedRecord.licenseNumber}</span>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 space-y-1">
                  <span className="text-[9px] text-slate-550 block uppercase font-extrabold">Registered Vehicles Platemark:</span>
                  <span className="text-cyan-400 font-bold select-all block font-mono">{selectedRecord.vehicleNo}</span>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 space-y-1">
                  <span className="text-[9px] text-slate-550 block uppercase font-extrabold">Last Appreciated Violations Logs:</span>
                  <span className="text-slate-300 font-bold block leading-relaxed">{selectedRecord.lastOffense}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center space-y-1">
                    <span className="text-[8px] text-slate-500 uppercase block font-bold">National Safety Rank</span>
                    <span className="text-sm font-mono font-black text-teal-400">Top {selectedRecord.nationalRankPercentile}%</span>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center space-y-1">
                    <span className="text-[8px] text-slate-500 uppercase block font-bold">Compliance Rating</span>
                    <span className="text-sm font-mono font-black text-indigo-400">{selectedRecord.complianceRating}%</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-rose-950/10 border border-rose-950/40 rounded-xl text-[10px] text-slate-400 font-semibold leading-relaxed">
                <span className="text-rose-450 font-black block mb-0.5">⚠️ ENFORCEMENT PREEMPT:</span>
                License points score index linked dynamically. Accumulating over 12 primary penalty points triggers direct RTO revocation (Section 19).
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-slate-600">Select left ledger citizen row to trigger radar lookup assays.</div>
          )}

          <div className="pt-4 border-t border-slate-800/80 text-[9px] text-slate-500 flex items-center justify-between font-bold">
            <span>NIC TRANSLINK REPLICA DE-8</span>
            <span>VERIFICATION: SIGNED</span>
          </div>
        </div>

      </div>

    </div>
  );
}
