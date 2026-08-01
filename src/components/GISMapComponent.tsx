import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { MapContainer, TileLayer, Marker as LeafletMarker, Popup as LeafletPopup } from 'react-leaflet';
import L from 'leaflet';
import { Incident, FleetCrew } from '../types';
import { AlertTriangle, MapPin, Truck, ExternalLink, ShieldAlert, Globe, Info, X } from 'lucide-react';

interface GISMapComponentProps {
  incidents: Incident[];
  crews?: FleetCrew[];
  selectedIncidentId?: string | null;
  onSelectIncident?: (incident: Incident) => void;
  onCloseIncident?: () => void;
  onCloseMap?: () => void;
  showHeatmap?: boolean;
  height?: string;
}

const rawApiKey =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY ||
  '';

const hasValidGoogleMapsKey = Boolean(
  rawApiKey &&
    rawApiKey.trim().length > 20 &&
    !rawApiKey.includes('ouumws') &&
    !rawApiKey.includes('YOUR_')
);

const API_KEY = hasValidGoogleMapsKey ? rawApiKey : '';

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'CRITICAL':
      return '#EF4444';
    case 'HIGH':
      return '#F59E0B';
    case 'MEDIUM':
      return '#3B82F6';
    case 'LOW':
    default:
      return '#22C55E';
  }
};

