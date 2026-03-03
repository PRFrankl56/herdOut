"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// Must import Leaflet CSS at app level; import here as fallback
import "leaflet/dist/leaflet.css";

// Fix broken default icon URLs in webpack/Next.js builds
// @ts-expect-error _getIconUrl exists at runtime
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Fix Leaflet default icon paths in Next.js
const fixIcon = (emoji: string, size = 32) =>
  L.divIcon({
    html: `<div style="font-size:${size}px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.5))">${emoji}</div>`,
    className: "",
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });

const fireIcon = fixIcon("🔥", 28);
const requestIcon = fixIcon("🚨", 28);
const transporterIcon = fixIcon("🚛", 28);

interface Fire {
  title: string;
  state: string;
  lat: number;
  lng: number;
  updated: string;
  url: string;
}

interface Request {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  animalCount: number;
  status: string;
}

interface Transporter {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  stallCount: number;
  availability: string;
}

interface Props {
  fires: Fire[];
  requests: Request[];
  transporters: Transporter[];
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [map, points]);
  return null;
}

export default function FireMap({ fires, requests, transporters }: Props) {
  const allPoints: [number, number][] = [
    ...fires.map((f) => [f.lat, f.lng] as [number, number]),
    ...requests.filter((r) => r.lat && r.lng).map((r) => [r.lat, r.lng] as [number, number]),
    ...transporters.filter((t) => t.lat && t.lng).map((t) => [t.lat, t.lng] as [number, number]),
  ];

  const center: [number, number] = allPoints.length > 0
    ? [allPoints.reduce((s, p) => s + p[0], 0) / allPoints.length,
       allPoints.reduce((s, p) => s + p[1], 0) / allPoints.length]
    : [39.5, -105.5]; // default: Colorado

  return (
    <MapContainer
      center={center}
      zoom={6}
      style={{ height: "100%", width: "100%", borderRadius: "12px" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {allPoints.length > 1 && <FitBounds points={allPoints} />}

      {fires.map((fire, i) => (
        <Marker key={`fire-${i}`} position={[fire.lat, fire.lng]} icon={fireIcon}>
          <Popup>
            <div className="font-sans">
              <p className="font-bold text-red-700 mb-1">🔥 {fire.title}</p>
              <p className="text-gray-600 text-sm">{fire.state}</p>
              {fire.updated && <p className="text-gray-400 text-xs mt-1">Updated {fire.updated}</p>}
              <a href={fire.url} target="_blank" rel="noopener noreferrer"
                className="text-blue-600 text-xs underline mt-1 block">
                View on InciWeb →
              </a>
            </div>
          </Popup>
        </Marker>
      ))}

      {requests.map((req) => (
        <Marker key={`req-${req.id}`} position={[req.lat, req.lng]} icon={requestIcon}>
          <Popup>
            <div className="font-sans">
              <p className="font-bold text-orange-700 mb-1">🚨 Evacuation Request</p>
              <p className="text-gray-700 text-sm">{req.address}</p>
              <p className="text-gray-600 text-sm">{req.animalCount} animal{req.animalCount !== 1 ? "s" : ""}</p>
              <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full mt-1 ${
                req.status === "matched" ? "bg-green-100 text-green-700" :
                req.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                "bg-gray-100 text-gray-600"
              }`}>
                {req.status.toUpperCase()}
              </span>
            </div>
          </Popup>
        </Marker>
      ))}

      {transporters.map((t) => (
        <Marker key={`trans-${t.id}`} position={[t.lat, t.lng]} icon={transporterIcon}>
          <Popup>
            <div className="font-sans">
              <p className="font-bold text-blue-700 mb-1">🚛 Transporter</p>
              <p className="text-gray-700 text-sm">{t.address}</p>
              <p className="text-gray-600 text-sm">{t.stallCount} stalls</p>
              <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full mt-1 ${
                t.availability === "available" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
              }`}>
                {t.availability === "available" ? "AVAILABLE" : "BUSY"}
              </span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
