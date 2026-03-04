import { Match, Request, Transporter, RequestAnimal } from "@prisma/client";
import { sendPushToUser } from "./push";

export type MatchWithRelations = Match & {
  request: Request & { animals: RequestAnimal[] };
  transporter: Transporter;
};

export async function notifyTransporter(match: MatchWithRelations): Promise<void> {
  const { request, transporter } = match;
  const totalAnimals = request.animals.reduce((sum, a) => sum + a.count, 0);

  // Push notification to transporter
  if (transporter.userId) {
    await sendPushToUser(transporter.userId, {
      title: "🚛 New Evacuation Request",
      body: `${totalAnimals} animal${totalAnimals !== 1 ? "s" : ""} near ${request.address} need transport`,
      url: `/respond/${match.id}`,
    });
  }

  // TODO: Twilio SMS fallback
  console.log(`[notify] Transporter ${transporter.name} → match ${match.id}`);
}

export async function notifyRequester(match: MatchWithRelations, status: string): Promise<void> {
  const { request, transporter } = match;

  // Push notification to requester
  if (request.userId) {
    if (status === "confirmed") {
      await sendPushToUser(request.userId, {
        title: "✅ Transporter Found!",
        body: `${transporter.name} is on the way to help with your animals`,
        url: `/request/${request.id}`,
      });
    } else if (status === "queued") {
      await sendPushToUser(request.userId, {
        title: "🔍 Looking for a Transporter",
        body: "Your request is in the queue — we'll notify you as soon as someone is matched",
        url: `/request/${request.id}`,
      });
    } else if (status === "declined") {
      await sendPushToUser(request.userId, {
        title: "Finding another transporter...",
        body: "Your previous match declined — we're searching for another transporter",
        url: `/request/${request.id}`,
      });
    }
  }

  // TODO: Twilio SMS fallback
  console.log(`[notify] Requester ${request.name} → status ${status}`);
}