// Create custom Leaflet DivIcons for severity levels
const createLeafletPin = (severity: string, isSelected: boolean) => {
  const color = getSeverityColor(severity);
  const size = isSelected ? 32 : 24;
  return L.divIcon({
    className: 'custom-gis-pin',
    html: `<div style="
      background-color: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: 2px solid #ffffff;
      box-shadow: 0 4px 8px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    ">
      <div style="width: 8px; height: 8px; background-color: #ffffff; border-radius: 50%;"></div>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};

const createFleetPin = () => {
  return L.divIcon({
    className: 'custom-fleet-pin',
    html: `<div style="
      background-color: #0A2540;
      width: 28px;
      height: 28px;
      border-radius: 8px;
      border: 2px solid #00D9FF;
      box-shadow: 0 4px 10px rgba(0,217,255,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #00D9FF;
      font-weight: bold;
      font-size: 10px;
    ">
      🚜
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

export const GISMapComponent: React.FC<GISMapComponentProps> = ({
  incidents,
  crews = [],
  selectedIncidentId,
  onSelectIncident,
  onCloseIncident,
  onCloseMap,
  height = '450px'
}) => {
  const [activeIncident, setActiveIncident] = useState<Incident | null>(null);
  const [activeCrew, setActiveCrew] = useState<FleetCrew | null>(null);
  const [dismissedId, setDismissedId] = useState<string | null>(null);
  const [mapAuthError, setMapAuthError] = useState<boolean>(false);
  const [preferredProvider, setPreferredProvider] = useState<'google' | 'leaflet'>(
    hasValidGoogleMapsKey ? 'google' : 'leaflet'
  );

  const vizagCenter = { lat: 17.7240, lng: 83.3100 };

  useEffect(() => {
    // Reset dismissed state when a new selectedIncidentId is passed from parent
    if (selectedIncidentId) {
      setDismissedId(null);
    }
  }, [selectedIncidentId]);

  const selectedInc =
    (selectedIncidentId && dismissedId !== selectedIncidentId)
      ? incidents.find(i => i.id === selectedIncidentId) || activeIncident
      : activeIncident;

  const handleCloseOverlay = () => {
    if (selectedIncidentId) {
      setDismissedId(selectedIncidentId);
    }
    setActiveIncident(null);
    if (onCloseIncident) {
      onCloseIncident();
    }
  };

  // Listen for Google Maps Authentication / Billing failures (e.g. BillingNotEnabledMapError)
  useEffect(() => {
    const handleAuthFailure = () => {
      console.warn("Google Maps Auth/Billing error detected. Falling back to Leaflet OpenStreetMap.");
      setMapAuthError(true);
    };

    (window as any).gm_authFailure = handleAuthFailure;

    return () => {
      if ((window as any).gm_authFailure === handleAuthFailure) {
        delete (window as any).gm_authFailure;
      }
    };
  }, []);

  const useLeaflet = !hasValidGoogleMapsKey || mapAuthError || preferredProvider === 'leaflet';

  return (
    <div style={{ height }} className="w-full relative rounded-2xl overflow-hidden border border-slate-300 shadow-xl bg-[#06132A]">
      
      {/* FLOATING MAP INCIDENT OVERLAY BANNER WITH CLOSE BUTTON */}
      {selectedInc && (
        <div className="absolute top-3 left-3 z-[1000] max-w-xs sm:max-w-sm bg-[#06132A]/95 text-white backdrop-blur-md p-3 rounded-2xl border border-amber-400/40 shadow-2xl space-y-2 font-sans animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5">
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400" /> Active Defect Location
            </span>
            <button
              onClick={handleCloseOverlay}
              className="px-2 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-300 hover:text-white transition-all border border-red-500/30 flex items-center gap-1 text-[10px] font-bold shadow-sm"
              title="Close Map Incident Details Overlay"
            >
              <span>Close Details</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-0.5">
            <h4 className="font-extrabold text-xs text-white leading-tight">{selectedInc.title}</h4>
            <p className="text-[10px] text-slate-300 font-medium">{selectedInc.locationName}</p>
          </div>
          <div className="flex items-center justify-between text-[10px] pt-1">
            <span className="px-2 py-0.5 rounded font-black text-white" style={{ backgroundColor: getSeverityColor(selectedInc.severity) }}>
              {selectedInc.severity}
            </span>
            {onSelectIncident && (
              <button
                onClick={() => onSelectIncident(selectedInc)}
                className="text-amber-400 font-extrabold hover:underline flex items-center gap-1"
              >
                Inspect Details <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* MAP PROVIDER TOGGLE & ERROR NOTICE OVERLAY */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2">
        {onCloseMap && (
          <button
            onClick={onCloseMap}
            className="p-2 rounded-xl bg-red-600/95 hover:bg-red-500 text-white shadow-xl transition-all border border-red-500/30 flex items-center gap-1.5 text-xs font-bold"
            title="Close Interactive Map View"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Close Map</span>
          </button>
        )}

        {mapAuthError && (
          <div className="px-3 py-1.5 rounded-lg bg-amber-500/90 text-slate-950 font-sans font-bold text-[11px] shadow-lg flex items-center gap-1.5 border border-amber-300 backdrop-blur-md">
            <Info className="w-3.5 h-3.5 text-slate-950 shrink-0" />
            <span>Maps Billing Notice: Running on OpenStreetMap GIS Layer</span>
          </div>
        )}

        {!mapAuthError && (
          <div className="bg-[#0A2540]/90 backdrop-blur-md border border-white/20 p-1 rounded-xl shadow-lg flex items-center gap-1">
            <button
              onClick={() => setPreferredProvider('google')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                preferredProvider === 'google'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Globe className="w-3 h-3 text-amber-400" /> Google Maps
            </button>
            <button
              onClick={() => setPreferredProvider('leaflet')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                preferredProvider === 'leaflet'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <MapPin className="w-3 h-3 text-[#00D9FF]" /> OpenStreetMap
            </button>
          </div>
        )}
      </div>

      {/* RENDER LEAFLET WHEN BILLING ERROR OR PREFERRED LEAFLET */}
      {useLeaflet ? (
        <MapContainer
          center={[vizagCenter.lat, vizagCenter.lng]}
          zoom={12}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* INCIDENTS LEAFLET MARKERS */}
          {incidents.map((inc) => {
            const isSelected = inc.id === selectedIncidentId || activeIncident?.id === inc.id;
            return (
              <LeafletMarker
                key={inc.id}
                position={[inc.coordinates[0], inc.coordinates[1]]}
                icon={createLeafletPin(inc.severity, isSelected)}
                eventHandlers={{
                  click: () => {
                    setActiveIncident(inc);
                    if (onSelectIncident) onSelectIncident(inc);
                  }
                }}
              >
                <LeafletPopup>
                  <div className="p-1 max-w-[220px] text-slate-900 font-sans">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span
                        className="px-2 py-0.5 rounded text-[9px] font-black text-white"
                        style={{ backgroundColor: getSeverityColor(inc.severity) }}
                      >
                        {inc.severity}
                      </span>
                      <span className="text-[10px] text-slate-600 font-mono font-bold">
                        Priority {inc.priorityScore}/100
                      </span>
                    </div>

                    <h4 className="font-extrabold text-xs text-slate-900 mb-1 leading-tight">{inc.title}</h4>
                    <p className="text-[11px] text-slate-600 mb-2 font-medium">{inc.locationName}</p>

                    <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-700 mb-2 border-t border-b border-slate-200 py-1">
                      <div>Depth: <strong className="text-slate-900">{inc.estimatedDepthCm}cm</strong></div>
                      <div>Area: <strong className="text-slate-900">{inc.surfaceAreaM2}m²</strong></div>
                    </div>

                    {onSelectIncident && (
                      <button
                        onClick={() => onSelectIncident(inc)}
                        className="w-full py-1.5 rounded bg-[#0A2540] hover:bg-[#1E3A8A] text-white font-extrabold text-[10px] transition-colors flex items-center justify-center gap-1 shadow-sm"
                      >
                        <ExternalLink className="w-3 h-3 text-amber-400" /> View Incident Details
                      </button>
                    )}
                  </div>
                </LeafletPopup>
              </LeafletMarker>
            );
          })}

          {/* FLEET CREWS LEAFLET MARKERS */}
          {crews.map((crew) => (
            <LeafletMarker
              key={crew.id}
              position={[crew.coordinates[0], crew.coordinates[1]]}
              icon={createFleetPin()}
            >
              <LeafletPopup>
                <div className="p-1 font-sans text-slate-900">
                  <div className="flex items-center gap-1.5 text-blue-900 font-extrabold text-xs mb-1">
                    <Truck className="w-4 h-4 text-amber-500" /> {crew.name}
                  </div>
                  <p className="text-[11px] text-slate-600 mb-1">{crew.vehicleType}</p>
                  <div className="text-[10px] text-slate-700">
                    Status: <strong className="text-emerald-700">{crew.status}</strong>
                  </div>
                </div>
              </LeafletPopup>
            </LeafletMarker>
          ))}
        </MapContainer>
      ) : (
        /* GOOGLE MAPS PLATFORM PROVIDER */
        <APIProvider apiKey={API_KEY} version="weekly">
          <Map
            defaultCenter={vizagCenter}
            defaultZoom={12}
            mapId="GVMC_GIS_MAP"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
            gestureHandling="greedy"
          >
            {/* INCIDENT ADVANCED MARKERS */}
            {incidents.map((inc) => {
              const isSelected = inc.id === selectedIncidentId || activeIncident?.id === inc.id;
              const pinColor = getSeverityColor(inc.severity);
              const lat = inc.coordinates[0];
              const lng = inc.coordinates[1];

              return (
                <AdvancedMarker
                  key={inc.id}
                  position={{ lat, lng }}
                  title={inc.title}
                  onClick={() => {
                    setActiveIncident(inc);
                    if (onSelectIncident) onSelectIncident(inc);
                  }}
                >
                  <Pin
                    background={pinColor}
                    borderColor="#ffffff"
                    glyphColor="#ffffff"
                    scale={isSelected ? 1.3 : 1.0}
                  />
                </AdvancedMarker>
              );
            })}

            {/* FLEET CREW ADVANCED MARKERS */}
            {crews.map((crew) => {
              const lat = crew.coordinates[0];
              const lng = crew.coordinates[1];

              return (
                <AdvancedMarker
                  key={crew.id}
                  position={{ lat, lng }}
                  title={crew.name}
                  onClick={() => setActiveCrew(crew)}
                >
                  <Pin
                    background="#0A2540"
                    borderColor="#00D9FF"
                    glyphColor="#00D9FF"
                    scale={1.1}
                  />
                </AdvancedMarker>
              );
            })}

            {/* INCIDENT INFO WINDOW */}
            {selectedInc && (
              <InfoWindow
                position={{ lat: selectedInc.coordinates[0], lng: selectedInc.coordinates[1] }}
                onCloseClick={handleCloseOverlay}
              >
                <div className="p-1 max-w-[220px] text-slate-900 font-sans">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span
                      className="px-2 py-0.5 rounded text-[9px] font-black text-white"
                      style={{ backgroundColor: getSeverityColor(selectedInc.severity) }}
                    >
                      {selectedInc.severity}
                    </span>
                    <span className="text-[10px] text-slate-600 font-mono font-bold">
                      Priority {selectedInc.priorityScore}/100
                    </span>
                  </div>

                  <h4 className="font-extrabold text-xs text-slate-900 mb-1 leading-tight">{selectedInc.title}</h4>
                  <p className="text-[11px] text-slate-600 mb-2 font-medium">{selectedInc.locationName}</p>

                  <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-700 mb-2 border-t border-b border-slate-200 py-1">
                    <div>Depth: <strong className="text-slate-900">{selectedInc.estimatedDepthCm}cm</strong></div>
                    <div>Area: <strong className="text-slate-900">{selectedInc.surfaceAreaM2}m²</strong></div>
                  </div>

                  {onSelectIncident && (
                    <button
                      onClick={() => onSelectIncident(selectedInc)}
                      className="w-full py-1.5 rounded bg-[#0A2540] hover:bg-[#1E3A8A] text-white font-extrabold text-[10px] transition-colors flex items-center justify-center gap-1 shadow-sm"
                    >
                      <ExternalLink className="w-3 h-3 text-amber-400" /> View Incident Details
                    </button>
                  )}
                </div>
              </InfoWindow>
            )}

            {/* FLEET CREW INFO WINDOW */}
            {activeCrew && (
              <InfoWindow
                position={{ lat: activeCrew.coordinates[0], lng: activeCrew.coordinates[1] }}
                onCloseClick={() => setActiveCrew(null)}
              >
                <div className="p-1 font-sans text-slate-900">
                  <div className="flex items-center gap-1.5 text-blue-900 font-extrabold text-xs mb-1">
                    <Truck className="w-4 h-4 text-amber-500" /> {activeCrew.name}
                  </div>
                  <p className="text-[11px] text-slate-600 mb-1">{activeCrew.vehicleType}</p>
                  <div className="text-[10px] text-slate-700">
                    Status: <strong className="text-emerald-700">{activeCrew.status}</strong>
                  </div>
                </div>
              </InfoWindow>
            )}

          </Map>
        </APIProvider>
      )}

      {/* MAP LEGEND OVERLAY */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-md border border-slate-300 p-3 rounded-xl text-[11px] space-y-1.5 shadow-lg text-slate-900 font-sans">
        <div className="font-extrabold text-[10px] uppercase text-[#0A2540] tracking-wider mb-1 flex items-center gap-1">
          <MapPin className="w-3 h-3 text-blue-700" /> {useLeaflet ? 'OpenStreetMap GIS Legend' : 'Google Maps GIS Legend'}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
          <span className="font-semibold text-slate-800">Critical Pothole (&gt;10cm)</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
          <span className="font-semibold text-slate-800">High Risk Defect</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-3 h-3 rounded-full bg-[#3B82F6]" />
          <span className="font-semibold text-slate-800">Medium / Low Risk</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-3 h-3 rounded-md bg-[#0A2540] text-amber-400 text-[8px] font-bold flex items-center justify-center">GVMC</span>
          <span className="font-semibold text-slate-800">Fleet Squad Unit</span>
        </div>
      </div>
    </div>
  );
};
