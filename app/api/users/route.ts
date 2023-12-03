import { NextResponse } from "next/server";
import startDatabase from "@/app/libs/database";
import UserModel from "@/app/models/userModel";
import { NewUserRequest } from "@/app/types";
import EmailVerificationToken from "@/app/models/emailVerificationToken";
import crypto from 'crypto'
import { sendMail } from "@/app/libs/email";

export const POST = async (req: Request) => {

    await startDatabase();
    
    
    try {

        const { name, email, password } = await req.json() as NewUserRequest;

        const existingUser = await UserModel.findOne({ email });

        if(existingUser) {
            return NextResponse.json({ ok: true, message: "User already exist" });
        }

        const newUser = await UserModel.create({ name, email, password });

        const token = crypto.randomBytes(36).toString("hex");

        await EmailVerificationToken.create({
            user: newUser?._id.toString(),
            token,
        });

          const verificationUrl = `${process.env.BASE_URL}/verify?token=${token}&userId=${newUser?._id}`;

          await sendMail({ 
            profile: { name: newUser?.name, email: newUser?.email }, 
            subject: "verification",
            linkUrl: verificationUrl
        });

        
        return NextResponse.json({ message: "Please check your email" });

    } catch (error) {
       
        return NextResponse.json({ ok: false, error: (error as any)?.message },  {status: 500});
    }
}