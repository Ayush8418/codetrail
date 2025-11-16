import dbConnect from "@/lib/dbConnect";
import ProductModel from "@/lib/model/product";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
    await dbConnect();
    const body = await req.json();
    const res = await ProductModel.create(body);
    return NextResponse.json({message: "Product added successfully", product: res});
}


export async function GET(req: NextRequest) {
    await dbConnect();
    const res = await ProductModel.find();
    return NextResponse.json({message: "Product added successfully", products: res});
}
