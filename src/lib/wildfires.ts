export interface Incident {
  title: string;
  state: string;
  lat: number | null;
  lng: number | null;
  type: string;
  updated: string;
  url: string;
  overview: string;
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

export async function fetchWildfires(): Promise<Incident[]> {
  try {
    const res = await fetch("https://inciweb.wildfire.gov/incidents/rss.xml", {
      next: { revalidate: 300 }, // cache 5 minutes
    });
    const xml = await res.text();

    // Parse items
    const items = xml.split("<item>").slice(1);
    const incidents: Incident[] = [];

    for (const item of items) {
      const titleMatch = item.match(/<title>([^<]+)<\/title>/);
      const linkMatch = item.match(/<link>([^<]+)<\/link>/);
      const descMatch = item.match(/<description>([\s\S]*?)<\/description>/);

      if (!titleMatch || !descMatch) continue;

      const title = titleMatch[1].trim();
      const url = linkMatch?.[1].trim() ?? "https://inciweb.wildfire.gov";
      const desc = descMatch[1].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ");

      const type = parseIncidentType(desc);
      const state = parseState(desc);
      const lat = parseCoord(desc, "Latitude");
      const lng = parseCoord(desc, "Longitude");

      const updatedMatch = desc.match(/Last updated:\s*([\d-]+)/);
      const updated = updatedMatch?.[1] ?? "";

      // Filter: wildfires only, western states only
      if (!type.toLowerCase().includes("wildfire")) continue;
      if (!WESTERN_STATES.some(s => state.toLowerCase().includes(s.toLowerCase()))) continue;

      incidents.push({ title, state, lat, lng, type, updated, url, overview: "" });
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
