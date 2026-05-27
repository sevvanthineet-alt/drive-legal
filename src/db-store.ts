/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { LawSection, Challan, User, AlertNotification, EmergencyContact, ChatMessage, PlatformStats } from './types.ts';

const DB_FILE_PATH = path.join(process.cwd(), 'data-store.json');

// Authentic Indian Traffic Rules & Law Sections (as amended by MV Amendment Act, 2019)
const INITIAL_LAW_SECTIONS: LawSection[] = [
  {
    id: "sec-177",
    section: "Section 177",
    actName: "Motor Vehicles Act, 1988",
    title: "General Offence Penalty",
    description: "General provision for punishment of offences where no specific penalty is provided. Includes minor traffic rule infractions.",
    fineAmount: 500,
    fineAmountRepeat: 1500,
    riskLevel: "Low",
    safetyAdvice: "Adhere strictly to general directives and signage. Correct behavior immediately.",
    constitutionReference: "Article 246 (Seventh Schedule - Entry 35 on Motor Vehicles)",
    category: "General"
  },
  {
    id: "sec-179",
    section: "Section 179",
    actName: "Motor Vehicles Act, 1988",
    title: "Disobedience of Orders of Authorities",
    description: "Refusal to share information or disobeying lawful directions given by any traffic officer or authority.",
    fineAmount: 2000,
    fineAmountRepeat: 2000,
    riskLevel: "Medium",
    safetyAdvice: "Always cooperate with police officers on duty. Provide license and registration certificates promptly.",
    constitutionReference: "Article 256 of the Constitution of India (Compliance with central laws)",
    category: "General"
  },
  {
    id: "sec-181",
    section: "Section 181",
    actName: "Motor Vehicles Act, 1988",
    title: "Driving without License",
    description: "Driving a motor vehicle on public roads without holding an active or appropriate driving license.",
    fineAmount: 5000,
    fineAmountRepeat: 5000,
    riskLevel: "High",
    safetyAdvice: "Do not operate motorized units without completion of official driving safety examinations and valid credentials.",
    constitutionReference: "List II, State List Entry 57 (Taxes on Vehicles)",
    category: "License/Registration"
  },
  {
    id: "sec-182",
    section: "Section 182",
    actName: "Motor Vehicles Act, 1988",
    title: "Driving under Disqualification",
    description: "Operating a vehicle whilst disqualified from holding a driving license due to license suspension or penal orders.",
    fineAmount: 10000,
    fineAmountRepeat: 10000,
    riskLevel: "Critical",
    safetyAdvice: "Strictly comply with legal suspension periods. Driving whilst disqualified leads to swift vehicle impoundment.",
    constitutionReference: "List I, Union List Entry 42 (Interstate Trade and Commerce / Transport)",
    category: "License/Registration"
  },
  {
    id: "sec-183",
    section: "Section 183",
    actName: "Motor Vehicles Act, 1988",
    title: "Over-speeding (Light Motor Vehicles)",
    description: "Driving a vehicle at a speed exceeding the maximum speed limit specified for that sector or highway.",
    fineAmount: 2000,
    fineAmountRepeat: 4000,
    riskLevel: "High",
    safetyAdvice: "Watch highway speed signs constantly. Keep under 80 km/h in city sectors and 120 km/h on expressways.",
    constitutionReference: "List III, Concurrent List Entry 35",
    category: "Speed"
  },
  {
    id: "sec-184",
    section: "Section 184",
    actName: "Motor Vehicles Act, 1988",
    title: "Dangerous and Reckless Driving",
    description: "Operating any vehicle in a manner which is dangerous to the public, including red-light jumping, mobile usage while driving, and wrong-side driving.",
    fineAmount: 5000,
    fineAmountRepeat: 10000,
    riskLevel: "Critical",
    safetyAdvice: "Keep complete visual focus on the roadway. Avoid switching lanes erratically and strictly disable mobile phones.",
    constitutionReference: "Article 21 of the Constitution (Right to Life includes right to safe road use)",
    category: "General"
  },
  {
    id: "sec-185",
    section: "Section 185",
    actName: "Motor Vehicles Act, 1988",
    title: "Drunk Driving / Intoxication",
    description: "Driving or attempting to drive a vehicle while having a Blood Alcohol Content (BAC) exceeding 30 mg per 100 ml of blood detected in a breath analyzer.",
    fineAmount: 10000,
    fineAmountRepeat: 15000,
    riskLevel: "Critical",
    safetyAdvice: "Never drink and drive. Assign a designated driver or use cab services. Safe transit is non-negotiable.",
    constitutionReference: "Directive Principles (Article 47 - Duty of the State to raise nutrition/health levels and prohibit intoxicating drinks)",
    category: "Intoxication"
  },
  {
    id: "sec-194b",
    section: "Section 194B",
    actName: "Motor Vehicles Act, 1988",
    title: "Driving without Seatbelt",
    description: "Operating a motor vehicle without securing the driver and co-passengers in compliance with mandatory restraining cabin belt systems.",
    fineAmount: 1000,
    fineAmountRepeat: 1000,
    riskLevel: "Medium",
    safetyAdvice: "Lock and click safety belts for both front and rear occupancy cabins immediately on boarding.",
    constitutionReference: "Article 246 (Concurrent regulatory authority for public safety standard enforcement)",
    category: "Safety Gear"
  },
  {
    id: "sec-194d",
    section: "Section 194D",
    actName: "Motor Vehicles Act, 1988",
    title: "Riding without Safety Helmet",
    description: "Riding a two-wheeler vehicle without wearing a certified protective headgear conforming to Bureau of Indian Standards (BIS) specifications.",
    fineAmount: 1000,
    fineAmountRepeat: 1000,
    riskLevel: "High",
    safetyAdvice: "Always secure an ISI-approved helmet with the strap buckled firmly. This reduces collision head injury risk by 85%.",
    constitutionReference: "Section 129 of MV Act (Precedent for mandatory head coverings in public transit)",
    category: "Safety Gear"
  },
  {
    id: "sec-194e",
    section: "Section 194E",
    actName: "Motor Vehicles Act, 1988",
    title: "Failure to Draw Side for Emergency Vehicles",
    description: "Failing to draw to the side of the road and allow free passage to fire service vehicles, ambulances, or emergency patrol services.",
    fineAmount: 10000,
    fineAmountRepeat: 10000,
    riskLevel: "High",
    safetyAdvice: "On hearing fire sirens or emergency ambulance lights, shift as far left as possible and halt to guarantee unhindered transit.",
    constitutionReference: "Article 21 (State responsibility to safeguard citizens' medical emergencies)",
    category: "General"
  }
];

