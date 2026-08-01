import React, { useState, useRef } from 'react';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { 
  Upload, 
  Camera, 
  Sparkles, 
  Cpu, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  DollarSign, 
  Truck, 
  Clock, 
  Info,
  MapPin,
  RefreshCw,
  FileText,
  ShieldCheck,
  Zap,
  ArrowRight,
  Smartphone,
  Activity,
  Gauge,
  Check,
  Radio
} from 'lucide-react';
import { Incident, AIDetectionResult, FleetCrew, UserRole } from '../types';

interface UploadComplaintProps {
  onIncidentCreated: (incident: Incident) => void;
  crews: FleetCrew[];
  onOpenDispatch: (incidentId: string) => void;
  userRole?: UserRole;
}

const PRESET_SAMPLES = [
  {
    id: 'sample-1',
    title: 'RK Beach Road Curve (Deep Pothole)',
    location: 'Beach Road, Ward 15',
    url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    ward: 'Ward 15 - Beach Road',
    coords: [17.7142, 83.3238] as [number, number]
  },
  {
    id: 'sample-2',
    title: 'Siripuram Circle (Alligator Cracking)',
    location: 'Siripuram Junction, Ward 18',
    url: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
    ward: 'Ward 18 - Siripuram',
    coords: [17.7245, 83.3156] as [number, number]
  },
  {
    id: 'sample-3',
    title: 'Gajuwaka Highway (Sunken Manhole)',
    location: 'Gajuwaka Main Road, Ward 58',
    url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80',
    ward: 'Ward 58 - Gajuwaka',
    coords: [17.6891, 83.2125] as [number, number]
  }
];

