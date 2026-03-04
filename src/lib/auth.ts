import { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  providers: [
    EmailProvider({
      from: process.env.EMAIL_FROM,
      sendVerificationRequest: async ({ identifier: email, url }) => {
        await resend.emails.send({
          from: "HerdOut <onboarding@resend.dev>",
          to: email,
          subject: "Sign in to HerdOut",
          html: `
            <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px">
              <h1 style="color:#1e1b4b;font-size:24px;margin-bottom:8px">HerdOut</h1>
              <p style="color:#374151;font-size:16px">Click the button below to sign in. This link expires in 24 hours.</p>
              <a href="${url}" style="display:inline-block;margin:24px 0;padding:14px 28px;background:#f59e0b;color:#1e1b4b;font-weight:bold;font-size:16px;text-decoration:none;border-radius:8px">Sign In to HerdOut</a>
              <p style="color:#9ca3af;font-size:14px">If you didn't request this, you can safely ignore this email.</p>
            </div>
          `,
        });
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: { strategy: "database", maxAge: 30 * 24 * 60 * 60 }, // 30 days
  callbacks: {
    session: async ({ session, user }) => {
      if (session.user) {
        (session.user as { id?: string }).id = user.id;
      }
      return session;
    },
    redirect: async ({ url, baseUrl }) => {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
  },
};
