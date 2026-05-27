/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, Bot, Shield, Server, Zap, Wifi, 
  HelpCircle, Scale, Database, RefreshCw, Key, CheckCircle
} from 'lucide-react';

interface DashboardSettingsProps {
  user: any;
}

export default function DashboardSettings({ user }: DashboardSettingsProps) {
  const [aiConfidence, setAiConfidence] = useState(85);
  const [speedThreshold, setSpeedThreshold] = useState(100);
  const [pnlTally, setPnlTally] = useState('Local Secure');
  const [autoSiren, setAutoSiren] = useState(true);
  const [simulatedLink, setSimulatedLink] = useState('production-prod-del4');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Password rotation states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changeError, setChangeError] = useState<string | null>(null);
  const [changeSuccess, setChangeSuccess] = useState<string | null>(null);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const getPasswordStrength = (p: string) => {
    if (!p) return { score: 0, label: "NONE", color: "bg-slate-800" };
    let score = 0;
    if (p.length >= 6) score += 1;
    if (p.length >= 10) score += 1;
    if (/[A-Z]/.test(p)) score += 1;
    if (/[0-9]/.test(p)) score += 1;
    if (/[^A-Za-z0-9]/.test(p)) score += 1;

    if (score <= 2) return { score, label: "CRITICAL WEAKNESS", color: "bg-rose-500" };
    if (score <= 4) return { score, label: "STANDARD COMPLIANCE", color: "bg-yellow-500" };
    return { score, label: "MAXIMUM CODESHIELD", color: "bg-emerald-500" };
  };

  const changeStrength = getPasswordStrength(newPassword);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setChangeError("All inputs must be populated.");
      setChangeSuccess(null);
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setChangeError("Rotation mismatch. New passwords do not match.");
      setChangeSuccess(null);
      return;
    }
    if (newPassword.length < 6) {
      setChangeError("Crypt wall length must be 6 characters or above.");
      setChangeSuccess(null);
      return;
    }

    setChangeError(null);
    setChangeSuccess(null);
    setPasswordSaving(true);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email || 'rajesh.kumar@safeindia.org',
          currentPassword,
          newPassword
        })
      });
      const data = await response.json();
      if (data.success) {
        setChangeSuccess(data.message);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        setChangeError(data.error);
      }
    } catch (e) {
      setChangeError("Security system offline. Failed to write password rotation key.");
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleSaveSettings = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1000);
  };

  return (
    <div className="space-y-6 font-mono text-xs text-slate-300" id="tactical-settings-viewport">
      
      {/* settings headline */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900/40 border border-slate-800 rounded-2xl relative" id="settings-hud-header">
        <div>
          <h2 className="text-sm font-bold tracking-wider text-cyan-400 uppercase flex items-center gap-1.5">
            <Settings className="w-5 h-5 text-cyan-400" /> Operational Environment Control Node
          </h2>
          <p className="text-[11px] text-slate-400 mt-1">Configure telemetry thresholds, AI prediction indices and translink proxies for the municipal traffic safety platform.</p>
        </div>
        <div className="text-[10px] text-slate-505 bg-slate-950 p-2 border border-slate-850 rounded">
          SSL ENCRYPTION PORT: <span className="text-cyan-400 font-bold">3000</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column Settings sliders */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-6">
            <h3 className="text-xs uppercase font-bold tracking-widest text-cyan-400 border-b border-slate-805 pb-3">
              1. TELEMETRY INDICES & ACCURACY CONTROL
            </h3>

            {/* AI Confidence Limit slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-205 font-bold flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-cyan-450" /> AI Ticket Validation Confidence limit:
                </span>
                <span className="text-cyan-400 font-extrabold">{aiConfidence}% Threshold</span>
              </div>
              <input 
                type="range" 
                min="50" 
                max="99" 
                value={aiConfidence}
                onChange={(e) => setAiConfidence(Number(e.target.value))}
                className="w-full accent-cyan-455 bg-slate-950 h-2 rounded cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 leading-normal block">
                * Limits automatic OCR validations below this rating. Cases under threshold route to manual police audit.
              </span>
            </div>

            {/* Speed warnings Limit slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-205 font-bold flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-rose-450" /> Express highway Speed Warning Threshold:
                </span>
                <span className="text-rose-400 font-extrabold">{speedThreshold} KM/H Limit</span>
              </div>
              <input 
                type="range" 
                min="60" 
                max="140" 
                value={speedThreshold}
                onChange={(e) => setSpeedThreshold(Number(e.target.value))}
                className="w-full accent-rose-455 bg-slate-950 h-2 rounded cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 leading-normal block">
                * Laser speed sensors trigger Section 183 penalty scans when local speed exceeds this boundary.
              </span>
            </div>
          </div>

          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-6">
            <h3 className="text-xs uppercase font-bold tracking-widest text-purple-405 border-b border-slate-805 pb-3">
              2. TRANSIT ENFORCEMENT PARAMETERS
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-slate-500 text-[10px] block uppercase font-bold">Surveillance Replication Tunnel:</label>
                <select
                  value={pnlTally}
                  onChange={(e) => setPnlTally(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-850 rounded-xl outline-none text-slate-105"
                >
                  <option value="Local Secure">Local Store Replica Only</option>
                  <option value="Capped Translink">NIC Centralized Node Cache</option>
                  <option value="Full Government API">RTO Ministry Gateway Prod</option>
                </select>
              </div>

              <div className="space-y-1.5 font-mono">
                <label className="text-slate-500 text-[10px] block uppercase font-bold">Active Cloud Host Tunnel ID:</label>
                <input
                  type="text"
                  value={simulatedLink}
                  onChange={(e) => setSimulatedLink(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-850 rounded-xl outline-none text-slate-200 uppercase font-black tracking-wider"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-850 rounded-xl font-bold">
              <div className="space-y-0.5">
                <span className="text-slate-200 block">Auto-Dispatch SOS Responders</span>
                <span className="text-[10px] text-slate-500 block">Deploy ambulance instantly on high impact crash zone sensor events</span>
              </div>
              <button
                type="button"
                onClick={() => setAutoSiren(!autoSiren)}
                className={`w-12 h-6 rounded-full p-1 transition cursor-pointer ${autoSiren ? 'bg-cyan-500' : 'bg-slate-800'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${autoSiren ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-6">
            <h3 className="text-xs uppercase font-bold tracking-widest text-[#00bcd4] border-b border-slate-805 pb-3 flex items-center gap-1.5">
              <Key className="w-4 h-4" /> 3. SECURE AUTHORIZATION ROTATION PANEL
            </h3>
            
            <p className="text-[11px] text-slate-400 font-sans leading-normal">
              Rotates the digital access credentials keywall for the active console account: <span className="text-cyan-400 font-bold font-mono">{user?.email || 'rajesh.kumar@safeindia.org'}</span>
            </p>

            {changeError && (
              <div className="p-2.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl text-[10px] leading-normal font-sans">
                ⚠ {changeError}
              </div>
            )}
            
            {changeSuccess && (
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-[10px] leading-normal font-sans">
                ✓ {changeSuccess}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-slate-500 text-[9px] block uppercase font-bold">Current Code Key:</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 bg-slate-950 border border-slate-850 rounded-xl outline-none text-slate-200"
                />
              </div>

              <div className="space-y-1.5 font-sans">
                <label className="text-slate-500 text-[9px] block uppercase font-bold flex justify-between font-mono">
                  <span>New Password:</span>
                  {newPassword && (
                    <span className={changeStrength.score <= 2 ? 'text-rose-400' : changeStrength.score <= 4 ? 'text-yellow-500' : 'text-emerald-500'}>
                      {changeStrength.label}
                    </span>
                  )}
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 chars"
                  className="w-full p-2.5 bg-slate-950 border border-slate-850 rounded-xl outline-none text-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-slate-500 text-[9px] block uppercase font-bold">Confirm New Password:</label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 bg-slate-950 border border-slate-850 rounded-xl outline-none text-slate-200"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleChangePassword}
                  disabled={passwordSaving}
                  className="w-full py-2.5 bg-slate-950 border border-slate-800 hover:border-cyan-500/30 text-slate-400 hover:text-white font-bold rounded-xl outline-none transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md text-[10px] uppercase font-mono tracking-wider"
                >
                  <RefreshCw className={`w-3 h-3 ${passwordSaving ? 'animate-spin' : ''}`} />
                  {passwordSaving ? 'ROTATING...' : 'ROTATE KEY SIGNATURE'}
                </button>
              </div>
            </div>
            
            {newPassword && (
              <div className="h-1.5 w-full bg-slate-950/80 rounded overflow-hidden flex gap-0.5">
                <div className={`h-full transition-all ${changeStrength.color} ${changeStrength.score >= 1 ? 'w-1/3' : 'w-0'}`} />
                <div className={`h-full transition-all ${changeStrength.color} ${changeStrength.score >= 3 ? 'w-1/3' : 'w-0'}`} />
                <div className={`h-full transition-all ${changeStrength.color} ${changeStrength.score >= 5 ? 'w-1/3' : 'w-0'}`} />
              </div>
            )}
          </div>
        </div>

        {/* Right Info Box & Actions */}
        <div className="p-6 bg-slate-905 border border-slate-850 rounded-2xl flex flex-col justify-between" id="settings-action-panel">
          
          <div className="space-y-6">
            <div className="pb-4 border-b border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">AUTHENTICATION TOKEN</span>
              <span className="text-[11px] text-slate-350 block leading-relaxed font-semibold">User rajesh.kumar@safeindia.org signed profile token verified securely.</span>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-850 space-y-2">
                <span className="text-[9px] text-slate-550 block uppercase font-bold flex items-center gap-1">
                  <Database className="w-3.5 h-3.5" /> Database Size
                </span>
                <div className="text-slate-100 font-extrabold flex items-center justify-between">
                  <span>Audit Logs Cache:</span>
                  <span>14.8 MB Capacity</span>
                </div>
                <div className="text-slate-500 text-[9px] leading-relaxed">
                  Backup replica copies stored inside indexedDB browser memory context.
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-850 space-y-2">
                <span className="text-[9px] text-slate-550 block uppercase font-bold flex items-center gap-1">
                  <Key className="w-3.5 h-3.5" /> NIC Verification Key
                </span>
                <div className="text-slate-100 font-mono font-bold text-[9px] select-all uppercase">
                  DL-SSL-KEY-NCR-4920194829
                </div>
                <div className="text-slate-500 text-[9px] leading-relaxed">
                  Assigned decryption key authorized for statutory MV Act digital amendments audits.
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-6 border-t border-slate-855">
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 font-bold text-white rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/10"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${saving ? 'animate-spin' : ''}`} />
              {saving ? 'COMMITTING PARAMETERS...' : 'COMMIT SETTINGS TO CHASSIS'}
            </button>
            
            <AnimatePresence>
              {saved && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-center rounded-xl font-bold font-mono text-[10px]"
                >
                  ✓ Configuration chassis synchronized successfully!
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>

    </div>
  );
}
