/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PhoneCall, ShieldAlert, Heart, Truck, AlertOctagon, Compass, MapPin, 
  BookOpen, Sparkles, PlusCircle, Check, MapPinOff, ArrowRight, Ambulance
} from 'lucide-react';
import { EmergencyContact, User } from '../types.ts';

interface DashboardEmergencyProps {
  user: User;
  emergencies: EmergencyContact[];
}

interface IncidentType {
  id: string;
  title: string;
  steps: string[];
}

const FIRST_AID_GUIDELINES: IncidentType[] = [
  {
    id: "inc-1",
    title: "High Impact Collision Response",
    steps: [
      "Ensure personal safety first. Secure your vehicle, pull to the shoulder, and switch on dual hazard blinker warning lights.",
      "Immediately dial national emergency 112, or the highway corridor response unit at 1033.",
      "Check vital alignments of the victims. Do NOT pull occupants out of the cabin if they are conscious unless there is immediate risk of combustion or vehicle collapse.",
      "Apply localized direct compression on deep-bleeding lacerations using a clean bandage or fabric.",
      "Keep the victim's cervical platform (head and neck) perfectly immobilized. Spinal injuries can escalate to permanent paralysis if twisted."
    ]
  },
  {
    id: "inc-2",
    title: "Two-Wheeler Impact (Head Injuries)",
    steps: [
      "Securing the corridor: Stand blockades or visual markers 20 meters preceding the crash spot to alert oncoming traffic.",
      "Do NOT attempt to unbuckle or rip the safety helmet off a victim forcibly. Only remove it if the airways are critically blocked and they cannot breathe.",
      "Maintain respiratory passage: If they show shallow chest movements, tilt the chin slightly up to clear vocal choke-points.",
      "Immobilize limbs: In case of leg or collarbone fractures, position padded sideboards alongside the bones to prevent vascular severing."
    ]
  },
  {
    id: "inc-3",
    title: "Thermal Burns / Engine Combustion",
    steps: [
      "Extract victims instantly from proximity to smoking or structural fire channels.",
      "Do NOT apply default generic ointments, butter, or engine grease to the burning patterns.",
      "Run continuous clean room-temperature water over dry thermal burns for 10-15 minutes. Cold ice-water can shock skin cellular structures.",
      "Cover blister structures with dry, non-fiber sterile gauze panels before trauma emergency dispatch."
    ]
  }
];

