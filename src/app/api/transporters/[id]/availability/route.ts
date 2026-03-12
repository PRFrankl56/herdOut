import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { availability } = body;

    if (!availability || !["available", "unavailable"].includes(availability)) {
      return NextResponse.json(
        { error: "Invalid availability. Must be 'available' or 'unavailable'" },
        { status: 400 }
      );
    }

    // Verify this transporter belongs to the current user
    const transporter = await prisma.transporter.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!transporter) {
      return NextResponse.json({ error: "Transporter not found" }, { status: 404 });
    }

    if (transporter.user?.email !== session.user.email) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.transporter.update({
      where: { id },
      data: { availability },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update availability:", error);
    return NextResponse.json(
      { error: "Failed to update availability" },
      { status: 500 }
    );
  }
}
