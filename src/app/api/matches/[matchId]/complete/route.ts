import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await params;

    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    if (match.status !== "accepted") {
      return NextResponse.json(
        { error: "Only accepted matches can be completed" },
        { status: 400 }
      );
    }

    // Complete the match
    const updated = await prisma.match.update({
      where: { id: matchId },
      data: { status: "completed" },
      include: {
        request: { include: { animals: true } },
        transporter: true,
      },
    });

    // Return transporter to available pool
    await prisma.transporter.update({
      where: { id: match.transporterId },
      data: { availability: "available" },
    });

    // Mark request as completed
    await prisma.request.update({
      where: { id: match.requestId },
      data: { status: "completed" },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to complete match:", error);
    return NextResponse.json(
      { error: "Failed to complete match" },
      { status: 500 }
    );
  }
}
