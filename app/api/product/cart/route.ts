import startDatabase from "@/app/libs/database";
import CartModel from "@/app/models/cartModel";
import { NewCartRequest } from "@/app/types";
import { auth } from "@/auth";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export default async function POST(req: NextRequest) {

    try {
        const session = await auth();
    
        if(!session.user) {
            return NextResponse.json("Unauthorized request", {status: 401});
        }
    
        const user = session.user;
    
        const { productId, quantity } = await req.json() as NewCartRequest;

        if(!isValidObjectId(productId) || isNaN(quantity)) {
            return NextResponse.json("Invalid request", {status: 401});
        }
    
        await startDatabase();

        const cart = await CartModel.findOne({ userId: user.id });

        if(!cart) {
            // Create new cart if user doesn't have an item in cart yet
             await CartModel.create({ 
                userId: user.id,
                items: [{productId, quantity}]
             });

             return NextResponse.json({success: true}, { status: 200});
        }

    const existingCartItem = cart.items.find((item) => item.productId.toString() === productId);

    if(existingCartItem) {
        // update quantity if item already exist
        existingCartItem.quantity += Number(quantity);
        
        if(existingCartItem.quantity <= 0) {
            // remove item (product) if quantity becomes zero
            cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
        }

    } else {
        cart.items.push({ productId: productId as any, quantity });
    }

    await cart.save();

    return NextResponse.json({success: true}, { status: 200});

    } catch (error) {
        return NextResponse.json({error: (error as any) }, { status: 500});
    }
}