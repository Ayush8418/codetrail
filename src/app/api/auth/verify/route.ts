import dbConnect from "@/lib/dbConnect";
import UserModel from "@/lib/model/User";
import { NextRequest, NextResponse } from "next/server";

function htmlResponse(title: string, message: string) {
  return new NextResponse(
    `
    <!DOCTYPE html>
    <html>
      <body style="
        background:black; 
        text-align:center; 
        font-family:sans-serif; 
        padding-top:100px;
      ">
        <h1 style="color:#d9534f;">${title}</h1>
        <p style="color:pink;">${message}</p>
      </body>
    </html>
    `,
    {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    }
  );
}

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("token");

  if (!token) {
    return htmlResponse(
      "Email verification failed 🥲",
      "Don't worry! Go to your profile and request verification again."
    );
  }

  await dbConnect();
  const user = await UserModel.findOne({ verifyToken: token });

  const now = new Date();

  if (user && user.verifyTokenExp && user.verifyTokenExp > now) {
    await UserModel.findByIdAndUpdate(
      user._id,
      { verifyToken: "", emailVerified: true },
      { new: true }
    );

    const redirectUrl = process.env.NEXTAUTH_URL;
    return NextResponse.redirect(new URL("/auth/signin", redirectUrl));
  }

  return htmlResponse(
    "Email verification link expired 😱",
    "Don't worry! Go to your profile and request verification again."
  );
}
