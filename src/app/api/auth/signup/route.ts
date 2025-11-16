import dbConnect from "@/lib/dbConnect";
import UserModel from "@/lib/model/User";
import { sendVerificationEmail } from "@/utils/sendmail";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Parse incoming JSON body
    const body = await req.json();
    const { username, email, password } = body;
    // Connect to DB
    await dbConnect();
    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return NextResponse.json({success: false, message: "Email already exists"});
    }
    // Hash password (await version — safer and simpler)
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await UserModel.create({username, email, password: hashedPassword});
    // Send verification email
    await sendVerificationEmail(newUser.email);
    // Respond success
    return NextResponse.json({ success: true, message: "User created & verification email sent"});
  }
  catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({
      success: false,
      message: "An unexpected error occurred.",
    });
  }
}
