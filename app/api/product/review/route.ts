import startDatabase from "@/app/libs/database";
import ProductModel from "@/app/models/productModel";
import ReviewModel from "@/app/models/reviewModel";
import { ReviewRequestBody } from "@/app/types";
import { auth } from "@/auth"
import { Types, isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";

const updateProductRating = async (productId: string) => {
    const [result] = await ReviewModel.aggregate([
        {$match: { productId: new Types.ObjectId(productId) } },
        {
            $group: {
                _id: null,
                averageRating: { $avg: "$rating" },
            }
        }
    ]);

    if(result?.averageRating) {
        await ProductModel.findByIdAndUpdate(productId, {rating: result.averageRating})
    }
} 

export const POST = async (req: Request) => {
    try {

        const session = await auth();
        if(!session.user) {
            return NextResponse.json({error: "Unauthorized request"}, { status: 401});
        }

        const {productId, comment, rating } = await req.json() as ReviewRequestBody;

        if(!isValidObjectId(productId)) {
            return NextResponse.json({error: "Unauthorized request"}, { status: 401});
        }

        if(rating <= 0 || rating > 5) {
            return NextResponse.json({error: "Invalid rating"}, { status: 401});
        }

        await startDatabase();

        const userId = session.user.id;

         await ReviewModel.findByIdAndUpdate({userId, productId}, 
            {   userId,
                productId,
                comment,
                rating
            }, {upsert: true});

         await updateProductRating(productId);
        
        return NextResponse.json({success: true}, { status: 201});

    } catch (error) {
        return NextResponse.json({error:  (error as any).message }, { status: 401});
    }
}