/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, Bot, User as UserIcon, Mic, MicOff, Languages, BookOpen, AlertCircle, 
  HelpCircle, Scale, Coins, ShieldCheck, RefreshCw, Sparkles, AlertTriangle
} from 'lucide-react';
import { ChatMessage, User } from '../types.ts';

interface DashboardLegalAssistantProps {
  user: User;
  chatHistory: ChatMessage[];
  onAddMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => Promise<ChatMessage>;
  onClearHistory: () => Promise<void>;
}

export default function DashboardLegalAssistant({ user, chatHistory, onAddMessage, onClearHistory }: DashboardLegalAssistantProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState<'en' | 'hi' | 'ta' | 'te' | 'mr'>('en');
  const [voiceActive, setVoiceActive] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const RIGHTS_FAQS = [
    {
      q: "Can officers seize vehicle keys?",
      a: "No confiscation. Physical key extraction by officers is illegal. Impounding requires Section 207 documentation."
    },
    {
      q: "Is DigiLocker RC/License valid?",
      a: "Yes. MoRTH notifications mandate digital certificates on DigiLocker or mParivahan are legally on par with originals."
    },
    {
      q: "What if officer has no uniform?",
      a: "Demand verification. Under Police regulations, checking officers must wear standard uniforms with visible badges."
    }
  ];

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, loading]);

  // Multilingual preset questions translation map
  const LANGUAGE_DATA = {
    en: {
      placeholder: "Query traffic fines, MV Act sections, signal violations...",
      presets: [
        { label: "Fine for riding with no helmet?", query: "What is the legal fine for riding without a helmet in India?" },
        { label: "Penalty for Drunk driving?", query: "What are the sections and fine penalties for drinking and driving in India?" },
        { label: "Jumping traffic signal section?", query: "Which section in the Motor Vehicles Act governs jumping red light signals?" },
        { label: "Fines for speeding on expressway?", query: "What is the speed limit fine for light motor vehicles in India?" }
      ],
      aiBadge: "LEGAL INTEL GROUNDED",
      clearDisclaimer: "Note: AI outputs strictly parse statutory clauses of the Motor Vehicles Amendment Act, 2019.",
      clearBtn: "Clear Court Files",
    },
    hi: {
      placeholder: "यातायात सुरक्षा नियमों, जर्माने अथवा धारा के बारे में पूछें...",
      presets: [
        { label: "बिना हेलमेट का चालान कितना है?", query: "What is the legal fine for riding without a helmet in India?" },
        { label: "शराब पीकर गाड़ी चलाने की धारा?", query: "What are the sections and fine penalties for drinking and driving in India?" },
        { label: "रेड लाइट सिग्नल तोड़ने पर दंड?", query: "Which section in the Motor Vehicles Act governs jumping red light signals?" },
        { label: "एक्सप्रेस-वे पर स्पीडिंग का जुर्माना?", query: "What is the speed limit fine for light motor vehicles in India?" }
      ],
      aiBadge: "विधिक एआई सक्रिय",
      clearDisclaimer: "नोट: एआई विधिक सलाह केवल मोटर वाहन संशोधन अधिनियम, 2019 के अंतर्गत है।",
      clearBtn: "इतिहास मिटाएं",
    },
    ta: {
      placeholder: "போக்குவரத்து அபராதங்கள், மோட்டார் வாகனச் சட்டங்கள் பற்றி கேளுங்கள்...",
      presets: [
        { label: "ஹெல்மெட் இல்லை என்றால் எவ்வளவு அபராதம்?", query: "What is the legal fine for riding without a helmet in India?" },
        { label: "மது அருந்திவிட்டு ஓட்டினால் தண்டனை?", query: "What are the sections and fine penalties for drinking and driving in India?" },
        { label: "சிக்னல் மீறல் சட்டம் என்ன?", query: "Which section in the Motor Vehicles Act governs jumping red light signals?" },
        { label: "அதிவேக வாகன அபராதம்?", query: "What is the speed limit fine for light motor vehicles in India?" }
      ],
      aiBadge: "சட்ட ஏஐ இயங்குகிறது",
      clearDisclaimer: "குறிப்பு: அபராதத் தொகைகள் அனைத்தும் புதிய மோட்டார் வாகனத் திருத்தச் சட்டம் 2019-ன் படி விவரிக்கப்பட்டுள்ளன.",
      clearBtn: "பதிவுகளை அழி",
    },
    te: {
      placeholder: "ట్రాఫిక్ చట్టాలు మరియు హెల్మెట్ జరిమానాల గురించి అడగండి...",
      presets: [
        { label: "హెల్మెట్ లేకపోతే జరిమానా ఎంత?", query: "What is the legal fine for riding without a helmet in India?" },
        { label: "మద్యం సేవించి నడిపితే శిక్షలు?", query: "What are the sections and fine penalties for drinking and driving in India?" },
        { label: "సిగ్నల్ దాటితే ఏ సెక్షన్ కింద జరిమానా?", query: "Which section in the Motor Vehicles Act governs jumping red light signals?" },
        { label: "వేగ పరిమితి దాటితే చలాన్?", query: "What is the speed limit fine for light motor vehicles in India?" }
      ],
      aiBadge: "న్యాయ ఏఐ సిద్ధంగా ఉంది",
      clearDisclaimer: "గమనిక: ఈ చట్టపరమైన సమాచారం మోటారు వాహనాల సవరణ చట్టం, 2019 ఆధారంగా రూపొందించబడింది.",
      clearBtn: "చరిత్రను తొలగించు",
    },
    mr: {
      placeholder: "रहदारी कायद्यांविषयी, दंडाची रक्कम किंवा कलमांबद्दल विचारा...",
      presets: [
        { label: "हेल्मेट नसल्यास किती दंड होतो?", query: "What is the legal fine for riding without a helmet in India?" },
        { label: "दारू पिऊन गाडी चालवण्यास काय शिक्षा आहे?", query: "What are the sections and fine penalties for drinking and driving in India?" },
        { label: "सिग्नल तोडण्याचे कलम कोणते?", query: "Which section in the Motor Vehicles Act governs jumping red light signals?" },
        { label: "द्रुतगती मार्गावर वेग मर्यादा उल्लंघन दंड?", query: "What is the speed limit fine for light motor vehicles in India?" }
      ],
      aiBadge: "कायदेशीर एआय सक्षम",
      clearDisclaimer: "टीप: एआय उत्तरे मोटर वाहन दुरुस्ती कायदा, २०१९ मधील तरतुदींवर आधारित आहेत.",
      clearBtn: "इतिहास साफ करा",
    }
  };

  const currentLangData = LANGUAGE_DATA[activeLanguage];

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;
    setLoading(true);
    setInputMessage('');
    
    try {
      // Call parent handler which does the Express server call & fetchDbState() sync
      await onAddMessage({ role: 'user', content: textToSend, session_id: 'default' });
    } catch (e) {
      console.error("Failed to query AI advisor", e);
    } finally {
      setLoading(false);
    }
  };

  // Helper toggle for voice simulation
  const handleToggleVoice = () => {
    if (!voiceActive) {
      setVoiceActive(true);
      // Simulate speech input
      setTimeout(() => {
        setInputMessage("What is the penalty for driving without a driving license in India under Section 181?");
        setVoiceActive(false);
      }, 2500);
    } else {
      setVoiceActive(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 h-[calc(100vh-170px)]" id="legal-assistant-root">
      
      {/* Sidebar: Presets and Language Selector */}
      <div className="xl:col-span-1 p-5 bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col justify-between" id="legal-sidebar-presets">
        <div className="space-y-5">
          <div>
            <span className="text-xs uppercase font-mono tracking-widest text-slate-500 font-semibold block">Section I</span>
            <h2 className="text-sm font-bold tracking-tight text-slate-200 mt-1 flex items-center gap-2">
              <Languages className="w-4 h-4 text-cyan-400" /> Dialect Translation
            </h2>
            <p className="text-[11px] text-slate-400 mt-1">Select dialect to sync the counsel presets instantaneously.</p>
            
            <div className="grid grid-cols-3 gap-1.5 mt-3 text-xs font-mono font-medium">
              {[
                { id: 'en', label: 'EN (Eng)' },
                { id: 'hi', label: 'HI (हिंदी)' },
                { id: 'ta', label: 'TA (தமிழ்)' },
                { id: 'te', label: 'TE (తెలుగు)' },
                { id: 'mr', label: 'MR (मराठी)' }
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setActiveLanguage(lang.id as any)}
                  className={`py-2 px-1 rounded border transition text-center text-[10px] cursor-pointer ${
                    activeLanguage === lang.id
                      ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                      : 'bg-slate-950/40 text-slate-400 hover:text-slate-200 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-4">
            <span className="text-xs uppercase font-mono tracking-widest text-slate-500 font-semibold block">Section II</span>
            <h2 className="text-sm font-bold tracking-tight text-slate-200 mt-1 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-purple-400" /> Presets Suggested
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5 mb-3">Instant mock testing of the Motor Vehicles Act clauses.</p>

            <div className="space-y-2">
              {currentLangData.presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputMessage(p.query);
                    handleSendMessage(p.query);
                  }}
                  className="w-full text-left p-3 bg-slate-950/40 hover:bg-slate-800/40 border border-slate-800 hover:border-slate-700/80 rounded-xl transition text-[11px] text-slate-300 leading-relaxed font-mono flex items-start gap-2 active:scale-[0.98] cursor-pointer"
                >
                  <span className="text-cyan-400 mt-0.5">•</span>
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-4">
            <span className="text-xs uppercase font-mono tracking-widest text-slate-500 font-semibold block">Section III</span>
            <h2 className="text-sm font-bold tracking-tight text-slate-200 mt-1 flex items-center gap-1.5 justify-between">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Know Your Rights
              </div>
              <span className="text-[9px] px-1.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold font-mono">CIVIL</span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5 mb-3">Statutory citizen protection guides in India.</p>

            <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
              {RIGHTS_FAQS.map((faq, idx) => {
                const isExpanded = expandedFaq === idx;
                return (
                  <div 
                    key={idx} 
                    className="border border-slate-800/60 bg-slate-950/20 rounded-lg overflow-hidden transition"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                      className="w-full text-left p-2.5 text-[10px] font-semibold text-slate-300 hover:text-white flex justify-between items-center gap-2 cursor-pointer transition select-none"
                    >
                      <span className="leading-tight">{faq.q}</span>
                      <span className="text-xs text-slate-500 shrink-0 font-bold">{isExpanded ? '−' : '+'}</span>
                    </button>
                    {isExpanded && (
                      <div className="p-2.5 pt-0 text-[10px] text-slate-400 leading-normal border-t border-slate-900 bg-slate-950/40">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-800/80 text-[10px] font-mono text-slate-500">
          <p className="leading-relaxed">{currentLangData.clearDisclaimer}</p>
          <button
            onClick={onClearHistory}
            className="w-full py-2 bg-slate-950 hover:bg-rose-950/20 text-slate-400 hover:text-rose-400 border border-slate-850 hover:border-rose-950 transition rounded-lg text-center font-bold font-mono active:scale-95 cursor-pointer"
          >
            {currentLangData.clearBtn}
          </button>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="xl:col-span-3 bg-slate-900/20 border border-slate-800 rounded-2xl flex flex-col overflow-hidden relative" id="legal-chat-box">
        
        {/* Chat Header */}
        <div className="p-4 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between" id="chat-box-header">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-xs font-bold font-mono tracking-wider text-slate-200 flex items-center gap-1.5 uppercase">
                DriveLegal AI Advisor 
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-medium">LIVE</span>
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">Grounded statutory answers • MV Act, 1988 Legal Sandbox</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-md uppercase font-bold tracking-wider">
              {currentLangData.aiBadge}
            </span>
          </div>
        </div>

        {/* Scrolling Chat Logs */}
        <div 
          ref={scrollRef}
          className="flex-1 p-5 overflow-y-auto space-y-6 bg-slate-950/20"
          id="chat-logs-viewport"
        >
          {chatHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-4" id="chat-no-records">
              <div className="w-12 h-12 bg-slate-900 border border-slate-800/80 rounded-2xl flex items-center justify-center mb-1">
                <Scale className="w-6 h-6 text-cyan-400" />
              </div>
              <p className="text-sm font-bold text-slate-200 font-mono">Judicial Traffic Counsel Interface</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Welcome to India&apos;s primary AI enforcement adviser. Ask any road law compliance questions. Preloaded values map helmet, drunk driving, license violations, and seatbelts to the latest fines.
              </p>
              <div className="grid grid-cols-2 gap-2 w-full text-left pt-2 font-mono text-[10px]">
                <div className="p-3 border border-slate-800/80 bg-slate-950/40 rounded-xl">
                  <span className="font-bold text-cyan-400 block mb-1">✓ Smart Penalty Tally</span>
                  Know minimum court appearances or RTO spot fines.
                </div>
                <div className="p-3 border border-slate-800/80 bg-slate-950/40 rounded-xl">
                  <span className="font-bold text-cyan-400 block mb-1">✓ Constitution Reference</span>
                  Verify statutory clauses and Concurrent Schedule maps.
                </div>
              </div>
            </div>
          ) : (
            chatHistory.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div 
                  key={msg.id || index}
                  className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start md:mr-12'}`}
                  id={`chat-item-${index}`}
                >
                  {/* Model Icon */}
                  {!isUser && (
                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-cyan-400" />
                    </div>
                  )}

                  <div className="space-y-2.5 max-w-full">
                    {/* Chat Text Bubble */}
                    <div 
                      className={`p-4 rounded-2xl text-xs leading-relaxed max-w-prose ${
                        isUser 
                          ? 'bg-blue-600/15 border border-blue-500/20 text-slate-100 rounded-tr-none' 
                          : 'bg-slate-900/60 border border-slate-800 text-slate-200 rounded-tl-none glass'
                      }`}
                    >
                      {msg.content}
                    </div>

                    {/* Integrated Structured Legal Cards for Model answers */}
                    {!isUser && msg.legalDetails && msg.legalDetails.sectionNumber && msg.legalDetails.sectionNumber !== 'N/A' && (
                      <div className="p-5 border border-slate-800 bg-slate-950/80 rounded-2xl space-y-4 font-mono text-[11px] max-w-prose border-l-4 border-l-cyan-500 shadow-xl shadow-cyan-950/10">
                        {/* Header Banner */}
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <div className="flex items-center gap-2">
                            <Scale className="w-4 h-4 text-cyan-400" />
                            <span className="font-bold text-slate-100 tracking-wider uppercase">MOTOR VEHICLES ACT COMPLIANCE REPORT</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {msg.legalDetails.verificationRecommended ? (
                              <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-[9px] tracking-wide animate-pulse uppercase">
                                ⚠️ Verification Recommended
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-[9px] tracking-wide uppercase">
                                ✓ Verified Statutory Source
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-bold text-[9px] hidden sm:inline">
                              PARIVAHAN INTEGRATED
                            </span>
                          </div>
                        </div>

                        {/* Bento Grid 1: Basic Statutory Facts */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-1">
                            <span className="text-[10px] text-slate-500 font-semibold block uppercase tracking-wide">Violation Classification</span>
                            <div className="flex items-center gap-2 pt-0.5">
                              <span className="text-sm shrink-0">
                                {msg.legalDetails.violationName?.toLowerCase().includes('helmet') ? '🏍️' :
                                 msg.legalDetails.violationName?.toLowerCase().includes('drunk') || msg.legalDetails.violationName?.toLowerCase().includes('drink') || msg.legalDetails.violationName?.toLowerCase().includes('alcohol') ? '🍺' :
                                 msg.legalDetails.violationName?.toLowerCase().includes('signal') || msg.legalDetails.violationName?.toLowerCase().includes('light') ? '🚦' :
                                 msg.legalDetails.violationName?.toLowerCase().includes('speed') || msg.legalDetails.violationName?.toLowerCase().includes('limit') ? '⚡' :
                                 msg.legalDetails.violationName?.toLowerCase().includes('license') || msg.legalDetails.violationName?.toLowerCase().includes('rc') || msg.legalDetails.violationName?.toLowerCase().includes('document') ? '📂' :
                                 '🛡️'}
                              </span>
                              <span className="text-slate-200 font-bold block leading-snug">{msg.legalDetails.violationName || 'General Infraction'}</span>
                            </div>
                          </div>
                          
                          <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-1">
                            <span className="text-[10px] text-slate-500 font-semibold block uppercase tracking-wide">Statutory Authority</span>
                            <span className="text-cyan-400 font-extrabold block text-sm">{msg.legalDetails.sectionNumber}</span>
                            <span className="text-[9px] text-slate-400 block">{msg.legalDetails.lawName || 'Motor Vehicles Act, 1988'}</span>
                          </div>
                        </div>

                        {/* Bento Grid 2: Penal Assessment */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                          {/* Financial Liability */}
                          <div className="p-2.5 bg-slate-900/40 border border-slate-850 rounded-xl text-center space-y-1">
                            <span className="text-[9px] text-slate-500 block">BASE FINE</span>
                            <span className="text-emerald-400 font-black text-xs flex items-center justify-center gap-0.5">
                              <Coins className="w-3.5 h-3.5" /> ₹{(msg.legalDetails.fineAmount || 0).toLocaleString('en-IN')}
                            </span>
                          </div>

                          {/* Risk Level */}
                          <div className="p-2.5 bg-slate-900/40 border border-slate-850 rounded-xl text-center space-y-1">
                            <span className="text-[9px] text-slate-500 block">CRITICALITY</span>
                            <span className={`px-1 rounded text-[10px] font-bold block ${
                              msg.legalDetails.riskLevel === 'Critical' ? 'text-red-400 bg-red-950/25 border border-red-900/30' : 
                              msg.legalDetails.riskLevel === 'High' ? 'text-amber-400 bg-amber-950/25 border border-amber-900/30' : 
                              'text-emerald-400 bg-emerald-950/25 border border-emerald-900/30'
                            }`}>{msg.legalDetails.riskLevel || 'Medium'}</span>
                          </div>

                          {/* License Suspension Liability */}
                          <div className="p-2.5 bg-slate-900/40 border border-slate-850 rounded-xl text-center space-y-1">
                            <span className="text-[9px] text-slate-500 block">LICENSE STATUS</span>
                            <span className="text-slate-200 font-semibold text-[10px] block truncate" title={msg.legalDetails.licenseSuspension}>
                              {msg.legalDetails.licenseSuspension || 'No Suspension'}
                            </span>
                          </div>

                          {/* Estimated Impact on Score */}
                          <div className="p-2.5 bg-slate-900/40 border border-slate-850 rounded-xl text-center space-y-1">
                            <span className="text-[9px] text-slate-500 block">SAFETY SCORE IMPACT</span>
                            <span className="text-orange-400 font-black text-[10px] block">
                              {msg.legalDetails.safetyScoreImpact ? `${msg.legalDetails.safetyScoreImpact} pts` : '-10 pts'}
                            </span>
                          </div>
                        </div>

                        {/* Tab-like Stack of Panels: Legal Specifics */}
                        <div className="space-y-2.5">
                          {/* Constitutional Reference block */}
                          {msg.legalDetails.constitutionReference && msg.legalDetails.constitutionReference !== 'N/A' && (
                            <div className="p-3 bg-slate-900/40 border border-slate-850 rounded-xl space-y-1">
                              <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wide block">Constitutional Context / Jurisdiction</span>
                              <span className="text-slate-300 leading-normal block">{msg.legalDetails.constitutionReference}</span>
                            </div>
                          )}

                          {/* Imprisonment / Statutory Penalties */}
                          {msg.legalDetails.imprisonmentDetails && msg.legalDetails.imprisonmentDetails !== 'N/A' && (
                            <div className="p-3 bg-red-950/10 border border-red-950/20 rounded-xl space-y-1 text-slate-300">
                              <span className="text-[9px] text-red-400 font-semibold uppercase tracking-wide block">Imprisonment & Custodial Provisions</span>
                              <span className="text-slate-300 leading-normal block">{msg.legalDetails.imprisonmentDetails}</span>
                            </div>
                          )}

                          {/* Recidivism Consequences (Repeat Offense) */}
                          {msg.legalDetails.repeatOffense && msg.legalDetails.repeatOffense !== 'N/A' && (
                            <div className="p-3 bg-red-950/15 border border-red-950/30 rounded-xl space-y-1 text-slate-300">
                              <span className="text-[9px] text-red-400 font-semibold uppercase tracking-wide block">Repeat Offense Conditions (Recidivism)</span>
                              <span className="text-slate-300 leading-normal block">{msg.legalDetails.repeatOffense}</span>
                            </div>
                          )}

                          {/* safetyAdvice */}
                          {msg.legalDetails.safetyAdvice && msg.legalDetails.safetyAdvice !== 'N/A' && (
                            <div className="p-3 bg-cyan-950/10 border border-cyan-950/20 rounded-xl space-y-1 text-slate-300">
                              <span className="text-[9px] text-cyan-400 font-semibold uppercase tracking-wide block">Road Safety & Hazard Advisory</span>
                              <span className="text-slate-300 leading-normal block">{msg.legalDetails.safetyAdvice}</span>
                            </div>
                          )}

                          {/* safetyRecommendation */}
                          {msg.legalDetails.safetyRecommendation && msg.legalDetails.safetyRecommendation !== 'N/A' && (
                            <div className="p-3 bg-emerald-950/10 border border-emerald-950/20 rounded-xl space-y-1 text-slate-300">
                              <span className="text-[9px] text-emerald-400 font-semibold uppercase tracking-wide block font-mono text-emerald-400">Recommended Compliance Procedures</span>
                              <span className="text-slate-300 leading-normal block">{msg.legalDetails.safetyRecommendation}</span>
                            </div>
                          )}

                          {/* documentsRequired */}
                          {msg.legalDetails.documentsRequired && msg.legalDetails.documentsRequired.length > 0 && (
                            <div className="p-3 bg-slate-900/40 border border-slate-850 rounded-xl space-y-1.5 text-slate-300">
                              <span className="text-[9px] text-slate-450 font-semibold uppercase tracking-wide block">Mandatory Documents to be Carried</span>
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {msg.legalDetails.documentsRequired.map((doc, dIdx) => (
                                  <span key={dIdx} className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded font-mono text-[9px] text-cyan-400/80">
                                    🗎 {doc}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* canContest Explanation */}
                          {msg.legalDetails.canContest && msg.legalDetails.canContest !== 'N/A' && (
                            <div className="p-3 bg-blue-950/10 border border-blue-950/25 rounded-xl space-y-1 text-slate-300">
                              <span className="text-[9px] text-blue-400 font-semibold uppercase tracking-wide block">Challan Contest & Legal Procedure</span>
                              <span className="text-slate-300 leading-normal block">{msg.legalDetails.canContest}</span>
                            </div>
                          )}
                        </div>

                        {/* Court, ledger and escalation footer data */}
                        <div className="pt-3.5 border-t border-slate-850/80 grid grid-cols-1 md:grid-cols-3 gap-3 text-[9px] text-slate-500">
                          <div>
                            <span className="block text-[8px] uppercase tracking-wider text-slate-600">Designated Traffic Court</span>
                            <span className="text-slate-400 block font-semibold truncate" title={msg.legalDetails.trafficCourt}>
                              {msg.legalDetails.trafficCourt || 'Designated Traffic Court'}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[8px] uppercase tracking-wider text-slate-600">e-Challan Portal Sync</span>
                            <span className="text-slate-400 block font-semibold truncate" title={msg.legalDetails.challanIntegration}>
                              {msg.legalDetails.challanIntegration || 'NIC Parivahan e-Challan System'}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-bold">⚠️ Court Escalation Logic</span>
                            <span className="text-red-400 block font-semibold truncate" title={msg.legalDetails.escalationLogic}>
                              {msg.legalDetails.escalationLogic || 'Standard 60 days default court forwarding escalation'}
                            </span>
                          </div>
                        </div>

                        {/* Legal Disclaimer Footnote */}
                        <div className="pt-2.5 border-t border-slate-850/50 text-center text-[8px] text-slate-500 tracking-wide font-medium italic">
                          Disclaimer: Traffic penalties and enforcement procedures may vary by state and local transport authority regulations.
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Citizen User Avatar */}
                  {isUser && (
                    <div className="w-9 h-9 rounded-xl bg-blue-600/15 border border-blue-500/35 flex items-center justify-center shrink-0">
                      <UserIcon className="w-4 h-4 text-blue-400" />
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Assistant Generation Pulse */}
          {loading && (
            <div className="flex gap-4 items-start md:mr-12" id="chat-loading-indicator">
              <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 animate-pulse">
                <Bot className="w-4 h-4 text-slate-500" />
              </div>
              <div className="p-4 rounded-2xl rounded-tl-none bg-slate-900/60 border border-slate-800 flex items-center gap-3 glass relative">
                <div className="flex space-x-1.5">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></div>
                </div>
                <span className="text-[10px] font-mono text-cyan-400/80 uppercase tracking-widest animate-pulse">Consulting Indian Code Codex...</span>
              </div>
            </div>
          )}
        </div>

        {/* Soundwave Simulation Display when active */}
        <AnimatePresence>
          {voiceActive && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 48, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-cyan-950/40 border-t border-cyan-800/20 flex items-center justify-center gap-2 overflow-hidden px-4"
              id="voice-active-soundwave"
            >
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider animate-pulse flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> AI listening dynamically...
              </span>
              <div className="flex items-end gap-1.5 h-6">
                {[...Array(12)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-1 bg-cyan-400 rounded-full" 
                    style={{ 
                      height: `${Math.floor(25 + Math.random() * 75).toString()}%`,
                      animation: `bounce 1s ease-in-out infinite alternate`,
                      animationDelay: `${(i * 0.08).toFixed(2)}s`
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Interface Area */}
        <div className="p-4 bg-slate-900/60 border-t border-slate-800/80" id="chat-input-controls">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputMessage);
            }} 
            className="flex items-center gap-2.5"
          >
            {/* simulated voice mic icon */}
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`p-3 border rounded-xl transition cursor-pointer shrink-0 active:scale-95 ${
                voiceActive 
                  ? 'bg-rose-500/25 text-rose-400 border-rose-500/40 animate-pulse' 
                  : 'bg-slate-950 hover:bg-slate-800 border-slate-800 hover:border-slate-705 text-slate-400 hover:text-slate-200'
              }`}
              id="btn-chat-mic"
              title="Speak Question"
            >
              {voiceActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={currentLangData.placeholder}
              className="flex-grow py-3 px-4 bg-slate-950 hover:bg-slate-900 focus:bg-slate-950 border border-slate-850 focus:border-cyan-500/50 outline-none text-xs rounded-xl text-slate-100 placeholder-slate-500 transition font-mono"
              id="input-chat-query"
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 focus:outline-none transition active:scale-95 disabled:opacity-30 disabled:pointer-events-none rounded-xl text-white shrink-0 cursor-pointer"
              id="btn-chat-send"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
