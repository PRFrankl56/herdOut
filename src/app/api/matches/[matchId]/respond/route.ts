import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { matchRequest } from "@/lib/matching";
import { notifyRequester, MatchWithRelations } from "@/lib/notifications";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await params;
    const body = await req.json();
    const { action } = body;

    if (!action || !["accept", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'accept' or 'reject'" },
        { status: 400 }
      );
    }

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        request: { include: { animals: true } },
        transporter: true,
      },
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    if (match.status !== "pending") {
      return NextResponse.json(
        { error: "Match has already been responded to" },
        { status: 400 }
      );
    }

    if (action === "accept") {
      // Update match status
      const updated = await prisma.match.update({
        where: { id: matchId },
        data: { status: "accepted", respondedAt: new Date() },
        include: {
          request: { include: { animals: true } },
          transporter: true,
        },
      });

      // Lock transporter availability
      await prisma.transporter.update({
        where: { id: match.transporterId },
        data: { availability: "in_progress" },
      });

      // Confirm the request
      await prisma.request.update({
        where: { id: match.requestId },
        data: { status: "confirmed" },
      });

      await notifyRequester(updated as MatchWithRelations, "confirmed");

      return NextResponse.json(updated);
    } else {
      // Reject flow
      const updated = await prisma.match.update({
        where: { id: matchId },
        data: { status: "rejected", respondedAt: new Date() },
        include: {
          request: { include: { animals: true } },
          transporter: true,
        },
      });

      // Try to find next best transporter
      const nextMatch = await matchRequest(match.requestId);

      if (!nextMatch) {
        await notifyRequester(updated as MatchWithRelations, "queued");
      }

      return NextResponse.json(updated);
    }
  } catch (error) {
    console.error("Failed to respond to match:", error);
    return NextResponse.json(
      { error: "Failed to respond to match" },
      { status: 500 }
    );
  }
}
