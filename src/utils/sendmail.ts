"use server";

import { Resend } from "resend";
import { randomBytes } from "crypto";
import UserModel from "@/lib/model/User";
import dbConnect from "@/lib/dbConnect";

const resend = new Resend(process.env.RESEND_API_KEY || "");

/**
 * Unified response format
 */
interface MailResponse {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * Send password reset email
 */
export async function sendResetEmail(to: string): Promise<boolean> {
  const token = randomBytes(32).toString("hex");

  try {
    await dbConnect();

    const now = new Date();
    const expire = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes expiry

    const user = await UserModel.findOneAndUpdate(
      { email: to.toLowerCase() },
      { forgotToken: token, forgotTokenExp: expire },
      { new: true }
    );

    if (!user) {
      console.warn(`[sendResetEmail] No user found with email: ${to}`);
      return false;
    }

    const recoveryLink = `${process.env.DOMAIN_URL}/auth/reset?token=${token}`;

    const { error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: "harshweather2712@gmail.com",
      subject: "Password Reset",
      html: `
        <h1>Password Reset</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${recoveryLink}" target="_blank" rel="noopener noreferrer">
          Reset Password
        </a>
        <p>This link will expire in 10 minutes.</p>
      `,
    });

    if (error) {
      console.error("[Resend API Error]:", error);
      return false;
    }

    console.log(`[sendResetEmail] Reset email sent to ${to}`);
    return true;
  } catch (err: any) {
    console.error("[sendResetEmail] Exception:", err.message || err);
    return false;
  }
}

/**
 * Send email verification link
 */
export async function sendVerificationEmail(to: string): Promise<boolean> {
  const token = randomBytes(32).toString("hex");

  try {
    await dbConnect();

    const now = new Date();
    const expire = new Date(now.getTime() + 10 * 60 * 1000);

    const user = await UserModel.findOneAndUpdate(
      { email: to.toLowerCase() },
      { verifyToken: token, verifyTokenExp: expire },
      { new: true }
    );

    if (!user) {
      console.warn(`[sendVerificationEmail] No user found with email: ${to}`);
      return false;
    }

    const verifyLink = `${process.env.DOMAIN_URL}/api/auth/verify?token=${token}`;


    const { error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: "harshweather2712@gmail.com",
      subject: "Verify Your Email",
      html: `
        <h1>Email Verification</h1>
        <p>Click the link below to verify your email address:</p>
        <a href="${verifyLink}" target="_blank" rel="noopener noreferrer">
          Verify Email
        </a>
        <p>This link will expire in 10 minutes.</p>
      `,
    });

    if (error) {
      console.error("[Resend API Error]:", error);
      return false;
    }

    console.log(`[sendVerificationEmail] Verification email sent to ${to}`);
    return true;
  } catch (err: any) {
    console.error("[sendVerificationEmail] Exception:", err.message || err);
    return false;
  }
}
