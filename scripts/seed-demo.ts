/**
 * Demo seed script — populates HerdOut with realistic Colorado data
 * Run with: npx ts-node --project tsconfig.json -e "require('./scripts/seed-demo.ts')"
 * Or: npx tsx scripts/seed-demo.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding demo data...");

  // ── Transporters ──────────────────────────────────────────────
  const transporters = await Promise.all([
    prisma.transporter.create({ data: {
      name: "Wade Callahan",
      phone: "970-555-0182",
      address: "4821 County Road 38E, Fort Collins, CO 80524",
      lat: 40.6523, lng: -105.0624,
      stallCount: 6,
      rigLengthFt: "40",
      trailerTypes: JSON.stringify(["stock", "gooseneck"]),
      driveCapability: "N/A",
      livestockTypes: JSON.stringify(["horses", "cattle", "goats"]),
      maxDistance: "100",
      availableNow: true,
      availability: "available",
      notes: "Two-axle stock trailer. Comfortable hauling difficult loaders.",
    }}),
    prisma.transporter.create({ data: {
      name: "Deb Harrington",
      phone: "303-555-0247",
      address: "12980 Arapahoe Rd, Boulder, CO 80303",
      lat: 39.9862, lng: -105.2313,
      stallCount: 3,
      rigLengthFt: "24",
      trailerTypes: JSON.stringify(["slant-load"]),
      driveCapability: "N/A",
      livestockTypes: JSON.stringify(["horses"]),
      maxDistance: "75",
      availableNow: true,
      availability: "available",
      notes: "Slant load, horses only. Can take one mare with foal.",
    }}),
    prisma.transporter.create({ data: {
      name: "TJ Montoya",
      phone: "719-555-0391",
      address: "8200 Falcon Rd, Falcon, CO 80831",
      lat: 38.9367, lng: -104.6163,
      stallCount: 8,
      rigLengthFt: "48",
      trailerTypes: JSON.stringify(["stock", "gooseneck"]),
      driveCapability: "N/A",
      livestockTypes: JSON.stringify(["horses", "cattle", "sheep", "goats", "pigs"]),
      maxDistance: "150",
      availableNow: true,
      availability: "in_progress",
      notes: "Large stock combo. Have hauled everything from minis to drafts.",
    }}),
    prisma.transporter.create({ data: {
      name: "Kristy Bauer",
      phone: "970-555-0513",
      address: "3345 S Teller Ave, Pueblo, CO 81004",
      lat: 38.2438, lng: -104.6364,
      stallCount: 4,
      rigLengthFt: "32",
      trailerTypes: JSON.stringify(["bumper-pull"]),
      driveCapability: "N/A",
      livestockTypes: JSON.stringify(["horses", "goats", "sheep"]),
      maxDistance: "100",
      availableNow: true,
      availability: "available",
      notes: "4-horse bumper pull. Good with small ruminants too.",
    }}),
    prisma.transporter.create({ data: {
      name: "Russ Eldredge",
      phone: "970-555-0678",
      address: "7810 CR 100, Carbondale, CO 81623",
      lat: 39.3817, lng: -107.2229,
      stallCount: 5,
      rigLengthFt: "36",
      trailerTypes: JSON.stringify(["gooseneck"]),
      driveCapability: "N/A",
      livestockTypes: JSON.stringify(["horses", "cattle"]),
      maxDistance: "120",
      availableNow: true,
      availability: "available",
      notes: "Western slope — can cover Glenwood, Aspen, Basalt corridors.",
    }}),
  ]);

  console.log(`✓ Created ${transporters.length} transporters`);

  // ── Evacuation Requests ───────────────────────────────────────
  const requests = await Promise.all([
    prisma.request.create({ data: {
      name: "Lena Sorenson",
      phone: "303-555-0821",
      address: "9340 Lefthand Canyon Dr, Jamestown, CO 80455",
      lat: 40.1142, lng: -105.4052,
      situation: "Fire moving fast from the ridge — we have 2 horses and 4 goats. Can't get to the barn road, it's already smoky.",
      evacuationScope: "all",
      trailerType: "any",
      status: "matched",
      animals: { create: [
        { species: "horse", count: 2, specialNeeds: "One mare is 8 months pregnant" },
        { species: "goats", count: 4, specialNeeds: null },
      ]},
    }}),
    prisma.request.create({ data: {
      name: "Mark Theriault",
      phone: "719-555-0934",
      address: "16020 Peyton Hwy, Peyton, CO 80831",
      lat: 38.9843, lng: -104.5629,
      situation: "Mandatory evac order just came through. 3 horses, one is a stallion and difficult to load. Need someone experienced.",
      evacuationScope: "own",
      trailerType: "stock",
      status: "confirmed",
      animals: { create: [
        { species: "horse", count: 2, specialNeeds: null },
        { species: "horse", count: 1, specialNeeds: "Stallion — difficult to load, warm blood size" },
      ]},
    }}),
    prisma.request.create({ data: {
      name: "Carol Wimberley",
      phone: "970-555-1042",
      address: "2201 Spring Creek Rd, Glenwood Springs, CO 81601",
      lat: 39.5514, lng: -107.3247,
      situation: "Grizzly Creek fire rekindle — smoke visible from pasture. Have 1 horse and 6 sheep.",
      evacuationScope: "own",
      trailerType: "any",
      status: "unmatched",
      animals: { create: [
        { species: "horse", count: 1, specialNeeds: null },
        { species: "sheep", count: 6, specialNeeds: null },
      ]},
    }}),
    prisma.request.create({ data: {
      name: "Ben Gallagher",
      phone: "303-555-1158",
      address: "5680 Sunshine Canyon Dr, Boulder, CO 80302",
      lat: 40.0384, lng: -105.3521,
      situation: "Cal-Wood area fire spreading south. Need to move 4 horses immediately.",
      evacuationScope: "all",
      trailerType: "gooseneck",
      status: "matched",
      animals: { create: [
        { species: "horse", count: 4, specialNeeds: "One has Cushings — needs careful loading" },
      ]},
    }}),
    prisma.request.create({ data: {
      name: "Tonya Esparza",
      phone: "719-555-1267",
      address: "3100 Rye Mountain Rd, Rye, CO 81069",
      lat: 37.9082, lng: -104.9178,
      situation: "Smoke visible on highway. Small hobby farm — 2 horses, 12 chickens (don't need trailer for chickens), 2 pigs.",
      evacuationScope: "own",
      trailerType: "stock",
      status: "unmatched",
      animals: { create: [
        { species: "horse", count: 2, specialNeeds: null },
        { species: "pigs", count: 2, specialNeeds: null },
      ]},
    }}),
  ]);

  console.log(`✓ Created ${requests.length} evacuation requests`);

  // ── Matches ───────────────────────────────────────────────────
  await prisma.match.create({ data: {
    requestId: requests[0].id,
    transporterId: transporters[1].id,
    status: "accepted",
    notifiedAt: new Date(),
    respondedAt: new Date(),
  }});

  await prisma.match.create({ data: {
    requestId: requests[1].id,
    transporterId: transporters[2].id,
    status: "accepted",
    notifiedAt: new Date(),
    respondedAt: new Date(),
  }});

  await prisma.match.create({ data: {
    requestId: requests[3].id,
    transporterId: transporters[0].id,
    status: "accepted",
    notifiedAt: new Date(),
    respondedAt: new Date(),
  }});

  console.log("✓ Created 3 matches");
  console.log("\n✅ Demo seed complete!");
  console.log(`   ${transporters.length} transporters | ${requests.length} requests | 3 matches`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
