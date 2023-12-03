import { NextResponse } from "next/server";
import EmailVerificationToken from "@/app/models/emailVerificationToken";
import UserModel from "@/app/models/userModel";
import { EmailVerifyRequest } from "@/app/types";
import { isValidObjectId } from "mongoose";
import startDatabase from "@/app/libs/database";
import { sendMail } from "@/app/libs/email";
import crypto from 'crypto'

export const POST = async (req: Request) => {
    await startDatabase();
    try {

        const { token, userId } = await req.json() as EmailVerifyRequest;

        if(!isValidObjectId(userId) || !token) {
            return NextResponse.json({error: 'Invalid request, userId/token is required!',},
                                    { status: 401});
        }

       const verifyToken = await EmailVerificationToken.findOne({ user: userId });

        if(!verifyToken) {
            return NextResponse.json({error: 'Invalid request, Token not found',},
            { status: 401}); 
        }

        const isValidToken = await verifyToken.compareToken(token);

        if(!isValidToken) {
            return NextResponse.json({error: 'Invalid token!',},
            { status: 401}); 
        }

        await UserModel.findByIdAndUpdate(userId, {$set: { verified: true }});

        await EmailVerificationToken.findByIdAndDelete(verifyToken?._id);

        return NextResponse.json({ message: "Your email is verified" });
    } catch (error) {
        return NextResponse.json({ error: "Could not verify email, something went wrong!"}, 
        {status: 500});
    }
}

export const GET = async (req: Request) => {
    startDatabase();
    try {

        const userId = req.url.split("?userId=")[1];

        if(!userId || !isValidObjectId(userId)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 401});
        }

        const userExist = await UserModel.findById(userId);

        if(!userExist) {
            return NextResponse.json({ error: "Invalid request, user not found" }, { status: 404}); 
        }

        if(userExist?.verified) {
            return NextResponse.json({ error: "Invalid request, user already verified" }, { status: 404}); 
        }

        const token = crypto.randomBytes(36).toString("hex");

        await EmailVerificationToken.deleteMany({ user: userId });

        await EmailVerificationToken.create({
            user: userId,
            token,
        });

          const verificationUrl = `${process.env.BASE_URL}/verify?token=${token}&userId=${userExist?._id}`;

          await sendMail({ 
            profile: { name: userExist?.name, email: userExist?.email }, 
            subject: "verification",
            linkUrl: verificationUrl
        });


        return NextResponse.json({ message: "Please check your email" });
    } catch (error) {
        return NextResponse.json({ error: "Could not verify email, something went wrong!"}, 
        {status: 500});
    }
}