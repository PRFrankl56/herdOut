import webpush from "web-push";
import { prisma } from "./prisma";

function initWebPush() {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
}

export async function sendPushToUser(userId: string, payload: { title: string; body: string; url?: string }) {
  if (!process.env.VAPID_PRIVATE_KEY) return; // not configured, skip silently
  initWebPush();

  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  const json = JSON.stringify(payload);

  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          json
        );
      } catch (err: unknown) {
        const e = err as { statusCode?: number };
        if (e.statusCode === 410 || e.statusCode === 404) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
        }
      }
    })
  );
}
