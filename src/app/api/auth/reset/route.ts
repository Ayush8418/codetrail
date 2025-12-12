"use server";

import dbConnect from "@/lib/dbConnect";
import UserModel from "@/lib/model/User";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password: newPassword } = body;

    // ✅ Basic validation
    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Token and password are required." },
        { status: 400 }
      );
    }

    await dbConnect();

    // ✅ Find user by reset token
    const user = await UserModel.findOne({ forgotToken: token });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid reset token." },
        { status: 400 }
      );
    }

    // ✅ Check token expiry
    const now = new Date();
    if (!user.forgotTokenExp || user.forgotTokenExp < now) {
      return NextResponse.json(
        { success: false, message: "Reset token has expired." },
        { status: 400 }
      );
    }

    // ✅ Hash new password (CORRECT async usage)
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // ✅ Update user password + clear reset token
    await UserModel.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      forgotToken: "",
      forgotTokenExp: null,
    });

    // ✅ Success response
    return NextResponse.json(
      { success: true, message: "Password changed successfully." },
      { status: 200 }
    );

  } catch (error) {
    console.error("Reset password error:", error);

    return NextResponse.json(
      { success: false, message: "Server error while resetting password." },
      { status: 500 }
    );
  }
}