export const UploadComplaint: React.FC<UploadComplaintProps> = ({
  onIncidentCreated,
  crews,
  onOpenDispatch,
  userRole = 'guest'
}) => {
  const isCitizen = userRole === 'citizen';
  const [reportMode, setReportMode] = useState<'photo' | 'accelerometer'>('photo');

  const [reporterProfile, setReporterProfile] = useState<{ uid: string; name: string; phone: string } | null>(null);

  React.useEffect(() => {
    const loadProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userSnap = await getDoc(doc(db, 'users', user.uid));
          if (userSnap.exists()) {
            const data = userSnap.data();
            setReporterProfile({
              uid: user.uid,
              name: data.name || 'Vizag Resident',
              phone: data.mobileNumber || '+91 94406 23456'
            });
          } else {
            setReporterProfile({
              uid: user.uid,
              name: 'Vizag Resident',
              phone: '+91 94406 23456'
            });
          }
        } catch (err) {
          console.warn("Failed to load reporter profile inside UploadComplaint:", err);
          setReporterProfile({
            uid: user.uid,
            name: 'Vizag Resident',
            phone: '+91 94406 23456'
          });
        }
      }
    };
    loadProfile();
  }, []);

  // Enforce photo mode for citizen role
  React.useEffect(() => {
    if (isCitizen && reportMode !== 'photo') {
      setReportMode('photo');
    }
  }, [isCitizen, reportMode]);

  // Photo Mode State
  const [selectedImage, setSelectedImage] = useState<string | null>(PRESET_SAMPLES[0].url);
  const [locationName, setLocationName] = useState(PRESET_SAMPLES[0].location);
  const [wardName, setWardName] = useState(PRESET_SAMPLES[0].ward);
  const [coordinates, setCoordinates] = useState<[number, number]>(PRESET_SAMPLES[0].coords);
  const [complaintDescription, setComplaintDescription] = useState('Deep road pothole causing severe traffic hazard and vehicle suspension damage.');

  // Live GPS Geolocation State
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'requesting' | 'acquired' | 'error'>('idle');
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsTimestamp, setGpsTimestamp] = useState<string | null>(null);
  const [gpsErrorMsg, setGpsErrorMsg] = useState<string>('');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);
  const [analyzedIncident, setAnalyzedIncident] = useState<Incident | null>(null);

  // Smartphone Accelerometer Mode State
  const [isSensorsStreaming, setIsSensorsStreaming] = useState(false);
  const [sensorGForce, setSensorGForce] = useState<{ x: number; y: number; z: number }>({ x: 0.12, y: 0.08, z: 1.02 });
  const [speedKmh, setSpeedKmh] = useState(42);
  const [detectedShock, setDetectedShock] = useState<boolean>(false);
  const [sensorLogs, setSensorLogs] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getClosestVizagWard = (lat: number, lng: number): string => {
    if (lat > 17.75) return 'Ward 04 - Madhurawada';
    if (lat > 17.72 && lng > 83.31) return 'Ward 15 - Beach Road';
    if (lat > 17.71 && lng < 83.30) return 'Ward 18 - Siripuram';
    if (lat < 17.70 && lng < 83.25) return 'Ward 58 - Gajuwaka';
    return 'Ward 34 - NAD Junction';
  };

  const requestLiveLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus('error');
      setGpsErrorMsg('Geolocation API is not supported by your browser.');
      return;
    }

    setGpsStatus('requesting');
    setGpsErrorMsg('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(5));
        const lng = Number(position.coords.longitude.toFixed(5));
        const acc = Math.round(position.coords.accuracy || 5);

        setCoordinates([lat, lng]);
        setGpsAccuracy(acc);
        setGpsTimestamp(new Date().toLocaleTimeString());
        setGpsStatus('acquired');

        const ward = getClosestVizagWard(lat, lng);
        setWardName(ward);
        setLocationName(`Live Citizen GPS Pinpoint (${lat}° N, ${lng}° E)`);
      },
      (err) => {
        console.warn("Live Geolocation acquisition failed/denied:", err);
        setGpsStatus('error');
        setGpsErrorMsg(
          err.code === 1
            ? 'Location permission was denied. Defaulting to estimated Visakhapatnam GPS coordinates.'
            : 'Unable to pinpoint high-precision GPS. Please try re-syncing.'
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const PIPELINE_STEPS = [
    '1. Uploading Image & Metadata',
    '2. Noise Reduction & Contrast Balance',
    '3. Edge Detection & Texture Filtering',
    '4. Feature Extraction & Depth Estimation',
    '5. Object Bounding Box Generation',
    '6. Priority & Risk Score Algorithm',
    '7. OpenStreetMap GIS Geotagging',
    '8. Fleet Dispatch Matching'
  ];

  const compressImage = (base64Str: string, maxDimension = 1024): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        } else {
          resolve(base64Str);
        }
      };
      img.onerror = () => {
        resolve(base64Str);
      };
      img.src = base64Str;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        const rawBase64 = reader.result as string;
        try {
          const compressed = await compressImage(rawBase64, 800);
          setSelectedImage(compressed);
        } catch (compressErr) {
          console.warn("Client-side compression failed, using original:", compressErr);
          setSelectedImage(rawBase64);
        }
        setLocationName('Citizen Pothole Upload, Visakhapatnam');
        setAnalyzedIncident(null);
        // Automatically request live GPS location when photo is selected
        requestLiveLocation();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (sample: typeof PRESET_SAMPLES[0]) => {
    setSelectedImage(sample.url);
    setLocationName(sample.location);
    setWardName(sample.ward);
    setCoordinates(sample.coords);
    setAnalyzedIncident(null);
  };

  const runVisionAI = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setPipelineStep(0);
    setAnalyzedIncident(null);

    // Animate pipeline steps for 2.5 seconds
    for (let i = 0; i < PIPELINE_STEPS.length; i++) {
      setPipelineStep(i);
      await new Promise(r => setTimeout(r, 250));
    }

    try {
      const response = await fetch('/api/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: selectedImage,
          locationName,
          wardName,
          coordinates,
          description: complaintDescription,
          reporterUid: reporterProfile?.uid,
          reporterPhone: reporterProfile?.phone,
          reporterName: reporterProfile?.name
        })
      });

      const data = await response.json();
      if (data.success && data.incident) {
        setAnalyzedIncident(data.incident);
        onIncidentCreated(data.incident);
      }
    } catch (err) {
      console.error("AI Analysis error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Simulate Smartphone Accelerometer Driving Shock Sensor
  const handleSimulateAccelerometerBump = () => {
    setIsSensorsStreaming(true);
    setDetectedShock(false);
    setSensorLogs(prev => [`[${new Date().toLocaleTimeString()}] Vehicle speed 45 km/h on Beach Road...`, ...prev]);

    // Animate normal motion
    setTimeout(() => {
      setSensorGForce({ x: 0.2, y: 0.15, z: 1.05 });
    }, 400);

    // Trigger Shock Spike > 3.2g
    setTimeout(() => {
      setSensorGForce({ x: 1.45, y: 0.88, z: 3.42 });
      setDetectedShock(true);
      setSensorLogs(prev => [
        `[${new Date().toLocaleTimeString()}] 💥 ACCELEROMETER SPIKE DETECTED! Z-axis acceleration = 3.42g (Threshold > 2.8g)`,
        `[${new Date().toLocaleTimeString()}] Auto-logging GPS [17.7142, 83.3238] at Beach Road Ward 15...`,
        ...prev
      ]);

      const newInc: Incident = {
        id: `GVMC-ACCEL-${Date.now().toString().slice(-4)}`,
        title: 'Accelerometer Sensor Spike: Deep Pothole Impact',
        description: 'Automated continuous smartphone sensor detection logged a 3.42g vertical shock spike at 45 km/h.',
        locationName: 'RK Beach Road Curve, Ward 15',
        ward: 'Ward 15 - Beach Road',
        coordinates: [17.7142, 83.3238],
        severity: 'CRITICAL',
        priorityScore: 92,
        confidence: 94.8,
        surfaceAreaM2: 2.9,
        estimatedDepthCm: 11.2,
        estimatedCostINR: 38000,
        imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
        status: 'REPORTED',
        reportedAt: new Date().toISOString(),
        reporterUid: reporterProfile?.uid,
        reporterPhone: reporterProfile?.phone,
        reporterName: reporterProfile?.name,
        explainability: {
          roadType: 'High-Density Arterial Coastal Highway',
          trafficDensity: 'HIGH',
          hazardRisk: 'High vehicle speed shock impact; risk to suspension and tires',
          depthFactor: '3.42g shock indicates >10cm deep road depression',
          weatherRisk: 'Monsoon pavement saturation'
        }
      };

      setAnalyzedIncident(newInc);
      onIncidentCreated(newInc);
      setIsSensorsStreaming(false);
    }, 1200);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-mono font-bold border border-blue-300">
          <Sparkles className="w-3.5 h-3.5 text-blue-700" /> {isCitizen ? 'GVMC Citizen Pothole Reporting Portal' : 'GVMC AI Vision & Continuous Accelerometer Sensor Layer'}
        </div>
        <h1 className="text-3xl font-black text-[#0A2540] uppercase">
          {isCitizen ? 'Citizen Pothole Photo & Live GPS Reporting' : 'Report Road Pothole Defect'}
        </h1>
        <p className="text-xs text-slate-600 max-w-xl mx-auto font-medium">
          {isCitizen 
            ? 'Upload a photo of the road pothole. Your live device location will be captured and recorded into the GVMC database for AI Agent pinpointing.'
            : 'Choose between Multimodal Vision AI Photo Analysis or Live Smartphone Accelerometer Continuous Telemetry Detection.'
          }
        </p>

        {/* MODE SELECTOR TABS (Hidden or restricted for citizens) */}
        {!isCitizen ? (
          <div className="inline-flex items-center bg-slate-200 p-1 rounded-2xl border border-slate-300 gap-1 mt-3">
            <button
              onClick={() => setReportMode('photo')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                reportMode === 'photo' 
                  ? 'bg-[#0A2540] text-white shadow-md' 
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Camera className="w-4 h-4 text-amber-400" />
              <span>Multimodal Vision AI Photo Upload</span>
            </button>

            <button
              onClick={() => setReportMode('accelerometer')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                reportMode === 'accelerometer' 
                  ? 'bg-[#0A2540] text-white shadow-md' 
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Smartphone Accelerometer Telemetry</span>
            </button>
          </div>
        ) : (
          <div className="inline-flex items-center bg-emerald-100 text-emerald-900 px-4 py-1.5 rounded-xl border border-emerald-300 text-xs font-bold gap-2 mt-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Citizen Mode Enabled: Direct Photo Upload & Auto Live GPS Geotagging</span>
          </div>
        )}
      </div>

      {reportMode === 'accelerometer' ? (
        /* ACCELEROMETER TELEMETRY MODE */
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-md space-y-6">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
            <h3 className="font-extrabold text-sm text-emerald-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-700" />
              Automated Smartphone Accelerometer Continuous Detection Stream
            </h3>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Mount your smartphone on a vehicle dashboard. As you drive across Visakhapatnam roads, the built-in accelerometer records 3-axis motion (X, Y, Z). Vertical impact shocks (Z &gt; 2.8g) automatically log potholes with GPS coordinates in real-time.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block mb-1">X-Axis Lateral Force</span>
              <span className="text-2xl font-black text-slate-900">{sensorGForce.x.toFixed(2)} g</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block mb-1">Y-Axis Longitudinal Force</span>
              <span className="text-2xl font-black text-slate-900">{sensorGForce.y.toFixed(2)} g</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block mb-1">Z-Axis Vertical Shock</span>
              <span className={`text-2xl font-black ${sensorGForce.z > 2.8 ? 'text-red-700 animate-pulse' : 'text-emerald-700'}`}>
                {sensorGForce.z.toFixed(2)} g
              </span>
            </div>
          </div>

          {/* SIMULATION TRIGGER BUTTON */}
          <button
            onClick={handleSimulateAccelerometerBump}
            disabled={isSensorsStreaming}
            className={`w-full py-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
              isSensorsStreaming
                ? 'bg-amber-100 text-amber-900 border border-amber-300 cursor-wait'
                : 'bg-[#0A2540] hover:bg-[#1E3A8A] text-white shadow-blue-900/20 hover:scale-[1.01]'
            }`}
          >
            {isSensorsStreaming ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-amber-600" />
                <span>Simulating Driving Shock Impact on Beach Road...</span>
              </>
            ) : (
              <>
                <Radio className="w-5 h-5 text-amber-400" />
                <span>Simulate Vehicle Driving over Pothole (Trigger Accelerometer Shock Spike)</span>
              </>
            )}
          </button>

          {/* SENSOR LOGS STREAM */}
          {sensorLogs.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs space-y-1.5 max-h-48 overflow-y-auto">
              <div className="text-[10px] text-amber-400 font-bold uppercase pb-1 border-b border-slate-800">
                Live Sensor Event Log Stream (Expo React Native / Web Device API)
              </div>
              {sensorLogs.map((log, idx) => (
                <p key={idx} className={log.includes('SPIKE') ? 'text-red-400 font-bold' : 'text-slate-300'}>
                  {log}
                </p>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* PHOTO UPLOAD MODE */
        <div className="space-y-6">
          
          {/* SAMPLE PRESET SELECTION */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-[#0A2540] uppercase tracking-wider block mb-2">
              ⚡ Quick Demo Presets (Select to test instantly)
            </span>
            <div className="grid sm:grid-cols-3 gap-3">
              {PRESET_SAMPLES.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleSelectPreset(sample)}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
                    selectedImage === sample.url
                      ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <img src={sample.url} alt={sample.title} className="w-12 h-12 rounded-lg object-cover" />
                  <div>
                    <p className="font-bold text-xs text-slate-900">{sample.title}</p>
                    <p className="text-[10px] text-slate-500">{sample.location}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* DRAG & DROP UPLOAD AREA */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-md space-y-6">
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative min-h-[220px] rounded-xl border-2 border-dashed border-blue-300 bg-slate-50 hover:bg-slate-100 cursor-pointer flex flex-col items-center justify-center p-6 text-center group transition-colors overflow-hidden"
            >
              <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="hidden" 
              />

              {selectedImage ? (
                <div className="relative w-full h-64 rounded-lg overflow-hidden flex items-center justify-center">
                  <img src={selectedImage} alt="Preview" className="max-h-full max-w-full object-contain rounded-lg" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-2">
                    <Camera className="w-5 h-5" /> Click to change image
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900">Drag & drop road defect photo here</p>
                    <p className="text-xs text-slate-500 mt-1">Supports JPG, PNG, WEBP (Up to 15MB)</p>
                  </div>
                </div>
              )}
            </div>

            {/* LIVE GEOLOCATION CARD FOR CITIZENS */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-blue-950 font-black text-xs uppercase tracking-wide">
                  <MapPin className="w-4 h-4 text-red-600 animate-bounce" />
                  <span>Citizen Live GPS Geolocation Tagging</span>
                  {gpsStatus === 'acquired' && (
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold">
                      🟢 Recorded in DB
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={requestLiveLocation}
                  disabled={gpsStatus === 'requesting'}
                  className="px-3 py-1.5 rounded-lg bg-[#0A2540] hover:bg-[#1E3A8A] text-white text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${gpsStatus === 'requesting' ? 'animate-spin' : ''}`} />
                  <span>{gpsStatus === 'acquired' ? 'Re-Sync Live GPS' : 'Give Live GPS Location'}</span>
                </button>
              </div>

              {gpsStatus === 'requesting' && (
                <div className="p-3 rounded-lg bg-blue-100/80 border border-blue-300 text-blue-900 text-xs font-bold flex items-center gap-2 animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-700" />
                  <span>Requesting device location permissions... Please click 'Allow' in your browser.</span>
                </div>
              )}

              {gpsStatus === 'error' && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" /> {gpsErrorMsg}
                  </p>
                  <p className="text-[11px] text-amber-800">
                    You can still enter the road name or ward manually below. AI Agents will pinpoint the exact location on the GIS Map.
                  </p>
                </div>
              )}

              {gpsStatus === 'acquired' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="text-[9px] text-slate-500 font-mono uppercase block">Latitude</span>
                    <span className="font-mono font-black text-slate-900">{coordinates[0]}° N</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="text-[9px] text-slate-500 font-mono uppercase block">Longitude</span>
                    <span className="font-mono font-black text-slate-900">{coordinates[1]}° E</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="text-[9px] text-slate-500 font-mono uppercase block">GPS Precision</span>
                    <span className="font-mono font-black text-emerald-700">±{gpsAccuracy || 4} meters</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="text-[9px] text-slate-500 font-mono uppercase block">Recorded Time</span>
                    <span className="font-mono font-bold text-slate-800">{gpsTimestamp || 'Just now'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Location Info Fields */}
            <div className="grid md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Road / Landmark Name</label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600"
                  placeholder="e.g. Siripuram Circle, Ward 18"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">GVMC Ward</label>
                <select
                  value={wardName}
                  onChange={(e) => setWardName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 font-bold"
                >
                  <option>Ward 15 - Beach Road</option>
                  <option>Ward 18 - Siripuram</option>
                  <option>Ward 22 - MVP Colony</option>
                  <option>Ward 58 - Gajuwaka</option>
                  <option>Ward 34 - NAD Junction</option>
                  <option>Ward 04 - Madhurawada</option>
                </select>
              </div>
            </div>

            {/* Write Description / About Complaint */}
            <div className="space-y-1 text-xs">
              <label className="block text-slate-700 font-bold">Write About Defect / Complaint Details</label>
              <textarea
                rows={3}
                value={complaintDescription}
                onChange={(e) => setComplaintDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600"
                placeholder="Describe the pothole size, traffic danger, or damage caused..."
              />
            </div>

            {/* REPORT COMPLAINT BUTTON */}
            <button
              onClick={runVisionAI}
              disabled={!selectedImage || isAnalyzing}
              className={`w-full py-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
                isAnalyzing
                  ? 'bg-blue-100 text-blue-900 border border-blue-300 cursor-wait'
                  : 'bg-[#0A2540] hover:bg-[#1E3A8A] text-white shadow-blue-900/20 hover:scale-[1.01]'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
                  Processing & Dispatching to Zonal Engineer ({pipelineStep + 1}/8)...
                </>
              ) : (
                <>
                  <Cpu className="w-5 h-5 text-amber-400" />
                  Report Complaint
                </>
              )}
            </button>

          </div>
        </div>
      )}

      {/* LIVE AI PIPELINE ANIMATION BAR */}
      {isAnalyzing && (
        <div className="p-6 rounded-2xl bg-white border border-blue-300 shadow-md space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#0A2540] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-700 animate-pulse" />
              Executing Vision AI Feature Extraction
            </span>
            <span className="font-mono text-blue-700 font-bold">Step {pipelineStep + 1} of 8</span>
          </div>

          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden border border-slate-300">
            <div 
              className="bg-blue-700 h-full transition-all duration-300"
              style={{ width: `${((pipelineStep + 1) / 8) * 100}%` }}
            />
          </div>

          <p className="text-xs font-mono text-blue-900 font-bold text-center animate-pulse">
            {PIPELINE_STEPS[pipelineStep]}
          </p>
        </div>
      )}

      {/* VISION AI ANALYSIS RESULT PANEL */}
      {analyzedIncident && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
                  AI ANALYSIS COMPLETE
                </span>
                <span className="text-xs font-mono text-slate-500 font-bold">ID: {analyzedIncident.id}</span>
              </div>
              <h2 className="text-xl font-black text-[#0A2540] mt-1">{analyzedIncident.title}</h2>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500 font-bold block">Priority Score</span>
              <span className="text-3xl font-black text-blue-900">{analyzedIncident.priorityScore}/100</span>
            </div>
          </div>

          {/* Image & Bounding Box View */}
          <div className="grid md:grid-cols-2 gap-6">
            
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-900 block">Detected Bounding Box Overlay</span>
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                <img src={analyzedIncident.imageUrl} alt="Defect" className="w-full h-64 object-cover" />
                
                {/* Simulated AI YOLO Bounding Box */}
                <div 
                  className="absolute border-2 border-red-500 bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                  style={{
                    left: `${analyzedIncident.boundingBox?.x || 20}%`,
                    top: `${analyzedIncident.boundingBox?.y || 25}%`,
                    width: `${analyzedIncident.boundingBox?.width || 55}%`,
                    height: `${analyzedIncident.boundingBox?.height || 45}%`
                  }}
                >
                  <span className="absolute -top-6 left-0 bg-red-600 text-white text-[9px] font-bold font-mono px-1.5 py-0.5 rounded">
                    Pothole • Confidence {analyzedIncident.confidence}%
                  </span>
                </div>
              </div>
            </div>

            {/* AI Core Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Severity Rating</span>
                <span className={`text-base font-black ${
                  analyzedIncident.severity === 'CRITICAL' ? 'text-red-700' : 'text-amber-700'
                }`}>
                  {analyzedIncident.severity}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Surface Area</span>
                <span className="text-base font-black text-slate-900">{analyzedIncident.surfaceAreaM2} m²</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Estimated Depth</span>
                <span className="text-base font-black text-blue-900">
                  {analyzedIncident.estimatedDepthCm} cm <span className="text-[9px] text-slate-500 font-normal">(AI Est.)</span>
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Repair Cost Estimate</span>
                <span className="text-base font-black text-emerald-700">₹{analyzedIncident.estimatedCostINR.toLocaleString()}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 col-span-2">
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Recommended Crew Match</span>
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <Truck className="w-4 h-4 text-blue-700" />
                  GVMC Rapid Repair Squad Alpha
                </span>
              </div>
            </div>

          </div>

          {/* Explainable AI Panel */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="font-bold text-xs text-[#0A2540] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              Explainable AI Priority Score Rationale (Score: {analyzedIncident.priorityScore}/100)
            </h4>
            <div className="grid sm:grid-cols-2 gap-2 text-xs text-slate-700 pt-1">
              <div>• <strong className="text-slate-900">Road Type:</strong> {analyzedIncident.explainability.roadType}</div>
              <div>• <strong className="text-slate-900">Traffic Density:</strong> {analyzedIncident.explainability.trafficDensity}</div>
              <div className="sm:col-span-2">• <strong className="text-slate-900">Hazard Risk:</strong> {analyzedIncident.explainability.hazardRisk}</div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <button
              onClick={() => onOpenDispatch(analyzedIncident.id)}
              className="px-6 py-3 rounded-xl bg-[#0A2540] hover:bg-[#1E3A8A] text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Truck className="w-4 h-4 text-amber-400" />
              Dispatch Fleet Squad Now
            </button>
          </div>

        </motion.div>
      )}

    </div>
  );
};

