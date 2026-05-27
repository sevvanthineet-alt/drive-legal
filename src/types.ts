/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  name: string;
  email: string;
  licenseNumber?: string;
  vehicleNumber?: string;
  safetyScore: number; // 0 - 100
  complianceRating: number; // 0 - 100
  riskPercentage: number; // 0 - 100
  role: 'citizen' | 'officer' | 'admin' | 'superadmin';
  createdAt?: string;
  lastLogin?: string;
  status?: 'active' | 'suspended' | 'locked';
}

export interface LawSection {
  id: string;
  section: string; // e.g., "Section 177", "Section 184"
  actName: string; // e.g., "Motor Vehicles Act, 1988"
  title: string; // e.g., "General Provision for Punishment of Offences"
  description: string;
  fineAmount: number; // in Rupees
  fineAmountRepeat?: number; // Fine for repeat offences
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  safetyAdvice: string;
  constitutionReference?: string;
  category: 'Speed' | 'License/Registration' | 'Safety Gear' | 'Intoxication' | 'Permits' | 'General';
}

export interface Violation {
  id: string;
  vehicleNumber: string;
  violationType: string;
  fineAmount: number;
  status: 'Pending' | 'Paid' | 'Disputed';
  date: string;
  location: string;
  lawSectionId: string;
}

export interface Challan {
  id: string;
  challanNumber: string;
  vehicleNumber: string;
  vehicleModel?: string;
  ownerName: string;
  violationDate: string;
  violationTime: string;
  location: string;
  status: 'Pending' | 'Paid' | 'Disputed' | 'Invalidated';
  fineAmount: number;
  violationType: string;
  lawSection: string; // Section identifier, e.g. "Section 184"
  ruleDescription: string;
  authenticityScore: number; // 0 to 100 safety score
  isGenuine: boolean;
  issueAuthority: string;
  notes?: string;
}

export interface AlertNotification {
  id: string;
  type: 'emergency' | 'warning' | 'info' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  location?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  type: 'police' | 'ambulance' | 'highway_patrol' | 'trauma_center';
  phone: string;
  distanceKm?: number;
  latitude: number;
  longitude: number;
  address: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  // Metadata fields for structured legal responses
    legalDetails?: {
      violationName?: string;
      fineAmount?: number;
      lawName?: string;
      sectionNumber?: string;
      constitutionReference?: string;
      safetyAdvice?: string;
      riskLevel?: string;
      repeatOffense?: string;
      imprisonmentDetails?: string;
      licenseSuspension?: string;
      safetyRecommendation?: string;
      safetyScoreImpact?: number;
      escalationLogic?: string;
      legalSuggestions?: string[];
      trafficCourt?: string;
      challanIntegration?: string;
      canContest?: string;
      documentsRequired?: string[];
      verificationRecommended?: boolean;
    };
}

export interface PlatformStats {
  activeUsersCount: number;
  totalChallansIssued: number;
  totalFinesCollected: number; // in Rupees
  overallComplianceRate: number; // Percentage
  aiQueriesResolved: number;
}