const INITIAL_EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: "emg-1",
    name: "Delhi Central Traffic Command Control",
    type: "police",
    phone: "103; 011-25844444",
    distanceKm: 1.4,
    latitude: 28.6139,
    longitude: 77.2090,
    address: "Police Head Quarter, ITO, Delhi - 110002"
  },
  {
    id: "emg-2",
    name: "Golden Hour National Highway Ambulance",
    type: "ambulance",
    phone: "1033; 108",
    distanceKm: 2.8,
    latitude: 28.5355,
    longitude: 77.3910,
    address: "NHAI Highway Corridor Health Hub, Delhi-Noida Expressway"
  },
  {
    id: "emg-3",
    name: "AIIMS Apex Trauma Center Medical Services",
    type: "trauma_center",
    phone: "011-26593677",
    distanceKm: 4.5,
    latitude: 28.5672,
    longitude: 77.2100,
    address: "Safdarjung Enclave, Ring Road, New Delhi, Delhi 110029"
  },
  {
    id: "emg-4",
    name: "Mumbai Eastern Freeway Patrol Core",
    type: "highway_patrol",
    phone: "100; 103",
    distanceKm: 6.2,
    latitude: 19.0760,
    longitude: 72.8777,
    address: "Wadala Freeway Terminal Node, Mumbai"
  }
];

