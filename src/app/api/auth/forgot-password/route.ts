import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ success: true }); // no enumeration
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    });

    const resetUrl = `https://herdout.vercel.app/reset-password?token=${resetToken}`;

    await resend.emails.send({
      from: "HerdOut <RookF567@gmail.com>",
      to: email,
      subject: "Reset your HerdOut password",
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px">
          <h1 style="color:#1e1b4b;font-size:24px;margin-bottom:8px">HerdOut</h1>
          <p style="color:#374151;font-size:16px">You requested a password reset. Click the button below to set a new password. This link expires in 1 hour.</p>
          <a href="${resetUrl}" style="display:inline-block;margin:24px 0;padding:14px 28px;background:#f59e0b;color:#1e1b4b;font-weight:bold;font-size:16px;text-decoration:none;border-radius:8px">Reset Password</a>
          <p style="color:#9ca3af;font-size:14px">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });
  }

  // Always return success to prevent email enumeration
  return NextResponse.json({ success: true });
}
