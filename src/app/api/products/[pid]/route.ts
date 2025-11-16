import dbConnect from "@/lib/dbConnect";
import ProductModel from "@/lib/model/product";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    await dbConnect();
    const pid = req.nextUrl.pathname.split("/")[3];
    console.log("PID:", pid);
    const res = await ProductModel.find({_id: pid});
    return NextResponse.json({message: "Product retrieved successfully", product: res});
}


export async function PUT(req: NextRequest) {
    await dbConnect();
    const pid = req.nextUrl.pathname.split("/")[3];
    const body = await req.json();
    const res = await ProductModel.findOneAndUpdate({_id: pid}, body);
    return NextResponse.json({message: "Product updated successfully", product: res});
}


export async function DELETE(req: NextRequest) {
    await dbConnect();
    const pid = req.nextUrl.pathname.split("/")[3];
    const res = await ProductModel.findOneAndDelete({_id: pid});
    return NextResponse.json({message: "Product added successfully", products: res});
}
