import { Incident, FleetCrew, WardBudget, NotificationItem, DailyBrief } from '../types';

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'GVMC-2026-8901',
    title: 'Severe Deep Pothole near RK Beach Road Curve',
    description: 'Deep structural asphalt depression causing vehicle swerving near Submarine Museum on Beach Road.',
    locationName: 'Beach Road, Ward 15',
    ward: 'Ward 15 - Beach Road',
    coordinates: [17.7142, 83.3238],
    severity: 'CRITICAL',
    priorityScore: 94,
    confidence: 96.5,
    surfaceAreaM2: 3.4,
    estimatedDepthCm: 12.5,
    estimatedCostINR: 42500,
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    detectedImageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    boundingBox: { x: 20, y: 30, width: 55, height: 45 },
    status: 'REPORTED',
    reportedAt: '2026-07-31T08:15:00Z',
    explainability: {
      roadType: 'High-Density Arterial Coastal Highway',
      trafficDensity: 'HIGH',
      hazardRisk: 'Critical - Immediate risk of two-wheeler skid and salt-spray erosion',
      depthFactor: 'Depth >10cm exceeds structural safety thresholds',
      weatherRisk: 'Coastal moisture accelerating sub-base degradation'
    },
    beforeAfterImages: {
      before: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'
    }
  },
  {
    id: 'GVMC-2026-8902',
    title: 'Multi-Crack Mesh & Subsidence at Siripuram Signal',
    description: 'Extensive alligator cracking with 8cm depression at Siripuram Circle traffic bottleneck.',
    locationName: 'Siripuram Junction, Ward 18',
    ward: 'Ward 18 - Siripuram',
    coordinates: [17.7245, 83.3156],
    severity: 'HIGH',
    priorityScore: 88,
    confidence: 93.8,
    surfaceAreaM2: 5.1,
    estimatedDepthCm: 8.2,
    estimatedCostINR: 58000,
    imageUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
    detectedImageUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
    boundingBox: { x: 15, y: 25, width: 65, height: 50 },
    status: 'DISPATCHED',
    reportedAt: '2026-07-31T07:30:00Z',
    assignedCrewId: 'CREW-ALPHA',
    assignedCrewName: 'GVMC Rapid Repair Squad Alpha',
    etaMinutes: 14,
    explainability: {
      roadType: 'Commercial Junction Arterial',
      trafficDensity: 'HIGH',
      hazardRisk: 'High congestion impact; causes traffic backlog during peak hours',
      depthFactor: 'Alligator cracking indicating base layer saturation',
      weatherRisk: 'Moderate rainfall forecast in next 12 hrs'
    }
  },
  {
    id: 'GVMC-2026-8903',
    title: 'Asphalt Edge Collapse on MVP Colony Sector 4',
    description: 'Stormwater drain overflow caused edge crumble along Sector 4 main avenue.',
    locationName: 'MVP Colony Sector 4, Ward 22',
    ward: 'Ward 22 - MVP Colony',
    coordinates: [17.7412, 83.3321],
    severity: 'HIGH',
    priorityScore: 82,
    confidence: 91.2,
    surfaceAreaM2: 2.8,
    estimatedDepthCm: 7.0,
    estimatedCostINR: 31000,
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    status: 'IN_REPAIR',
    reportedAt: '2026-07-30T16:40:00Z',
    assignedCrewId: 'CREW-BETA',
    assignedCrewName: 'GVMC Heavy Asphalt Unit Beta',
    etaMinutes: 5,
    explainability: {
      roadType: 'Residential Sector Main Collector Road',
      trafficDensity: 'MEDIUM',
      hazardRisk: 'Risk to parked vehicles and pedestrians',
      depthFactor: 'Sub-base washout near stormwater channel',
      weatherRisk: 'Low'
    }
  },
  {
    id: 'GVMC-2026-8904',
    title: 'Sunken Manhole Cover at Gajuwaka Industrial Highway',
    description: 'Heavy truck traffic pushed manhole rim 14cm below road surface grade.',
    locationName: 'Gajuwaka Main Road, Ward 58',
    ward: 'Ward 58 - Gajuwaka',
    coordinates: [17.6891, 83.2125],
    severity: 'CRITICAL',
    priorityScore: 96,
    confidence: 98.1,
    surfaceAreaM2: 1.8,
    estimatedDepthCm: 14.0,
    estimatedCostINR: 38000,
    imageUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80',
    status: 'REPORTED',
    reportedAt: '2026-07-31T09:05:00Z',
    explainability: {
      roadType: 'Industrial Heavy Freight Corridor',
      trafficDensity: 'HIGH',
      hazardRisk: 'Extremely high risk for heavy multi-axle trucks and logistics trailers',
      depthFactor: 'Critical vertical offset (14cm)',
      weatherRisk: 'High dynamic axle load damage'
    }
  },
  {
    id: 'GVMC-2026-8905',
    title: 'Pothole Cluster near NAD Flyover Ramp',
    description: 'Cluster of 3 potholes developing near flyover exit ramp toward Airport Road.',
    locationName: 'NAD Junction Ramp, Ward 34',
    ward: 'Ward 34 - NAD Junction',
    coordinates: [17.7385, 83.2452],
    severity: 'MEDIUM',
    priorityScore: 68,
    confidence: 89.4,
    surfaceAreaM2: 2.2,
    estimatedDepthCm: 5.5,
    estimatedCostINR: 24000,
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    status: 'RESOLVED',
    reportedAt: '2026-07-29T11:20:00Z',
    resolvedAt: '2026-07-30T14:30:00Z',
    assignedCrewId: 'CREW-GAMMA',
    assignedCrewName: 'GVMC Mobile Patching Fleet Gamma',
    explainability: {
      roadType: 'Flyover Exit Collector',
      trafficDensity: 'HIGH',
      hazardRisk: 'Medium risk at moderate speeds',
      depthFactor: 'Surface layer delamination only',
      weatherRisk: 'Stable'
    },
    beforeAfterImages: {
      before: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
      after: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80'
    }
  },
  {
    id: 'GVMC-2026-8906',
    title: 'Surface Stripping on Madhurawada IT Hill Road',
    description: 'Top coat stripping covering 8 sq meters after heavy monsoon runoff.',
    locationName: 'Madhurawada IT SEZ Road, Ward 04',
    ward: 'Ward 04 - Madhurawada',
    coordinates: [17.8012, 83.3554],
    severity: 'MEDIUM',
    priorityScore: 61,
    confidence: 87.9,
    surfaceAreaM2: 8.4,
    estimatedDepthCm: 4.1,
    estimatedCostINR: 62000,
    imageUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
    status: 'REPORTED',
    reportedAt: '2026-07-31T06:10:00Z',
    explainability: {
      roadType: 'IT Park Access Gradient Road',
      trafficDensity: 'MEDIUM',
      hazardRisk: 'Loss of traction during downhill rain',
      depthFactor: 'Shallow binder wear',
      weatherRisk: 'Water flow channelization'
    }
  }
];

