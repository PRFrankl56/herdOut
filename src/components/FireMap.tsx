"use client";

import { useEffect, useRef } from "react";

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

export default function FireMap({ fires, requests, transporters }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Load Leaflet CSS dynamically (avoids webpack conflict)
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    // Dynamically import Leaflet only on the client
    import("leaflet").then((L) => {
      const Lx = L.default;

      const map = Lx.map(containerRef.current!).setView([39.5, -105.5], 5);
      mapRef.current = map;

      Lx.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const makeIcon = (emoji: string) =>
        Lx.divIcon({
          html: `<span style="font-size:26px;line-height:1">${emoji}</span>`,
          className: "",
          iconSize: [30, 30],
          iconAnchor: [15, 15],
          popupAnchor: [0, -18],
        });

      const fireIcon = makeIcon("🔥");
      const requestIcon = makeIcon("🚨");
      const transporterIcon = makeIcon("🚛");

      const allLatLngs: [number, number][] = [];

      fires.forEach((fire) => {
        allLatLngs.push([fire.lat, fire.lng]);
        Lx.marker([fire.lat, fire.lng], { icon: fireIcon })
          .addTo(map)
          .bindPopup(`
            <strong style="color:#b91c1c">🔥 ${fire.title}</strong><br/>
            <span style="color:#6b7280;font-size:13px">${fire.state}</span><br/>
            ${fire.updated ? `<span style="color:#9ca3af;font-size:12px">Updated ${fire.updated}</span><br/>` : ""}
            <a href="${fire.url}" target="_blank" style="color:#2563eb;font-size:12px">View on InciWeb →</a>
          `);
      });

      requests.forEach((req) => {
        allLatLngs.push([req.lat, req.lng]);
        Lx.marker([req.lat, req.lng], { icon: requestIcon })
          .addTo(map)
          .bindPopup(`
            <strong style="color:#c2410c">🚨 Evacuation Request</strong><br/>
            <span style="color:#374151;font-size:13px">${req.address}</span><br/>
            <span style="color:#6b7280;font-size:12px;font-weight:bold;text-transform:uppercase">${req.status}</span>
          `);
      });

      transporters.forEach((t) => {
        allLatLngs.push([t.lat, t.lng]);
        Lx.marker([t.lat, t.lng], { icon: transporterIcon })
          .addTo(map)
          .bindPopup(`
            <strong style="color:#1d4ed8">🚛 ${t.name}</strong><br/>
            <span style="color:#374151;font-size:13px">${t.stallCount} stalls</span><br/>
            <span style="color:#6b7280;font-size:12px;font-weight:bold;text-transform:uppercase">${t.availability}</span>
          `);
      });

      if (allLatLngs.length > 0) {
        map.fitBounds(Lx.latLngBounds(allLatLngs), { padding: [40, 40] });
      }
    });

    return () => {
      if (mapRef.current) {
        (mapRef.current as { remove: () => void }).remove();
        mapRef.current = null;
      }
    };
  }, [fires, requests, transporters]);

  return (
    <div ref={containerRef} style={{ height: "100%", width: "100%", borderRadius: "12px" }} />
  );
}
