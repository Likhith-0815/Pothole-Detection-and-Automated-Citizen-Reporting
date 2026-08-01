export type UserRole = 'admin' | 'engineer' | 'citizen' | 'guest';

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface Incident {
  id: string;
  title: string;
  description: string;
  locationName: string;
  ward: string;
  coordinates: [number, number]; // [lat, lng]
  severity: SeverityLevel;
  priorityScore: number; // 0-100
  confidence: number; // percentage
  surfaceAreaM2: number;
  estimatedDepthCm: number;
  estimatedCostINR: number;
  imageUrl: string;
  detectedImageUrl?: string;
  boundingBox?: { x: number; y: number; width: number; height: number };
  status: 'REPORTED' | 'AI_ANALYZED' | 'DISPATCHED' | 'IN_REPAIR' | 'RESOLVED';
  reportedAt: string;
  resolvedAt?: string;
  reporterUid?: string;
  reporterPhone?: string;
  reporterName?: string;
  assignedCrewId?: string;
  assignedCrewName?: string;
  etaMinutes?: number;
  explainability: {
    roadType: string;
    trafficDensity: 'HIGH' | 'MEDIUM' | 'LOW';
    hazardRisk: string;
    depthFactor: string;
    weatherRisk: string;
  };
  beforeAfterImages?: {
    before: string;
    after?: string;
  };
}

export interface FleetCrew {
  id: string;
  name: string;
  leader: string;
  contact: string;
  status: 'AVAILABLE' | 'EN_ROUTE' | 'ON_SITE' | 'MAINTENANCE';
  currentLocation: string;
  coordinates: [number, number];
  vehicleType: string;
  equipment: string[];
  activeIncidentId?: string;
  assignedWard: string;
  etaMinutes?: number;
  jobsCompletedToday: number;
}

export interface WardBudget {
  wardName: string;
  wardCode: string;
  allocatedINR: number;
  spentINR: number;
  pendingEstimatesINR: number;
  activePotholesCount: number;
  criticalCount: number;
  officerInCharge: string;
}

export interface AIDetectionResult {
  incidentId: string;
  severity: SeverityLevel;
  priorityScore: number;
  confidence: number;
  surfaceAreaM2: number;
  estimatedDepthCm: number;
  estimatedCostINR: number;
  recommendedCrewId: string;
  recommendedCrewName: string;
  explainability: {
    roadType: string;
    trafficDensity: 'HIGH' | 'MEDIUM' | 'LOW';
    hazardRisk: string;
    depthFactor: string;
    weatherRisk: string;
  };
  detectedBoundingBox: { x: number; y: number; width: number; height: number };
  aiBriefNote: string;
}

export interface DailyBrief {
  date: string;
  summary: string;
  highRiskWards: string[];
  recommendedActions: string[];
  totalEstimatedSpendToday: number;
  aiConfidenceAvg: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'CRITICAL' | 'DISPATCH' | 'SYSTEM' | 'INFO';
  read: boolean;
}