export const INITIAL_FLEET: FleetCrew[] = [
  {
    id: 'CREW-ALPHA',
    name: 'GVMC Rapid Repair Squad Alpha',
    leader: 'Eng. K. Rajesh Kumar',
    contact: '+91 98480 12345',
    status: 'EN_ROUTE',
    currentLocation: 'En Route to Siripuram Junction',
    coordinates: [17.7210, 83.3120],
    vehicleType: 'Jetpatcher Hot-Mix Truck #AP-31-P-1002',
    equipment: ['Infrared Asphalt Heater', 'Pneumatic Compactor', 'Laser Profiler', 'Safety Cones & LED Matrix'],
    activeIncidentId: 'GVMC-2026-8902',
    assignedWard: 'Ward 18 - Siripuram',
    etaMinutes: 14,
    jobsCompletedToday: 3
  },
  {
    id: 'CREW-BETA',
    name: 'GVMC Heavy Asphalt Unit Beta',
    leader: 'Eng. M. Suresh Varma',
    contact: '+91 98480 67890',
    status: 'ON_SITE',
    currentLocation: 'MVP Colony Sector 4',
    coordinates: [17.7410, 83.3318],
    vehicleType: 'Caterpillar Asphalt Paver & Roller #AP-31-P-1005',
    equipment: ['Asphalt Cutter', 'Vibratory Plate Roller', 'Tack Coat Sprayer', 'GPS Telematics Unit'],
    activeIncidentId: 'GVMC-2026-8903',
    assignedWard: 'Ward 22 - MVP Colony',
    etaMinutes: 5,
    jobsCompletedToday: 2
  },
  {
    id: 'CREW-GAMMA',
    name: 'GVMC Mobile Patching Fleet Gamma',
    leader: 'Eng. P. Ananda Rao',
    contact: '+91 98480 54321',
    status: 'AVAILABLE',
    currentLocation: 'Dwaraka Nagar Depot',
    coordinates: [17.7280, 83.3010],
    vehicleType: 'Quick-Response Emulsion Van #AP-31-P-1012',
    equipment: ['Cold-Mix Asphalt Binder', 'Hand Roller', 'Digital Depth Gauge', 'Night Work Spotlights'],
    assignedWard: 'Ward 30 - Dwaraka Nagar',
    jobsCompletedToday: 4
  },
  {
    id: 'CREW-DELTA',
    name: 'GVMC Industrial Sector Unit Delta',
    leader: 'Eng. V. Ramana Murthy',
    contact: '+91 98480 99887',
    status: 'AVAILABLE',
    currentLocation: 'Gajuwaka Zonal Office',
    coordinates: [17.6850, 83.2100],
    vehicleType: 'Heavy Concrete & Rim Leveling Truck #AP-31-P-1020',
    equipment: ['Hydraulic Concrete Breaker', 'Manhole Frame Lifter', 'High-Early Strength Concrete'],
    assignedWard: 'Ward 58 - Gajuwaka',
    jobsCompletedToday: 1
  }
];

