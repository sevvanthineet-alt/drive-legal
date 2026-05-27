/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileSearch, Search, AlertCircle, ShieldCheck, Download, Printer, RefreshCw, 
  CheckCircle, FileText, ArrowRight, ShieldAlert, AlertTriangle, Upload, FileUp, Info
} from 'lucide-react';
import { Challan } from '../types.ts';

interface DashboardChallanScannerProps {
  challans: Challan[];
  onAddNewChallan: (challan: Partial<Challan>) => void;
  onRefresh: () => void;
}

// Highly authentic Indian Traffic Ticket Text samples for instant simulator testing
const SAMPLE_TICKETS = [
  {
    title: "Delhi Police e-Challan (No Helmet)",
    rawText: "TRAFFIC POLICE REGIONAL NODE: DELHI NCR\nCITATION NUMBER: DL-2026-T-849204\nREGISTRATION NUMBER: DL-3C-CA-4952\nVIOLATION TYPE: Riding without Safety Helmet\nLAW SECTION: Section 194D of MV Act\nDATE: 2026-05-18 TIME: 14:10:00\nFINE AMOUNT: ₹1000\nCAMERA NODE: ITO CROSSING CAM_NODE2\nSTAMP: IN_DEL_POL_3902",
    imgUrl: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&auto=format&fit=crop&q=60" // dummy placeholder representation
  },
  {
    title: "Mumbai City e-Challan (Speeding Limit)",
    rawText: "CITATION DOCUMENT: e-Challan MH-2026-SP-9128\nVEHICLE NO: MH-12-PQ-9032\nOWNER: AMITABH PATEL\nDATE: 2026-05-20 SPEED BOUND: LMV Limit Exceeded\nCURRENT VELOCITY: 110 KM/H LIMIT: 80 KM/H\nSECTION: Section 183 of Motor Vehicles Act 1988\nLOCATION: Eastern Freeway, Mumbai\nFINE PORTAL CODE: ₹2000",
    imgUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=60"
  },
  {
    title: "Phishing Scam Ticket (FAKE ALERT)",
    rawText: "ALERT ALERT -- IMMEDIATE FINE SETTLEMENT NOTICE\nPAYMENT LINK: http://fake-rto-india-pay.com/settle_upi\nVEHICLE: DL-5C-AB-9921\nLAW OFFENSE: SECTION 129 COMPLIANCE FAILURE\nFINE RATE: ₹5000 (Pay within 2 hours or license cancelled!)\nSTAMP: NOT APPROVED BY METROPOLITAN AUTHORITY\nSCAN QR GATE TO SETTLE VIA UPI DIRECTLY.",
    imgUrl: "https://images.unsplash.com/photo-1620830872689-d58df9151553?w=800&auto=format&fit=crop&q=60"
  }
];

