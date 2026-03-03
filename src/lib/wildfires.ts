import { prisma } from "@/lib/prisma";

export interface Incident {
  title: string;
  state: string;
  lat: number | null;
  lng: number | null;
  type: string;
  updated: string;
  url: string;
  incidentId: string;
  containmentPct: number | null;
  containmentDelta: number | null; // change vs 24h ago
}

const WESTERN_STATES = [
  "Colorado", "California", "Arizona", "New Mexico", "Utah", "Nevada",
  "Oregon", "Washington", "Montana", "Idaho", "Wyoming", "Texas",
  "Oklahoma", "Kansas", "Nebraska", "South Dakota", "North Dakota"
];

function parseCoord(text: string, label: string): number | null {
  const regex = new RegExp(`${label}:\\s*([\\d]+)[°\\s]+([\\d]+)[\\s]+([\\d]+)`);
  const match = text.match(regex);
  if (!match) return null;
  const deg = parseInt(match[1]);
  const min = parseInt(match[2]);
  const sec = parseInt(match[3]);
  const decimal = deg + min / 60 + sec / 3600;
  return label === "Longitude" ? -decimal : decimal;
}

function parseIncidentType(text: string): string {
  const match = text.match(/type of incident is ([^a]+)/i);
  return match ? match[1].trim() : "Unknown";
}

function parseState(text: string): string {
  const match = text.match(/State:\s*([^\n\-]+)/);
  return match ? match[1].trim() : "";
}

function parseContainment(text: string): number | null {
  // Try various patterns: "35% contained", "35 percent contained", "Percent Contained: 35"
  const patterns = [
    /(\d+)%\s*contained/i,
    /(\d+)\s*percent\s*contained/i,
    /percent\s*contained[:\s]+(\d+)/i,
    /containment[:\s]+(\d+)%/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const val = parseInt(match[1]);
      if (val >= 0 && val <= 100) return val;
    }
  }
  return null;
}

function parseGuid(item: string): string {
  const match = item.match(/<guid[^>]*>([^<]+)<\/guid>/);
  return match ? match[1].trim() : "";
}

export async function fetchWildfires(): Promise<Incident[]> {
  try {
    const res = await fetch("https://inciweb.wildfire.gov/incidents/rss.xml", {
      next: { revalidate: 300 },
    });
    const xml = await res.text();
    const items = xml.split("<item>").slice(1);
    const incidents: Incident[] = [];
    const now = new Date();
    const cutoff24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Fetch all 24h-old snapshots for delta comparison
    const oldSnapshots = await prisma.fireSnapshot.findMany({
      where: { cachedAt: { gte: new Date(cutoff24h.getTime() - 30 * 60 * 1000), lte: cutoff24h } },
      orderBy: { cachedAt: "desc" },
    });
    const oldSnapshotMap = new Map<string, number | null>();
    for (const s of oldSnapshots) {
      if (!oldSnapshotMap.has(s.incidentId)) {
        oldSnapshotMap.set(s.incidentId, s.containmentPct);
      }
    }

    const snapshotsToCreate: { incidentId: string; title: string; containmentPct: number | null }[] = [];

    for (const item of items) {
      const titleMatch = item.match(/<title>([^<]+)<\/title>/);
      const linkMatch = item.match(/<link>([^<]+)<\/link>/);
      const descMatch = item.match(/<description>([\s\S]*?)<\/description>/);

      if (!titleMatch || !descMatch) continue;

      const title = titleMatch[1].trim();
      const url = linkMatch?.[1].trim() ?? "https://inciweb.wildfire.gov";
      const desc = descMatch[1]
        .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
        .replace(/&nbsp;/g, " ").replace(/&#\d+;/g, "");

      const type = parseIncidentType(desc);
      const state = parseState(desc);
      const lat = parseCoord(desc, "Latitude");
      const lng = parseCoord(desc, "Longitude");
      const incidentId = parseGuid(item);
      const containmentPct = parseContainment(desc);

      const updatedMatch = desc.match(/Last updated:\s*([\d-]+)/);
      const updated = updatedMatch?.[1] ?? "";

      if (!type.toLowerCase().includes("wildfire")) continue;
      if (!WESTERN_STATES.some(s => state.toLowerCase().includes(s.toLowerCase()))) continue;

      // Calculate delta vs 24h ago
      let containmentDelta: number | null = null;
      if (incidentId && oldSnapshotMap.has(incidentId)) {
        const oldVal = oldSnapshotMap.get(incidentId);
        if (oldVal !== null && oldVal !== undefined && containmentPct !== null) {
          containmentDelta = containmentPct - oldVal;
        }
      }

      incidents.push({ title, state, lat, lng, type, updated, url, incidentId, containmentPct, containmentDelta });

      if (incidentId) {
        snapshotsToCreate.push({ incidentId, title, containmentPct });
      }
    }

    // Store snapshots in background (don't await to keep response fast)
    if (snapshotsToCreate.length > 0) {
      prisma.fireSnapshot.createMany({ data: snapshotsToCreate }).catch(console.error);
    }

    return incidents.sort((a, b) => (b.updated > a.updated ? 1 : -1));
  } catch (e) {
    console.error("Failed to fetch wildfires:", e);
    return [];
  }
}

export function distanceMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
