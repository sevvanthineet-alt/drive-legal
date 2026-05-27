/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, ShieldCheck, Lock, User, Mail, FileText, 
  RefreshCw, Eye, EyeOff, Key, AlertTriangle, Fingerprint, 
  ArrowRight, ShieldAlert, Check, Activity, Terminal
} from 'lucide-react';

interface SecureAuthScreenProps {
  onAuthSuccess: (token: string, user: any) => void;
}

type AuthMode = 'LOGIN' | 'REGISTER' | 'FORGOT' | 'OTP' | 'RESET';

export default function SecureAuthScreen({ onAuthSuccess }: SecureAuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [role, setRole] = useState<'citizen' | 'officer' | 'admin' | 'superadmin'>('citizen');
  const [rememberMe, setRememberMe] = useState(true);

  // Forgot Password / OTP verify / Reset password states
  const [otpToken, setOtpToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password strength meter calculation on registration / reset
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

  const strength = getPasswordStrength(mode === 'REGISTER' ? password : newPassword);

  const resetFormAlerts = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  // Demo bypass logic trigger
  const triggerBypassNode = async (selectedRole: typeof role) => {
    setLoading(true);
    resetFormAlerts();

    const roleCredentials: Record<string, string> = {
      citizen: 'rajesh.kumar@safeindia.org',
      officer: 'officer.singh@safeindia.org',
      admin: 'admin.desai@safeindia.org',
      superadmin: 'super.sharma@safeindia.org'
    };

    const defaultPasswords: Record<string, string> = {
      citizen: 'citizen123',
      officer: 'officer123',
      admin: 'admin123',
      superadmin: 'super123'
    };

    const loginEmail = roleCredentials[selectedRole];
    const loginPass = defaultPasswords[selectedRole];

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPass })
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMsg(data.message);
        setTimeout(() => {
          onAuthSuccess(data.token, data.user);
        }, 800);
      } else {
        setErrorMsg(data.error);
      }
    } catch (e) {
      setErrorMsg("INTELLIGENCE MODULE OFFLINE — Express server fallback error.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("AUTHENTICATION TIMEOUT — Missing credentials signature.");
      return;
    }
    setLoading(true);
    resetFormAlerts();

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMsg(data.message);
        if (rememberMe) {
          localStorage.setItem('drivelegal_session_token', data.token);
        }
        setTimeout(() => {
          onAuthSuccess(data.token, data.user);
        }, 850);
      } else {
        setErrorMsg(data.error || "Authentication Failed — Unauthorized Credential Signature");
      }
    } catch (e) {
      setErrorMsg("AUTHENTICATION CRITICAL ERROR — Server connection denied.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMsg("SIGNUP INCOMPLETE — Standard registration parameters must be completed.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("INSUFFICIENT SECURITY INDEX — Codewalls must exceed 6 bytes.");
      return;
    }
    setLoading(true);
    resetFormAlerts();

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, licenseNumber, vehicleNumber })
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMsg(data.message);
        if (rememberMe) {
          localStorage.setItem('drivelegal_session_token', data.token);
        }
        setTimeout(() => {
          onAuthSuccess(data.token, data.user);
        }, 1000);
      } else {
        setErrorMsg(data.error || "Registry Failed. Try again.");
      }
    } catch (e) {
      setErrorMsg("SERVER DISPATCH FAILER — Error compiling user state card.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("INDEX RESOLUTION FAILED — Direct valid email is mandatory.");
      return;
    }
    setLoading(true);
    resetFormAlerts();

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMsg(data.message);
        // Pre-fill the OTP inside token state for easy simulation block
        if (data.token) {
          setOtpToken(data.token);
        }
        setTimeout(() => {
          setMode('OTP');
          resetFormAlerts();
        }, 1500);
      } else {
        setErrorMsg(data.error || "Profile not indexed.");
      }
    } catch (e) {
      setErrorMsg("API TRANSACTION FAILED — Verification tunnel failure.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpToken) {
      setErrorMsg("SIGNATURE EXCEPTION — Security OTP sequence absent.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccessMsg("TOKEN INTEGRATION MATCHED — Decryption key certified.");
      setTimeout(() => {
        setMode('RESET');
        resetFormAlerts();
      }, 1000);
    }, 800);
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setErrorMsg("COMPLIANCE REJECTION — Fields must not be blank.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("COMPLIANCE REJECTION — New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg("INSUFFICIENT SEGMENT — Crypt-key strength bounds omitted.");
      return;
    }
    setLoading(true);
    resetFormAlerts();

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: otpToken, password: newPassword })
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMsg(data.message);
        setTimeout(() => {
          setMode('LOGIN');
          resetFormAlerts();
          setPassword('');
        }, 1500);
      } else {
        setErrorMsg(data.error);
      }
    } catch (e) {
      setErrorMsg("DATABASE REWRITE DENIED — Access token credentials invalid.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#020617] flex flex-col items-center justify-center p-4 relative overflow-hidden text-xs text-slate-350 select-none font-mono" id="secure-access-canvas">
      
      {/* Dynamic Cybernetic BG Animation grid */}
      <div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(to_right,#00bcd4_1px,transparent_1px),linear-gradient(to_bottom,#00bcd4_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none -z-10"></div>
      
      {/* Cinematic neon safety rings */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none -z-20 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[160px] pointer-events-none -z-20"></div>

      <div className="w-full max-w-sm flex items-center justify-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Shield className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-normal text-white uppercase flex items-center gap-1.5 leading-none">
              DriveLegal <span className="text-cyan-400 text-xs font-mono font-bold tracking-tight">V3.5</span>
            </h1>
            <span className="text-[9px] tracking-widest text-slate-500 uppercase leading-none block mt-1 font-bold">Smart Government Law Portal</span>
          </div>
        </div>
      </div>

      {/* Main Glassmorphic Auth Panel Card */}
      <div className="w-full max-w-lg bg-[#07111F]/80 backdrop-blur-2xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative" id="auth-glass-container">
        
        {/* Terminal Indicator Line */}
        <div className="h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 w-full animate-pulse"></div>

        <div className="p-6 md:p-8 space-y-6">
          
          {/* Active node identity banner */}
          <div className="flex items-center justify-between bg-slate-950/40 p-3 rounded-xl border border-slate-850">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                NATIONAL SECURITY CLIENT
              </span>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[8px] bg-slate-900 border border-slate-800 text-slate-500 font-bold">
              SSL CORE VERIFIED
            </span>
          </div>

          {/* ERROR STATUS ALERTS */}
          <AnimatePresence mode="wait">
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-3.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl flex items-start gap-2.5 font-sans text-[11px] leading-normal"
                id="error-msg-box"
              >
                <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold block uppercase tracking-wide text-[9px] font-mono text-rose-500">Security Event Abnormality</span>
                  {errorMsg}
                </div>
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-3.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl flex items-start gap-2.5 font-sans text-[11px] leading-normal"
                id="success-msg-box"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold block uppercase tracking-wide text-[9px] font-mono text-emerald-400">Cryptographic Success</span>
                  {successMsg}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* DYNAMIC FORMS ACCORDING TO MODE */}
          
          {/* 1. LOGIN MODE */}
          {mode === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4" id="form-citizen-login">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest block font-bold">NIC Registered Email:</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E.g., rajesh.kumar@safeindia.org"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 pl-10.5 text-slate-200 outline-none focus:border-cyan-500/40 transition-colors"
                    id="inp-login-email"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest block font-bold">Agency Access Code:</label>
                  <button 
                    type="button" 
                    onClick={() => setMode('FORGOT')}
                    className="text-[10px] text-cyan-455 hover:text-cyan-400 hover:underline cursor-pointer select-none"
                    id="lnk-forgot-code"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 pl-10.5 text-slate-200 outline-none focus:border-cyan-500/40 transition-colors"
                    id="inp-login-pass"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-550 hover:text-slate-300 cursor-pointer"
                    id="btn-login-pass-toggle"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-400 text-[10px] select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="rounded bg-slate-950 border-slate-800 h-4 w-4 text-cyan-500 accent-cyan-555 cursor-pointer"
                    id="check-remember-flag"
                  />
                  Keep secure tunnel cached
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold uppercase rounded-xl tracking-wider active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/10"
                id="btn-execute-auth"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    DECRYPTING CREDENTIAL KEYS...
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-4 h-4 text-white" />
                    Secure Login Authorized
                  </>
                )}
              </button>
            </form>
          )}

          {/* 2. REGISTER MODE */}
          {mode === 'REGISTER' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4" id="form-register-citizen">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-500 uppercase font-black block font-bold">Citizen Full Name:</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="E.g., Rajesh Kumar"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 pl-9 text-slate-200 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-500 uppercase font-black block font-bold">Email (National Record):</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="re.rajesh@gmail.com"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 pl-9 text-slate-200 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 hidden">
                  {/* Keep in schema but default */}
                </div>
                <div className="space-y-1.5 w-full col-span-2">
                  <label className="text-[9px] text-slate-500 uppercase font-black block font-bold">Requested System Clearance Role:</label>
                  <select
                    value={role}
                    onChange={(e: any) => setRole(e.target.value)}
                    className="w-full bg-slate-955 border border-slate-800 rounded-xl p-2.5 text-slate-200 outline-none cursor-pointer"
                  >
                    <option value="citizen">Citizen Representative (Standard Access)</option>
                    <option value="officer">Traffic Enforcement Officer (Roadside Audits)</option>
                    <option value="admin">System Operations Director (RTO Core)</option>
                    <option value="superadmin">Supreme Infrastructure Sovereign</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-500 uppercase font-black block font-bold">Driving License ID (DL):</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="text"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      placeholder="DL-142010482901"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 pl-9 text-slate-200 outline-none font-bold placeholder-slate-700 uppercase"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-500 uppercase font-black block font-bold">Primary Vehicle Registration (RC):</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="text"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      placeholder="DL-3C-CA-4952"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 pl-9 text-slate-200 outline-none font-bold placeholder-slate-700 uppercase"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] text-slate-500 uppercase font-black block font-bold">Codewall Protection Password:</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 pl-9 text-slate-200 outline-none"
                  />
                </div>

                {/* Password strength meter visual bar */}
                {password && (
                  <div className="space-y-1 pt-1.5 font-sans">
                    <div className="flex justify-between items-center text-[9px] font-mono uppercase font-bold">
                      <span className="text-slate-500">Security Index Keywall:</span>
                      <span className={strength.score <= 2 ? 'text-rose-400' : strength.score <= 4 ? 'text-yellow-400' : 'text-emerald-400'}>
                        {strength.label}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-950/80 rounded overflow-hidden flex gap-0.5">
                      <div className={`h-full transition-all ${strength.color} ${strength.score >= 1 ? 'w-1/3' : 'w-0'}`} />
                      <div className={`h-full transition-all ${strength.color} ${strength.score >= 3 ? 'w-1/3' : 'w-0'}`} />
                      <div className={`h-full transition-all ${strength.color} ${strength.score >= 5 ? 'w-1/3' : 'w-0'}`} />
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-550 text-white font-extrabold uppercase rounded-xl tracking-wider active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" /> : "PRODUCE NATIONAL PROFILE STATE"}
              </button>
            </form>
          )}

          {/* 3. FORGOT PASSWORD SYSTEM */}
          {mode === 'FORGOT' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4" id="form-forgot-pass">
              <div className="text-[11px] text-slate-400 leading-relaxed font-sans bg-slate-950/30 p-3 rounded-lg border border-slate-850">
                Provide your officially registered email index. System credentials recovery module will formulate a simulated secret OTP validation signature.
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase font-black block font-bold">Indexed Email:</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rajesh.kumar@safeindia.org"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 pl-10.5 text-slate-200 outline-none"
                    id="inp-forgot-email"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black uppercase rounded-xl active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
                id="btn-forgot-submit"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : "COMPILE RECOVERY KEY_TOKEN"}
              </button>
            </form>
          )}

          {/* 4. OTP / TOKEN ENTER MODE */}
          {mode === 'OTP' && (
            <form onSubmit={handleOtpVerify} className="space-y-4" id="form-otp-verify">
              <div className="text-[11px] text-slate-400 leading-relaxed font-sans bg-emerald-500/5 p-3.5 rounded-lg border border-emerald-500/10">
                A verification token signature has been compiled for <span className="text-emerald-400 font-bold">{email}</span>. Use the bypass auto-filled code below to check.
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase font-black block font-bold">Automated OTP Security Token:</label>
                <div className="relative font-mono">
                  <Key className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={otpToken}
                    onChange={(e) => setOtpToken(e.target.value)}
                    placeholder="OTP-XXXXXX"
                    className="w-full bg-slate-950/80 border border-emerald-550/20 rounded-xl p-3.5 pl-10.5 text-emerald-400 font-black tracking-widest outline-none uppercase"
                    id="inp-otp-token"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black uppercase rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
                id="btn-otp-submit"
              >
                Verify Cryptographic Token
              </button>
            </form>
          )}

          {/* 5. RESET PASSWORD MODE */}
          {mode === 'RESET' && (
            <form onSubmit={handleResetSubmit} className="space-y-4" id="form-reset-complete">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase font-black block font-bold">Build New Password:</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 pl-10.5 text-slate-200 outline-none"
                    id="inp-reset-newpass"
                  />
                </div>
                {newPassword && (
                  <div className="pt-1.5">
                    <div className="h-1.5 w-full bg-slate-950 rounded overflow-hidden flex gap-0.5">
                      <div className={`h-full transition-all ${strength.color} ${strength.score >= 1 ? 'w-1/3' : 'w-0'}`} />
                      <div className={`h-full transition-all ${strength.color} ${strength.score >= 3 ? 'w-1/3' : 'w-0'}`} />
                      <div className={`h-full transition-all ${strength.color} ${strength.score >= 5 ? 'w-1/3' : 'w-0'}`} />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase font-black block font-bold font-mono">Confirm New Password:</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 pl-10.5 text-slate-200 outline-none"
                    id="inp-reset-confirm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black uppercase rounded-xl cursor-pointer"
                id="btn-reset-submit"
              >
                Commit Password Rebuild
              </button>
            </form>
          )}

          {/* Form navigation links / triggers */}
          <div className="flex items-center justify-between border-t border-slate-850 pt-5 text-[10px]" id="auth-footer-nav">
            {mode === 'LOGIN' ? (
              <span className="text-slate-500 font-sans">
                First time at DriveLegal HQ?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('REGISTER'); resetFormAlerts(); }}
                  className="text-cyan-400 font-bold hover:underline font-mono cursor-pointer"
                >
                  Create Clearance Account
                </button>
              </span>
            ) : (
              <span className="text-slate-500 font-sans">
                Already registered in index?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('LOGIN'); resetFormAlerts(); }}
                  className="text-cyan-400 font-bold hover:underline font-mono cursor-pointer"
                >
                  Return to Authorized Entry
                </button>
              </span>
            )}
          </div>

        </div>

      </div>

      {/* FOOTER: FAST SECURE TEST REGULATION (DEVELOPER ENGINE CLEARANCE) */}
      <div className="w-full max-w-sm mt-6 p-4 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3" id="dev-clearance-bypass">
        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-cyan-400">
          <Terminal className="w-4 h-4 text-cyan-450 shrink-0" />
          Intel System Clearance Bypass Drawer
        </div>
        <p className="text-[9px] text-slate-500 leading-normal font-sans">
          Evaluation nodes to grant seamless clearances into the 4 distinct structural roles and target modules:
        </p>

        <div className="grid grid-cols-2 gap-2 text-[9px] font-semibold">
          <button
            type="button"
            onClick={() => triggerBypassNode('citizen')}
            disabled={loading}
            className="p-2 border border-slate-800/80 bg-slate-950/50 hover:bg-slate-900 text-slate-300 hover:text-white rounded-lg flex items-center justify-between cursor-pointer group hover:border-cyan-500/20"
          >
            <span>🏍️ Citizen Node</span>
            <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition" />
          </button>
          
          <button
            type="button"
            onClick={() => triggerBypassNode('officer')}
            disabled={loading}
            className="p-2 border border-slate-800/80 bg-slate-950/50 hover:bg-slate-900 text-slate-300 hover:text-white rounded-lg flex items-center justify-between cursor-pointer group hover:border-cyan-500/20"
          >
            <span>👮 Officer Node</span>
            <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition" />
          </button>

          <button
            type="button"
            onClick={() => triggerBypassNode('admin')}
            disabled={loading}
            className="p-2 border border-slate-800/80 bg-slate-950/50 hover:bg-slate-900 text-slate-300 hover:text-white rounded-lg flex items-center justify-between cursor-pointer group hover:border-cyan-500/20"
          >
            <span>🛡️ Admin Node</span>
            <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition" />
          </button>

          <button
            type="button"
            onClick={() => triggerBypassNode('superadmin')}
            disabled={loading}
            className="p-2 border border-slate-800/80 bg-slate-950/50 hover:bg-slate-900 text-slate-300 hover:text-white rounded-lg flex items-center justify-between cursor-pointer group hover:border-cyan-500/20"
          >
            <span>👑 Super Admin</span>
            <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition" />
          </button>
        </div>

        <div className="text-[8px] text-slate-600 font-mono text-center">
          Secured with SHA-256 Hashing and Dynamic Session Validation
        </div>
      </div>

    </div>
  );
}
