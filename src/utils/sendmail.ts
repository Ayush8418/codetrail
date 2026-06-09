"use server";

import nodemailer from "nodemailer";
import { randomBytes } from "crypto";
import UserModel from "@/lib/model/User";
import dbConnect from "@/lib/dbConnect";

/**
 * Reusable Nodemailer transporter
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true", // true for port 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

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

    await transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME || "Support"}" <${process.env.SMTP_USER}>`,
      to, // ✅ sends to the actual user's email
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

    await transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME || "Support"}" <${process.env.SMTP_USER}>`,
      to, // ✅ sends to the actual user's email
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

    console.log(`[sendVerificationEmail] Verification email sent to ${to}`);
    return true;
  } catch (err: any) {
    console.error("[sendVerificationEmail] Exception:", err.message || err);
    return false;
  }
}