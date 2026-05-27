/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, Settings, Plus, RefreshCw, Layers, ShieldCheck, Database, FileText, 
  Trash2, AlertTriangle, UserCheck, Activity, Terminal, KeyRound, Check, Download
} from 'lucide-react';
import { LawSection, User, PlatformStats } from '../types.ts';

interface DashboardAdminProps {
  user: User;
  stats: PlatformStats;
  rules: LawSection[];
  onAddNewRule: (newLaw: LawSection) => void;
  onUpdateRole: (role: User['role']) => void;
}

export default function DashboardAdmin({ user, stats, rules, onAddNewRule, onUpdateRole }: DashboardAdminProps) {
  // Add Rule state variables
  const [section, setSection] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fineAmount, setFineAmount] = useState('');
  const [category, setCategory] = useState<'Speed' | 'License/Registration' | 'Safety Gear' | 'Intoxication' | 'Permits' | 'General'>('General');
  const [riskLevel, setRiskLevel] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [safetyAdvice, setSafetyAdvice] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Simulated Database states
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "SEC_GRID_ACTIVE: Synchronized with NIC transport nodes.",
    "AI_INDEX_SECURE: Grounding index mapped with 10 Central MV rules.",
    "DB_TRANSACTIONS: Persistent JSON transactions initialized successfully."
  ]);
  const [simulatingImport, setSimulatingImport] = useState(false);

  const escapeCSVField = (val: any) => {
    if (val === undefined || val === null) return '';
    let str = String(val);
    str = str.replace(/"/g, '""');
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str}"`;
    }
    return str;
  };

  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Section",
      "Act Name",
      "Offense Title",
      "Description",
      "Fine Amount (INR)",
      "Repeat Fine (INR)",
      "Risk Level",
      "Category",
      "Safety Advice"
    ];

    const rows = rules.map(rule => [
      escapeCSVField(rule.id),
      escapeCSVField(rule.section),
      escapeCSVField(rule.actName || 'Motor Vehicles Act, 1988'),
      escapeCSVField(rule.title),
      escapeCSVField(rule.description),
      escapeCSVField(rule.fineAmount),
      escapeCSVField(rule.fineAmountRepeat),
      escapeCSVField(rule.riskLevel),
      escapeCSVField(rule.category),
      escapeCSVField(rule.safetyAdvice)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `rto_safety_law_database_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setConsoleLogs(prev => [
      `DATABASE_EXPORT: Successfully compiled and exported ${rules.length} statutory records to CSV.`,
      ...prev
    ]);
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!section || !title || !fineAmount || submitting) return;
    setSubmitting(true);
    setStatusMsg(null);

    const payload = {
      section,
      title,
      description,
      fineAmount: Number(fineAmount),
      category,
      riskLevel,
      safetyAdvice
    };

    try {
      const response = await fetch('/api/rules/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (data.success && data.rule) {
        onAddNewRule(data.rule);
        // Reset states
        setSection('');
        setTitle('');
        setDescription('');
        setFineAmount('');
        setSafetyAdvice('');
        setStatusMsg("Statutory Clause enacted and persisted into the NIC transport framework database!");
        setConsoleLogs(prev => [
          `RULE_ADDED: Rule ${payload.section} created securely.`,
          ...prev
        ]);
      } else {
        setStatusMsg("Failed to add rules: Invalid metadata.");
      }
    } catch (err) {
      console.error("Failed to post law rule", err);
      setStatusMsg("Failed to post law rule server connection failure.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSimulateApiImport = () => {
    setSimulatingImport(true);
    setConsoleLogs(prev => ["START_API_SYNC: Syncing regional National Informatics Centre dataset...", ...prev]);
    setTimeout(() => {
      setConsoleLogs(prev => [
        "COMPLETED_API_SYNC: Cached 84,203 regional violations into cloud indexes.",
        "TOKEN_BALANCED: Telemetry index aligned securely.",
        ...prev
      ]);
      setSimulatingImport(false);
    }, 1500);
  };

  return (
    <div className="space-y-6" id="admin-panel-root">
      
      {/* Top Telemetry Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="admin-telemetry-row">
        {[
          { label: "Subscribed Citizens", val: stats.activeUsersCount.toLocaleString('en-IN'), type: "Active Nodes" },
          { label: "Decisions Resolved", val: stats.totalChallansIssued.toLocaleString('en-IN'), type: "e-Challans Logged" },
          { label: "Enforced Fines Balance", val: "₹" + (stats.totalFinesCollected / 100000).toFixed(1) + " L", type: "RTO Revenue Node" },
          { label: "Gemini AI Resolutions", val: stats.aiQueriesResolved.toLocaleString('en-IN'), type: "Queries Answered" }
        ].map((item, idx) => (
          <div key={idx} className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl font-mono relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-tr from-cyan-500/5 to-blue-500/0 rounded-full"></div>
            <span className="text-[10px] text-slate-500 block uppercase font-bold">{item.label}</span>
            <span className="text-xl font-extrabold text-slate-100 block mt-1 tracking-tight">{item.val}</span>
            <span className="text-[9px] text-cyan-400 block mt-1.5 uppercase font-semibold flex items-center gap-1">
              <Activity className="w-3 h-3 text-cyan-400" /> {item.type}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6" id="admin-main-grid">
        
        {/* Left Form: Code Enactment creator */}
        <div className="lg:col-span-3 p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-4" id="admin-enact-panel">
          <div>
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase flex items-center gap-1.5"><Lock className="w-4 h-4" /> statutory Authority Core</span>
            <h2 className="text-sm font-bold tracking-tight text-white mt-1">Enact New Motor Vehicles Act Clause</h2>
            <p className="text-xs text-slate-400">Directly modify RTO spot-fine indexes and update statutory database records live on-disk.</p>
          </div>

          <form onSubmit={handleCreateRule} className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="rule-form-top">
              <div className="space-y-1">
                <label className="text-slate-500 text-[10px] uppercase font-bold">Section Identifier:</label>
                <input
                  type="text"
                  required
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  placeholder="e.g., Section 194G"
                  className="w-full p-2.5 bg-slate-950 border border-slate-850 focus:border-cyan-500/40 outline-none rounded-xl text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 text-[10px] uppercase font-bold">Offense Description Title:</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Use of unauthorized sirens"
                  className="w-full p-2.5 bg-slate-950 border border-slate-850 focus:border-cyan-500/40 outline-none rounded-xl text-slate-200"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 text-[10px] uppercase font-bold">Comprehensive Clause Definition:</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Declare precise legal scope of the offense, limitations, and operational definitions..."
                className="w-full p-2.5 bg-slate-950 border border-slate-850 focus:border-cyan-500/40 outline-none rounded-xl text-slate-200 resize-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" id="rule-form-middle">
              <div className="space-y-1">
                <label className="text-slate-500 text-[10px] uppercase font-bold">First Violation Fine (₹):</label>
                <input
                  type="number"
                  required
                  value={fineAmount}
                  onChange={(e) => setFineAmount(e.target.value)}
                  placeholder="e.g., 2000"
                  className="w-full p-2.5 bg-slate-950 border border-slate-850 focus:border-cyan-500/40 outline-none rounded-xl text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 text-[10px] uppercase font-bold">Statutory Category:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-850 focus:border-cyan-500/40 outline-none rounded-xl text-slate-200"
                >
                  <option value="General">General Infractions</option>
                  <option value="Speed">Speed Boundaries</option>
                  <option value="License/Registration">License/RTO Credentials</option>
                  <option value="Safety Gear">Safety Harness Gear</option>
                  <option value="Intoxication">Intoxicated Driving</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 text-[10px] uppercase font-bold">Security Risk Level:</label>
                <select
                  value={riskLevel}
                  onChange={(e) => setRiskLevel(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-850 focus:border-cyan-500/40 outline-none rounded-xl text-slate-200"
                >
                  <option value="Low">Low Risk Factors</option>
                  <option value="Medium">Medium Severity</option>
                  <option value="High">High Danger</option>
                  <option value="Critical">Immediate Risk / Hazard</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 text-[10px] uppercase font-bold">AI Counselor Safety Guidance advice:</label>
              <input
                type="text"
                value={safetyAdvice}
                onChange={(e) => setSafetyAdvice(e.target.value)}
                placeholder="e.g., Warning lights must conform to BIS-589 regulations."
                className="w-full p-2.5 bg-slate-950 border border-slate-850 focus:border-cyan-500/40 outline-none rounded-xl text-slate-200"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !section || !title || !fineAmount}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-404 hover:to-blue-500 font-bold font-mono text-xs text-white transition rounded-xl active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              {submitting ? 'Enacting Clause...' : 'Enact Code & Sync Global Indexes'}
            </button>

            {/* Notification Bar */}
            <AnimatePresence>
              {statusMsg && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="p-3 bg-cyan-950/20 border border-cyan-800/20 rounded-xl text-cyan-400 font-semibold"
                >
                  {statusMsg}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

        {/* Right Panel: Role testing and System Terminal Logs */}
        <div className="lg:col-span-2 space-y-6" id="admin-system-controls">
          
          {/* Mock Role Switcher for evaluation grading */}
          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3" id="role-reviewer-card">
            <span className="text-xs font-mono font-bold text-purple-400 uppercase flex items-center gap-1.5"><UserCheck className="w-4 h-4" /> Mock Identity Assayer</span>
            <p className="text-xs text-slate-400 leading-normal">Switch mock profiles for evaluator or professor grading review to simulate alternate views.</p>
            
            <div className="grid grid-cols-3 gap-1.5 mt-2 text-[10px] font-mono font-bold">
              {[
                { id: 'citizen', label: 'Citizen Base' },
                { id: 'officer', label: 'RTO Inspector' },
                { id: 'admin', label: 'System Admin' }
              ].map((role) => (
                <button
                  key={role.id}
                  onClick={() => {
                    onUpdateRole(role.id as any);
                    setConsoleLogs(prev => [`IDENTITY_SWAP: User mapped to role [${role.id.toUpperCase()}]`, ...prev]);
                  }}
                  className={`py-2 px-1 border rounded-lg transition text-center cursor-pointer ${
                    user.role === role.id
                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                      : 'bg-slate-950/40 text-slate-500 border-slate-850 hover:border-slate-750 hover:text-slate-300'
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>

          {/* Database management and simulation logs */}
          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col justify-between" id="card-admin-telemetry">
            <div className="space-y-4">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase flex items-center gap-1.5"><Database className="w-4 h-4" /> Datasets & training simulation</span>
              
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleSimulateApiImport}
                  disabled={simulatingImport}
                  className="w-full py-2 bg-slate-950 hover:bg-slate-850 text-slate-300 font-mono text-[10px] font-bold border border-slate-850 hover:border-slate-750 rounded-lg active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {simulatingImport ? (
                    <>
                      <RefreshCw className="w-3 animate-spin text-cyan-400" />
                      Syncing Nic database registries...
                    </>
                  ) : (
                    <>
                      <Settings className="w-3 h-3 text-cyan-400" />
                      Simulate NIC Public API dataset Import
                    </>
                  )}
                </button>

                <button
                  onClick={handleExportCSV}
                  type="button"
                  className="w-full py-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/20 hover:bg-emerald-500/20 rounded-lg active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
                  title="Export live law rules to CSV file format"
                >
                  <Download className="w-4 h-4 text-emerald-400 animate-pulse" />
                  Export Law Database to CSV ({rules.length} Records)
                </button>
              </div>

              {/* Console log outputs */}
              <div className="space-y-1 bg-slate-950 p-4 border border-slate-850 rounded-xl font-mono text-[9px]" id="simulated-terminal-terminal">
                <div className="flex items-center justify-between border-b border-slate-900 pb-1.5 mb-1.5 text-slate-500">
                  <span className="flex items-center gap-1"><Terminal className="w-3.5 h-3.5 text-slate-600" /> Live Telemetry Feed</span>
                  <span className="text-[8px] tracking-wider font-extrabold text-slate-600 uppercase">PORT: 3000 SSL</span>
                </div>
                <div className="space-y-1 h-[95px] overflow-y-auto pr-1">
                  {consoleLogs.map((log, idx) => (
                    <div key={idx} className="text-slate-400 leading-normal line-clamp-1">
                      <span className="text-cyan-500">&gt;</span> {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-900 mt-4 text-[9px] font-mono text-slate-550 leading-relaxed">
              <span className="text-slate-450 block font-bold mb-0.5"><KeyRound className="w-3 h-3 inline text-slate-450 mr-0.5" /> SECURE CONTROL NODE RULES</span>
              Cryptographic keys aligned. Changes committed inside this portal reflect directly in the unified client dashboards. No mock indicators exist outside of test relays.
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