const INITIAL_ALERTS: AlertNotification[] = [
  {
    id: "al-1",
    type: "critical",
    title: "Major Congestion: Delhi-Gurugram Border",
    message: "Severe delay alerts on NH-48 due to security checks and vehicle breakdowns. Commuters advised to redirect through Dwarka Expressway.",
    timestamp: new Date().toISOString(),
    location: "NH-48 Border Control Node"
  },
  {
    id: "al-2",
    type: "warning",
    title: "Monsoon Safety Advisory: Chennai Senthil Sector",
    message: "Heavy rainfall causing traffic waterlogging in low tunnels. Reduce speeds to under 40 km/h to avoid hydroplaning.",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    location: "Senthil Flyover, Chennai"
  },
  {
    id: "al-3",
    type: "info",
    title: "Zero Tolerance Week Launched nationally",
    message: "Ministry of Road Transport conducts smart speed checks and helmet compliance audit. High-definition camera alerts are active.",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    location: "All City Sectors"
  }
];

const INITIAL_CHALLANS: Challan[] = [
  {
    id: "ch-101",
    challanNumber: "DL-2026-T-849204",
    vehicleNumber: "DL-3C-CA-4952",
    vehicleModel: "Hyundai i20 (Slate Black)",
    ownerName: "Sumit Sharma",
    violationDate: "2026-05-20",
    violationTime: "14:32:00",
    location: "Connaught Place Radial-4, New Delhi",
    status: "Pending",
    fineAmount: 5000,
    violationType: "Dangerous Driving / Red Light Jumping",
    lawSection: "Section 184",
    ruleDescription: "Driver photographed jumping red signaling apparatus while operating cellular voice device concurrently.",
    authenticityScore: 98,
    isGenuine: true,
    issueAuthority: "Delhi Smart Traffic Management Command Center"
  },
  {
    id: "ch-102",
    challanNumber: "MH-2026-T-304918",
    vehicleNumber: "MH-12-PQ-9032",
    vehicleModel: "Royal Enfield Classic 350",
    ownerName: "Amitabh Patel",
    violationDate: "2026-05-18",
    violationTime: "09:12:00",
    location: "Senapati Bapat Marg, Lower Parel, Mumbai",
    status: "Paid",
    fineAmount: 1000,
    violationType: "Riding without ISI-Approved Safety Helmet",
    lawSection: "Section 194D",
    ruleDescription: "Rider detected on thermal cameras without securely fastened protective head covering.",
    authenticityScore: 100,
    isGenuine: true,
    issueAuthority: "Mumbai Public Safety Integrated Control"
  },
  {
    id: "ch-103",
    challanNumber: "KA-2026-P-199402",
    vehicleNumber: "KA-03-MR-5820",
    vehicleModel: "Maruti Suzuki Swift",
    ownerName: "Priyanka Naik",
    violationDate: "2026-05-15",
    violationTime: "19:40:00",
    location: "Silk Board Cross Outer Ring, Bengaluru",
    status: "Disputed",
    fineAmount: 2000,
    violationType: "LMV Speed Limit Exceeded (104 km/h in 80 km/h zone)",
    lawSection: "Section 183",
    ruleDescription: "Radar radar gun logged speed violation on elevated highway segment.",
    authenticityScore: 95,
    isGenuine: true,
    issueAuthority: "Bengaluru City Smart Policing Unit"
  }
];

export interface UserDbRecord extends User {
  passwordHash: string;
}

export interface ResetTokenRecord {
  email: string;
  token: string;
  expires: number;
}

const INITIAL_USER: User = {
  id: "usr-active",
  name: "Rajesh Kumar",
  email: "rajesh.kumar@safeindia.org",
  licenseNumber: "DL-142010482901",
  vehicleNumber: "DL-3C-CA-4952",
  safetyScore: 82,
  complianceRating: 88,
  riskPercentage: 18,
  role: "citizen",
  createdAt: "2026-01-10T11:00:00Z",
  lastLogin: "2026-05-27T06:00:00.000Z",
  status: "active"
};