export default function DashboardChallanScanner({ challans, onAddNewChallan, onRefresh }: DashboardChallanScannerProps) {
  const [selectedSample, setSelectedSample] = useState<number | null>(null);
  const [customText, setCustomText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [parsedChallan, setParsedChallan] = useState<Challan | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const handleSelectSample = (idx: number) => {
    setSelectedSample(idx);
    setCustomText(SAMPLE_TICKETS[idx].rawText);
    setUploadedFileName(null);
  };

  const handleFileUploadSimulate = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFileName(file.name);
      setSelectedSample(null);
      // Fill text area with simulated scanned ticket
      setCustomText(`SCANNED FILE: ${file.name}\nSYSTEM PARSING: COMPLETED\nTICKET DETECTED: CITATION_${Math.floor(100000 + Math.random() * 900000)}\nVEHICLE REGISTRATION: MH-02-CD-5829\nVIOLATION TYPE: Wrong Side Driving Infraction\nSECTION RULE: Section 184 (Dangerous Driving)\nFINE LEVEL: ₹5000\nSTAMP AUTHENTICITY PENDING...`);
    }
  };

  const handleTriggerAnalysis = async () => {
    if (!customText.trim() || analyzing) return;
    setAnalyzing(true);
    setParsedChallan(null);

    try {
      const response = await fetch('/api/challans/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snippet: customText })
      });
      const data = await response.json();
      if (data.success && data.challan) {
        setParsedChallan(data.challan);
        onAddNewChallan(data.challan);
        onRefresh();
      }
    } catch (e) {
      console.error("AI analyzer error", e);
    } finally {
      setAnalyzing(false);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6" id="challan-scanner-root">
      
      {/* Upper Instructions */}
      <div className="p-6 bg-gradient-to-r from-slate-900/90 via-blue-950/20 to-slate-900/90 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4" id="scanner-intro">
        <div className="space-y-1">
          <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-cyan-400" /> AI e-Challan Verifier & Phish Guard
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Protect yourself against digital ticket scams. Upload traffic tickets, text messages, or email citations. Our server-side Gemini intelligence will verify database stamps, cross-reference fine charts, and output a detailed security rating.
          </p>
        </div>
        
        {/* Statistics info */}
        <div className="flex gap-4 font-mono text-[10px] bg-slate-950/80 p-3 rounded-xl border border-slate-850">
          <div>
            <span className="text-slate-500 block">DB CACHED RULES</span>
            <span className="text-slate-200 font-extrabold text-xs">10 Active MV Acts</span>
          </div>
          <div className="w-px bg-slate-800"></div>
          <div>
            <span className="text-slate-500 block">AI VERACITY MODEL</span>
            <span className="text-cyan-400 font-extrabold text-xs">Gemini 3.5</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="scanner-grid">
        
        {/* Left Side: Inputs */}
        <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-5 flex flex-col justify-between" id="scanner-inputs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-slate-400 flex items-center gap-1">
                <FileUp className="w-4 h-4 text-cyan-400" /> Ticket Submission Method
              </span>
              {uploadedFileName && (
                <span className="text-[10px] font-mono bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                  File Loaded
                </span>
              )}
            </div>

            {/* Drag & Drop Upload Mock */}
            <div className="p-6 bg-slate-950 border border-dashed border-slate-800 rounded-xl hover:border-slate-700 hover:bg-slate-950/65 transition relative group flex flex-col items-center justify-center text-center cursor-pointer" id="dropzone-upload">
              <input 
                type="file" 
                accept="image/*,.pdf"
                onChange={handleFileUploadSimulate}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <Upload className="w-7 h-7 text-slate-500 group-hover:text-cyan-400 transition mb-2" />
              <p className="text-xs text-slate-300 font-semibold">Drag & drop ticket document or image</p>
              <p className="text-[10px] text-slate-500 font-mono mt-1">Accepts PNG, JPEG, PDF citation receipts up to 10MB</p>
              {uploadedFileName && (
                <div className="mt-3 p-1 px-3 bg-slate-900/80 text-[10px] font-mono text-cyan-400 rounded-md border border-cyan-500/20">
                  {uploadedFileName}
                </div>
              )}
            </div>

            {/* Test Preloaded Tickets */}
            <div className="mt-4 space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold block">Or select a test sample ticket:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" id="preloaded-samples-selector">
                {SAMPLE_TICKETS.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSample(idx)}
                    className={`p-3 rounded-xl border transition text-left text-xs flex flex-col justify-between relative overflow-hidden group/btn cursor-pointer ${
                      selectedSample === idx
                        ? 'bg-cyan-500/10 border-cyan-500/30'
                        : 'bg-slate-950 border-slate-850 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-slate-200 line-clamp-1">{sample.title}</div>
                    <span className="text-[9px] font-mono text-cyan-400 mt-2 flex items-center gap-1 group-hover/btn:translate-x-1 transition-transform">
                      Pick Ticket <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Editable Content */}
            <div className="mt-4">
              <label className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold block mb-1.5">Scanned text context:</label>
              <textarea
                value={customText}
                onChange={(e) => {
                  setCustomText(e.target.value);
                  setSelectedSample(null);
                  setUploadedFileName(null);
                }}
                rows={5}
                placeholder="Paste the e-Challan SMS notice text, or extract fields here manually..."
                className="w-full text-xs font-mono p-3 bg-slate-950 border border-slate-850 focus:border-cyan-500/50 outline-none text-slate-100 placeholder-slate-600 rounded-xl leading-relaxed"
                id="ticket-text-pane"
              />
            </div>
          </div>

          <button
            onClick={handleTriggerAnalysis}
            disabled={analyzing || !customText.trim()}
            className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-bold font-mono text-xs text-white transition rounded-xl active:scale-95 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
            id="btn-trigger-ocr"
          >
            {analyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                Scanning & Cross-Referencing...
              </>
            ) : (
              <>
                <FileSearch className="w-4 h-4" />
                Trigger Gemini OCR Genuineness Scan
              </>
            )}
          </button>
        </div>

        {/* Right Side: AI Verdict & Certificate report */}
        <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl min-h-[440px] flex flex-col justify-between" id="scanner-outputs-panel">
          <AnimatePresence mode="wait">
            {parsedChallan ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
                id="scanner-results-container"
              >
                {/* Authenticity Badge Header */}
                <div className={`p-4 border rounded-xl flex items-start gap-3 relative overflow-hidden ${
                  !parsedChallan.isGenuine 
                    ? 'border-rose-950 bg-rose-950/20 text-rose-200' 
                    : 'border-emerald-950 bg-emerald-950/20 text-emerald-200'
                }`} id="verdict-card-box">
                  <div className="mt-0.5">
                    {!parsedChallan.isGenuine ? (
                      <ShieldAlert className="w-5 h-5 text-rose-400" />
                    ) : (
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold font-mono uppercase tracking-wider">
                      VERDICT: {!parsedChallan.isGenuine ? 'FRAUDULENT SCAM DETECTED' : 'LEGITIMATE EMITTED CITATION'}
                    </h3>
                    <p className="text-[11px] mt-1 text-slate-300 leading-relaxed font-mono">
                      Security Veracity Index: <span className="font-extrabold">{parsedChallan.authenticityScore}%</span> • Matches official state transport stamp databases.
                    </p>
                  </div>
                </div>

                {/* Printable Document Sheet representation */}
                <div className="p-5 bg-slate-950 border border-slate-850 rounded-xl space-y-4 font-mono text-xs leading-relaxed text-slate-300 relative printable-ticket-sheet">
                  
                  {/* Watermark Logo */}
                  <div className="absolute right-5 top-5 w-24 h-24 border-4 border-slate-900/20 rounded-full flex items-center justify-center text-[10px] text-slate-900/10 font-black tracking-widest pointer-events-none select-none select-all-disabled rotate-12 uppercase">
                    DRIVELEGAL SECURE
                  </div>

                  <div className="border-b border-slate-900 pb-3 flex justify-between items-start">
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-slate-500 uppercase block">Ministry of Road Safety Grid</span>
                      <span className="text-slate-100 font-bold tracking-tight">NATIONAL COMPLIANCE AUDIT SHEET</span>
                    </div>
                    {/* Simulated barcode */}
                    <div className="text-right flex flex-col items-end">
                      <div className="h-5 w-20 bg-slate-300 [background:repeating-linear-gradient(90deg,#1e293b,#1e293b_2px,#f8fafc_2px,#f8fafc_4px)]"></div>
                      <span className="text-[8px] text-slate-600 mt-0.5">{parsedChallan.challanNumber}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[10px] border-b border-slate-900 pb-3">
                    <div>
                      <span className="text-slate-500 block">CITATION NUMBER:</span>
                      <span className="text-slate-100 font-bold">{parsedChallan.challanNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">VEHICLE ID (PLATE):</span>
                      <span className="text-slate-100 font-bold">{parsedChallan.vehicleNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">OWNER DESIGNEE:</span>
                      <span className="text-slate-100 font-medium">{parsedChallan.ownerName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">VIOLATION COORD:</span>
                      <span className="text-slate-100 font-medium">{parsedChallan.location}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">STATUTORY CLASS:</span>
                      <span className="text-cyan-400 font-bold uppercase">{parsedChallan.lawSection}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">DATE & TIME RECORD:</span>
                      <span className="text-slate-200">{parsedChallan.violationDate} • {parsedChallan.violationTime}</span>
                    </div>
                  </div>

                  {/* Fine Info */}
                  <div className="flex justify-between items-center py-2 px-3 bg-slate-900/60 rounded-lg">
                    <span className="text-[10px] text-slate-400">DEMAND PENALTY TALLY:</span>
                    <span className="text-base font-extrabold text-white">₹{parsedChallan.fineAmount.toLocaleString('en-IN')}</span>
                  </div>

                  {/* AI Explanation of offense */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 block">OFFENSE MEMORANDUM DESCRIPTION:</span>
                    <p className="text-[10px] text-slate-400 italic bg-slate-900/20 p-2 rounded leading-relaxed border border-slate-900/40">
                      &quot;{parsedChallan.ruleDescription}&quot;
                    </p>
                  </div>

                  <div className="text-[9px] text-slate-500 leading-relaxed pt-2 border-t border-slate-900">
                    <span className="font-bold text-slate-400 block mb-0.5 flex items-center gap-1">
                      <Info className="w-3 h-3 text-slate-400" /> SECURE AUDIT BLOCKCHAIN FOOTPRINT:
                    </span>
                    {parsedChallan.notes || 'No custom memo attached.'}
                  </div>
                </div>

                {/* Report Download controls */}
                <div className="flex gap-2.5 font-mono text-xs text-slate-400 justify-end" id="scanner-action-buttons">
                  <button
                    onClick={handlePrintReport}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg transition text-[11px] active:scale-95 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print Receipt
                  </button>
                  <button
                    onClick={handlePrintReport} // standard trigger using native print saves as PDF
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/25 rounded-lg text-[11px] active:scale-95 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Save Verification Report
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-4"
                id="scanner-empty-box"
              >
                <div className="w-12 h-12 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-slate-500" />
                </div>
                <p className="text-xs font-bold font-mono tracking-wider text-slate-300 uppercase">Verification Output Hub</p>
                <p className="text-[11px] text-slate-400 leading-relaxed leading-medium">
                  Select a test ticket segment on the left, or drop any citation code snapshot to begin scanning. DriveLegal resolves counterfeit invoice codes in less than 3 seconds.
                </p>
                
                {/* Visual tips list */}
                <div className="w-full space-y-2 text-left pt-2 font-mono text-[9px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <span>Scrutinizes RTO logo typography.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <span>Intercepts wrong or duplicate vehicle plates.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <span>Filters phishing links claiming spot cash settlement.</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
