import { auth } from "@/auth";
import startDatabase from "@/app/libs/database";
import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server"
import OrderModel from "@/app/models/orderModel";

const validStatus = ["delivered", "ordered", "shipped"];

export const POST = async (req: Request) => {
    try {

        const session = await auth();

        const user = session?.user;
        
        if(user?.role !== 'admin' ) {
            return NextResponse.json({error: "Unathorized request" }, { status: 401});
        }

        const { userId, deliveryStatus } = await req.json();

        if(!isValidObjectId(userId) || !validStatus.includes(deliveryStatus)) {
            return NextResponse.json({error: "Invalid userId" }, { status: 401});
        }

        await startDatabase();

        await OrderModel.findByIdAndUpdate(userId, { deliveryStatus })

        return NextResponse.json({success: true}, { status: 200});
    } catch (error) {
        return NextResponse.json({error: (error as any).message }, { status: 505});
    }
}