export default function DashboardEmergency({ user, emergencies }: DashboardEmergencyProps) {
  const [coords, setCoords] = useState<{ lat: number, lng: number, acc: number | null }>({ lat: 28.6139, lng: 77.2090, acc: null });
  const [activeGuide, setActiveGuide] = useState<string>("inc-1");
  const [dialingNumber, setDialingNumber] = useState<string | null>(null);
  const [sosActive, setSosActive] = useState(false);
  const [customDispatchStatus, setCustomDispatchStatus] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: Number(pos.coords.latitude.toFixed(4)),
            lng: Number(pos.coords.longitude.toFixed(4)),
            acc: Math.round(pos.coords.accuracy)
          });
        },
        () => console.log("Defaulting to Delhi Command telemetry coordinates")
      );
    }
  }, []);

  const handleSimulateCall = (phone: string, name: string) => {
    setDialingNumber(phone);
    setCustomDispatchStatus(`Connecting secure public transit voice bridge to [${name}] via national network gateway...`);
    setTimeout(() => {
      setCustomDispatchStatus(`CONNECTED (SIMULATION ACTIVE). Coordinates ${coords.lat}°N, ${coords.lng}°E automatically piped to the responding technician.`);
    }, 2500);
  };

  const handleDismissSimCall = () => {
    setDialingNumber(null);
    setCustomDispatchStatus(null);
  };

  const handleTriggerSOS = () => {
    setSosActive(!sosActive);
    if (!sosActive) {
      // simulate flashing alerts
      console.log("SOS Broadcasted to nearest 3 highway sectors");
    }
  };

  return (
    <div className="space-y-6" id="emergency-root">
      
      {/* Top Warning Banner and SOS Block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="critical-emergency-hero">
        
        {/* Callouts */}
        <div className="md:col-span-2 p-6 bg-rose-950/20 border border-rose-900/40 rounded-2xl flex flex-col justify-between" id="card-alert-banner">
          <div className="space-y-2">
            <span className="text-xs uppercase font-mono tracking-widest text-rose-450 font-bold block flex items-center gap-1.5 animate-pulse">
              <AlertOctagon className="w-4 h-4" /> CRISIS DISPATCH PORTAL
            </span>
            <h2 className="text-lg font-bold tracking-tight text-rose-100">National Road Accident Critical Coordination Support</h2>
            <p className="text-xs text-rose-200/80 leading-relaxed leading-medium">
              If you have just witnessed or been involved in a physical roadway incident, protect the quadrant first. Activating the system instantly broadcasts your secure geolocation telemetry to nearest patrolling interceptor units.
            </p>
          </div>

          <div className="flex gap-4 font-mono text-[10px] text-rose-350 bg-rose-950/40 p-3 rounded-xl border border-rose-900/30 mt-4">
            <div>
              <span className="text-rose-400 block uppercase font-bold">Your Location Coordinates</span>
              <span className="text-rose-100 font-extrabold text-xs">{coords.lat}°N, {coords.lng}°E</span>
            </div>
            <div className="w-px bg-rose-900/30"></div>
            <div>
              <span className="text-rose-400 block uppercase font-bold">Accuracy Metric</span>
              <span className="text-rose-100 font-extrabold text-xs">{coords.acc ? `${coords.acc} meters` : '15m (Default)'}</span>
            </div>
          </div>
        </div>

        {/* Big Alert SOS Trigger button */}
        <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden" id="card-big-sos">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl"></div>
          
          <button
            onClick={handleTriggerSOS}
            className={`w-28 h-28 rounded-full flex flex-col items-center justify-center text-center font-bold font-mono transition-all duration-300 shadow-xl border active:scale-95 cursor-pointer ${
              sosActive
                ? 'bg-rose-600 border-white text-white drop-shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-pulse'
                : 'bg-rose-950/40 hover:bg-rose-950/80 border-rose-900/30 text-rose-400'
            }`}
          >
            <ShieldAlert className="w-8 h-8 mb-1" />
            <span className="text-xs uppercase tracking-widest block font-extrabold">{sosActive ? 'SOS LIVE' : 'SOS DISPATCH'}</span>
          </button>
          
          <p className="text-[10px] text-slate-500 font-mono mt-3 leading-tight uppercase">
            {sosActive ? 'BROADCASTING GEOTARGET INTERCEPT...' : 'One-press emergency alert broadcast'}
          </p>
        </div>

      </div>

      {/* Grid: Rescue Directory & Guidelines */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6" id="emergency-directory-grid">
        
        {/* Rescue Directory (Police, Patrol, AIIMS, NHAI) */}
        <div className="xl:col-span-3 p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-4" id="emergency-contact-panel">
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-cyan-400 uppercase font-mono flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-cyan-400" /> Ground Patrol Rescue Nodes
            </h3>
            <span className="text-[10px] text-slate-500 font-mono block mt-0.5">Metropolitan units localized closest to current coordinates.</span>
          </div>

          <div className="space-y-3">
            {emergencies.map((em) => (
              <div 
                key={em.id} 
                className="p-4 bg-slate-950/40 border border-slate-850 hover:border-slate-750 rounded-xl transition flex items-center justify-between gap-4"
                id={`emg-node-${em.id}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl border ${
                    em.type === 'police' ? 'bg-blue-950/30 text-blue-400 border-blue-900/30' : 
                    em.type === 'ambulance' ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/30' : 
                    'bg-purple-950/30 text-purple-400 border-purple-900/30'
                  }`}>
                    {em.type === 'police' ? <ShieldAlert className="w-4.5 h-4.5" /> : em.type === 'ambulance' ? <Ambulance className="w-4.5 h-4.5" /> : <Heart className="w-4.5 h-4.5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-100">{em.name}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-850 text-slate-400 font-bold uppercase">{em.distanceKm} KM AWAY</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{em.address}</p>
                    <span className="text-[9px] font-mono text-cyan-400 mt-1.5 block">Hotline: {em.phone}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleSimulateCall(em.phone, em.name)}
                  className="flex items-center gap-1.5 font-mono font-bold text-[10px] px-3.5 py-2 hover:bg-slate-800 focus:outline-none transition border border-slate-800 hover:border-slate-705 text-slate-300 rounded-lg active:scale-95 shrink-0 cursor-pointer"
                  id={`btn-call-node-${em.id}`}
                >
                  <PhoneCall className="w-3.5 h-3.5 text-cyan-400" />
                  Trigger Alert
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* AI First-Aid and Accident response center */}
        <div className="xl:col-span-2 p-6 bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col justify-between" id="emergency-guidance-panel">
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-cyan-400 uppercase font-mono flex items-center gap-1.5 mb-3">
              <BookOpen className="w-4 h-4 text-purple-450" /> Clinical Road First Aid Manual
            </h3>

            {/* Selector links */}
            <div className="flex flex-wrap gap-1 border-b border-slate-850 pb-2 mb-4 font-mono text-[10px]">
              {FIRST_AID_GUIDELINES.map((guide) => (
                <button
                  key={guide.id}
                  onClick={() => setActiveGuide(guide.id)}
                  className={`px-2 py-1 rounded transition cursor-pointer ${
                    activeGuide === guide.id
                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {guide.title.split(' ')[0]} Guide
                </button>
              ))}
            </div>

            {/* Active steps content */}
            <div className="space-y-3" id="guidelines-viewport">
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold block">
                {FIRST_AID_GUIDELINES.find(g => g.id === activeGuide)?.title}
              </span>
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {FIRST_AID_GUIDELINES.find(g => g.id === activeGuide)?.steps.map((step, idx) => (
                  <div key={idx} className="flex gap-2 text-xs leading-relaxed text-slate-300">
                    <span className="text-cyan-400 font-bold font-mono shrink-0">{idx + 1}.</span>
                    <p>{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 mt-6 text-[10px] font-mono text-slate-500">
            <span className="text-slate-400 font-bold block mb-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" /> AI Legal Incident Guide:
            </span>
            Under the &quot;Good Samaritan Law&quot; of India, court protocols strictly declare any assisting public citizens immune to secondary legal liabilities or police investigation loops. Assist casualties fearlessly.
          </div>
        </div>

      </div>

      {/* Simulated calling dialog overlay */}
      <AnimatePresence>
        {dialingNumber && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-mono" id="voice-simulation-modal">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-5 text-center shadow-2xl relative"
            >
              <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-2 animate-pulse">
                <PhoneCall className="w-6 h-6 text-cyan-400 animate-bounce" />
              </div>

              <div>
                <h4 className="text-xs uppercase tracking-widest text-slate-550 block font-bold">Secure Telephony Bridge</h4>
                <p className="text-base font-extrabold text-white mt-1">Calling {dialingNumber}</p>
                <p className="text-[11px] text-slate-450 mt-1">{customDispatchStatus}</p>
              </div>

              {/* simulated sound wave indicator */}
              <div className="flex items-end justify-center gap-1.5 h-8">
                {[...Array(8)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-1 h-4 bg-cyan-400 rounded" 
                    style={{ 
                      animation: `bounce 0.8s ease-in-out infinite alternate`,
                      animationDelay: `${(i * 0.1).toFixed(2)}s`
                    }}
                  />
                ))}
              </div>

              <button
                onClick={handleDismissSimCall}
                className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 transition text-xs font-bold text-white rounded-xl active:scale-95 cursor-pointer"
                id="btn-disconnect-secure-call"
              >
                Disconnect Call
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