const SEED_USERS: UserDbRecord[] = [
  {
    ...INITIAL_USER,
    passwordHash: bcrypt.hashSync("citizen123", 10)
  },
  {
    id: "usr-officer",
    name: "Inspector Vikram Singh",
    email: "officer.singh@safeindia.org",
    licenseNumber: "DL-142020412239",
    vehicleNumber: "DL-3C-GOV-1002",
    safetyScore: 98,
    complianceRating: 99,
    riskPercentage: 2,
    role: "officer",
    createdAt: "2019-09-12T08:00:00Z",
    lastLogin: "2026-05-27T07:15:00.000Z",
    status: "active",
    passwordHash: bcrypt.hashSync("officer123", 10)
  },
  {
    id: "usr-admin",
    name: "Director Anjali Desai",
    email: "admin.desai@safeindia.org",
    licenseNumber: "DL-142007421102",
    vehicleNumber: "DL-3C-GOV-0001",
    safetyScore: 100,
    complianceRating: 100,
    riskPercentage: 0,
    role: "admin",
    createdAt: "2018-04-15T09:30:00Z",
    lastLogin: "2026-05-27T07:20:00.000Z",
    status: "active",
    passwordHash: bcrypt.hashSync("admin123", 10)
  },
  {
    id: "usr-roadsafety",
    name: "National Road Safety Admin",
    email: "roadsafety@safeindia.org",
    licenseNumber: "DL-999999999123",
    vehicleNumber: "DL-3C-GOV-9999",
    safetyScore: 100,
    complianceRating: 100,
    riskPercentage: 0,
    role: "admin",
    createdAt: "2020-03-20T10:00:00Z",
    lastLogin: "2026-05-27T07:30:00.000Z",
    status: "active",
    passwordHash: bcrypt.hashSync("admin", 10)
  },
  {
    id: "usr-super",
    name: "Supreme Administrator Satish Sharma",
    email: "super.sharma@safeindia.org",
    licenseNumber: "DL-000000000001",
    vehicleNumber: "DL-1C-SYS-0001",
    safetyScore: 100,
    complianceRating: 100,
    riskPercentage: 0,
    role: "superadmin",
    createdAt: "2016-01-01T00:00:00Z",
    lastLogin: "2026-05-27T07:22:00.000Z",
    status: "active",
    passwordHash: bcrypt.hashSync("super123", 10)
  }
];

export interface DatabaseState {
  user: User;
  lawSections: LawSection[];
  challans: Challan[];
  emergencies: EmergencyContact[];
  alerts: AlertNotification[];
  chatHistory: ChatMessage[];
  stats: PlatformStats;
  users: UserDbRecord[];
  resetTokens: ResetTokenRecord[];
}

const DEFAULT_STATE: DatabaseState = {
  user: INITIAL_USER,
  lawSections: INITIAL_LAW_SECTIONS,
  challans: INITIAL_CHALLANS,
  emergencies: INITIAL_EMERGENCY_CONTACTS,
  alerts: INITIAL_ALERTS,
  chatHistory: [],
  stats: {
    activeUsersCount: 148202,
    totalChallansIssued: 84920,
    totalFinesCollected: 42194000,
    overallComplianceRate: 84,
    aiQueriesResolved: 3824
  },
  users: SEED_USERS,
  resetTokens: []
};

export class DbStore {
  private state: DatabaseState;

  constructor() {
    this.state = DEFAULT_STATE;
    this.load();
  }

