import { NextRequest, NextResponse } from "next/server";
import { matchRequest } from "@/lib/matching";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const match = await matchRequest(id);

    if (!match) {
      return NextResponse.json(
        { message: "No available transporter found, request queued" },
        { status: 200 }
      );
    }

    return NextResponse.json(match, { status: 201 });
  } catch (error) {
    console.error("Failed to trigger matching:", error);
    return NextResponse.json(
      { error: "Failed to trigger matching" },
      { status: 500 }
    );
  }
}
