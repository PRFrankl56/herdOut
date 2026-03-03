import { Match, Request, Transporter, Animal } from "@prisma/client";

export type MatchWithRelations = Match & {
  request: Request & { animals: Animal[] };
  transporter: Transporter;
};

// TODO: Replace with Twilio SMS
export async function notifyTransporter(match: MatchWithRelations): Promise<void> {
  const { request, transporter } = match;
  const totalAnimals = request.animals.reduce((sum, a) => sum + a.count, 0);

  console.log("=== TRANSPORTER NOTIFICATION ===");
  console.log(`To: ${transporter.name} (${transporter.phone})`);
  console.log(`Match ID: ${match.id}`);
  console.log(`Request from: ${request.name} at ${request.address}`);
  console.log(`Animals: ${totalAnimals} total`);
  console.log(`Trailer needed: ${request.trailerType}`);
  console.log(`Respond at: /respond/${match.id}`);
  console.log("================================");
}

// TODO: Replace with Twilio SMS
export async function notifyRequester(match: MatchWithRelations, status: string): Promise<void> {
  const { request, transporter } = match;

  console.log("=== REQUESTER NOTIFICATION ===");
  console.log(`To: ${request.name} (${request.phone})`);
  console.log(`Match ID: ${match.id}`);
  console.log(`Status: ${status}`);
  if (status === "confirmed") {
    console.log(`Transporter: ${transporter.name} (${transporter.phone})`);
    console.log(`Stalls: ${transporter.stallCount}`);
  } else if (status === "queued") {
    console.log("No transporter currently available. You are in the queue.");
  }
  console.log("===============================");
}