  private load(): void {
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        let modified = false;
        if (!parsed.users) {
          parsed.users = SEED_USERS;
          modified = true;
        } else {
          // Ensure all pre-seeded accounts exist even if the database already exists on disk
          for (const seed of SEED_USERS) {
            const exists = parsed.users.some((u: any) => u.email.toLowerCase() === seed.email.toLowerCase());
            if (!exists) {
              parsed.users.push(seed);
              modified = true;
            }
          }
        }
        if (!parsed.resetTokens) {
          parsed.resetTokens = [];
          modified = true;
        }
        this.state = parsed;
        if (modified) {
          this.save();
        }
      } else {
        this.save();
      }
    } catch (e) {
      console.error("Failed to load DB. Initializing with defaults.", e);
      this.state = DEFAULT_STATE;
    }
  }

  public save(): void {
    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (e) {
      console.error("Failed to write to DB.", e);
    }
  }

  // User Actions
  public getUser(): User {
    return this.state.user;
  }

  public updateUser(user: Partial<User>): User {
    this.state.user = { ...this.state.user, ...user };
    this.save();
    return this.state.user;
  }

  // Rules Actions
  public getLawSections(): LawSection[] {
    return this.state.lawSections;
  }

  public addLawSection(law: LawSection): LawSection {
    this.state.lawSections.unshift(law);
    this.state.stats.totalChallansIssued += 1; // dummy triggers
    this.save();
    return law;
  }

  public updateLawSection(law: LawSection): LawSection {
    this.state.lawSections = this.state.lawSections.map(l => l.id === law.id ? law : l);
    this.save();
    return law;
  }

  // Challan Actions
  public getChallans(): Challan[] {
    return this.state.challans;
  }

  public saveChallan(challan: Challan): Challan {
    // Check if it exists
    const idx = this.state.challans.findIndex(c => c.id === challan.id);
    if (idx >= 0) {
      this.state.challans[idx] = challan;
    } else {
      this.state.challans.unshift(challan);
    }
    this.save();
    return challan;
  }

  public updateChallanStatus(id: string, status: Challan['status']): Challan | null {
    const idx = this.state.challans.findIndex(c => c.id === id);
    if (idx >= 0) {
      this.state.challans[idx].status = status;
      // If paid, add to stats
      if (status === 'Paid') {
        this.state.stats.totalFinesCollected += this.state.challans[idx].fineAmount;
        // recalculate safety status
        this.state.user.safetyScore = Math.min(100, this.state.user.safetyScore + 5);
        this.state.user.riskPercentage = Math.max(0, this.state.user.riskPercentage - 5);
      } else if (status === 'Disputed') {
        this.state.user.safetyScore = Math.max(10, this.state.user.safetyScore - 2);
      }
      this.save();
      return this.state.challans[idx];
    }
    return null;
  }

  // Emergencies Actions
  public getEmergencies(): EmergencyContact[] {
    return this.state.emergencies;
  }

  // Alerts Actions
  public getAlerts(): AlertNotification[] {
    return this.state.alerts;
  }

  public addAlert(alert: Omit<AlertNotification, 'id' | 'timestamp'>): AlertNotification {
    const full: AlertNotification = {
      ...alert,
      id: "al-" + Date.now(),
      timestamp: new Date().toISOString()
    };
    this.state.alerts.unshift(full);
    this.save();
    return full;
  }

  // Chatbot Actions
  public getChatHistory(): ChatMessage[] {
    return this.state.chatHistory;
  }

  public addChatMessage(msg: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
    const full: ChatMessage = {
      ...msg,
      id: "msg-" + Date.now(),
      timestamp: new Date().toISOString()
    };
    this.state.chatHistory.push(full);
    this.state.stats.aiQueriesResolved += 1;
    this.save();
    return full;
  }

  public clearChatHistory(): void {
    this.state.chatHistory = [];
    this.save();
  }

  // Platform Stats Actions
  public getStats(): PlatformStats {
    return this.state.stats;
  }

  // User Accounts CRUD
  public getUsersRecord(): UserDbRecord[] {
    return this.state.users || [];
  }

  public findUserByEmail(email: string): UserDbRecord | undefined {
    return (this.state.users || []).find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public addUserRecord(user: UserDbRecord): void {
    if (!this.state.users) this.state.users = [];
    this.state.users.push(user);
    this.save();
  }

  public updateUserRecord(email: string, updates: Partial<UserDbRecord>): UserDbRecord | undefined {
    const user = this.findUserByEmail(email);
    if (user) {
      Object.assign(user, updates);
      this.save();
      if (this.state.user && this.state.user.email.toLowerCase() === email.toLowerCase()) {
        this.state.user = { ...this.state.user, ...user };
        this.save();
      }
      return user;
    }
    return undefined;
  }

  // Password Reset Token Database
  public addResetToken(email: string, token: string, expires: number): void {
    if (!this.state.resetTokens) this.state.resetTokens = [];
    this.state.resetTokens = this.state.resetTokens.filter(rt => rt.email.toLowerCase() !== email.toLowerCase());
    this.state.resetTokens.push({ email, token, expires });
    this.save();
  }

  public findResetToken(token: string): ResetTokenRecord | undefined {
    return (this.state.resetTokens || []).find(rt => rt.token === token);
  }

  public removeResetToken(token: string): void {
    if (this.state.resetTokens) {
      this.state.resetTokens = this.state.resetTokens.filter(rt => rt.token !== token);
      this.save();
    }
  }
}

export const dbStore = new DbStore();
