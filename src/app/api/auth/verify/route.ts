import dbConnect from "@/lib/dbConnect";
import UserModel from "@/lib/model/User";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest){
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if(token){
        await dbConnect();
        const user = await UserModel.findOne({verifyToken: token});
        const now = new Date();
        if(user && user.verifyTokenExp! > now){
            const newUser = await UserModel.findByIdAndUpdate(user._id, {verifyToken:"", emailVerified: true}, {new: true});
            return NextResponse.redirect(new URL("/", process.env.NEXTAUTH_URL));
        }
        return new NextResponse(
            `<!DOCTYPE html>
            <html>
                <body style="background:black; text-align:center; font-family:sans-serif; padding-top:100px;">
                <h1 style="color:#d9534f;">Email verification link expired😱</h1>
                <p style="color:pink">Dont Worry!!! Go to the profile and verify the email again</P>
                </body>
            </html>`,
            {
                status: 400,
                headers: { "Content-Type": "text/html; charset=utf-8" },
            }
        );
    }
    return new NextResponse(
        `<!DOCTYPE html>
        <html>
            <body style="background:#fafafa; text-align:center; font-family:sans-serif; padding-top:100px;">
            <h1 style="color:#d9534f;">Email verification failed🥲</h1>
            <p style="color:pink;">Dont Worry!!! Go to the profile and verify the email again</P>
            </body>
        </html>`,
        {
            status: 400,
            headers: { "Content-Type": "text/html; charset=utf-8" },
        }
    );
}