export const INITIAL_BUDGETS: WardBudget[] = [
  {
    wardName: 'Ward 15 - Beach Road',
    wardCode: 'GVMC-W15',
    allocatedINR: 4500000,
    spentINR: 2850000,
    pendingEstimatesINR: 42500,
    activePotholesCount: 1,
    criticalCount: 1,
    officerInCharge: 'Executive Eng. B. Srinivas'
  },
  {
    wardName: 'Ward 18 - Siripuram',
    wardCode: 'GVMC-W18',
    allocatedINR: 3800000,
    spentINR: 1950000,
    pendingEstimatesINR: 58000,
    activePotholesCount: 1,
    criticalCount: 0,
    officerInCharge: 'Deputy Eng. Ch. Lakshmi'
  },
  {
    wardName: 'Ward 22 - MVP Colony',
    wardCode: 'GVMC-W22',
    allocatedINR: 4200000,
    spentINR: 3100000,
    pendingEstimatesINR: 31000,
    activePotholesCount: 1,
    criticalCount: 0,
    officerInCharge: 'Assistant Eng. T. Appa Rao'
  },
  {
    wardName: 'Ward 58 - Gajuwaka',
    wardCode: 'GVMC-W58',
    allocatedINR: 6500000,
    spentINR: 4800000,
    pendingEstimatesINR: 38000,
    activePotholesCount: 1,
    criticalCount: 1,
    officerInCharge: 'Zonal Eng. S. Satyanarayana'
  },
  {
    wardName: 'Ward 34 - NAD Junction',
    wardCode: 'GVMC-W34',
    allocatedINR: 5000000,
    spentINR: 3400000,
    pendingEstimatesINR: 0,
    activePotholesCount: 0,
    criticalCount: 0,
    officerInCharge: 'Assistant Eng. K. Prasad'
  },
  {
    wardName: 'Ward 04 - Madhurawada',
    wardCode: 'GVMC-W04',
    allocatedINR: 5500000,
    spentINR: 2200000,
    pendingEstimatesINR: 62000,
    activePotholesCount: 1,
    criticalCount: 0,
    officerInCharge: 'Deputy Eng. G. Dhanunjay'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'NOTIF-101',
    title: 'CRITICAL ALERT: Beach Road Defect',
    message: 'High priority score 94/100 detected at Submarine Museum curve. Immediate hazard to two-wheelers.',
    time: '08:15 AM',
    type: 'CRITICAL',
    read: false
  },
  {
    id: 'NOTIF-102',
    title: 'Crew Alpha Dispatched',
    message: 'GVMC Rapid Repair Squad Alpha dispatched to Siripuram Junction (ETA 14 mins).',
    time: '07:32 AM',
    type: 'DISPATCH',
    read: false
  },
  {
    id: 'NOTIF-103',
    title: 'Repair Completed - NAD Ramp',
    message: 'GVMC-2026-8905 at NAD Junction marked RESOLVED by Crew Gamma.',
    time: 'Yesterday',
    type: 'SYSTEM',
    read: true
  }
];

export const DEFAULT_DAILY_BRIEF: DailyBrief = {
  date: '2026-07-31',
  summary: 'GVMC Road Command Center reports 6 active incidents across 6 key wards. Critical focus required on Beach Road (Ward 15) and Gajuwaka Industrial Road (Ward 58) due to severe depth (>12cm) and heavy commuter load following morning coastal showers. Rapid Squad Alpha is currently en route to Siripuram.',
  highRiskWards: ['Ward 15 - Beach Road', 'Ward 58 - Gajuwaka'],
  recommendedActions: [
    'Deploy Crew Delta immediately to Gajuwaka Industrial Highway sunken manhole.',
    'Pre-position Cold Mix stock at Dwaraka Nagar depot for quick evening response.',
    'Issue automated driver hazard alert for Beach Road Submarine Museum curve.'
  ],
  totalEstimatedSpendToday: 231500,
  aiConfidenceAvg: 92.8
};
