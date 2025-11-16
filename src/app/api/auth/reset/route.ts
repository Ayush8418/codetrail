"use server"
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/lib/model/User";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest){
    const body = await req.json();
    const token = body.token;
    const newPassword = body.password;
    // console.log(token, "----------", newPassword);
    try{
        await dbConnect();
        const user = await UserModel.findOne({forgotToken: token});
        // console.log(user);
        if(user){
            const now = new Date();
            if(user.forgotTokenExp! > now){
                bcrypt.hash(newPassword, 10, async function(err, hash) {
                    if(hash){
                        // console.log(hash);
                        const newUser = await UserModel.findByIdAndUpdate(user._id, {password: hash, forgotToken: ""}, {new: true});
                        return NextResponse.json({success: true, message: "Password Changed.",user: newUser});
                    }
                });
            }
        }
        return NextResponse.json({success: false});
    }catch(error){
        console.error("Reset password error:", error);
        return NextResponse.json({success: false, message: "An unexpected error occurred."});
    }
}