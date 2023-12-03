import startDatabase from "@/app/libs/database";
import PasswordResetTokenModel from "@/app/models/passwordResetTokenModel";
import UserModel from "@/app/models/userModel";
import { ForgetPasswordRequest } from "@/app/types";
import { NextResponse } from "next/server";
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { sendMail } from "@/app/libs/email";



export const POST = async (req: Request) => {
    const { email } = (await req.json()) as ForgetPasswordRequest;

    if(!email) {
        return NextResponse.json({ error: "Invalid email" }, { status: 401 })
    }

    await startDatabase();

    try {

        const userExist = await UserModel.findOne({ email });

        if(!userExist) {
            return NextResponse.json({ error: "User does not exist" }, { status: 404 });
        }

        await PasswordResetTokenModel.deleteMany({ user: userExist?._id });

        const token  = crypto.randomBytes(36).toString("hex");

        await PasswordResetTokenModel.create({ token, user: userExist?._id });

        const passwordResetLink = `${process.env.PASSWORD_RESET_URL}?token=${token}&userId=${userExist?._id}`;

        await sendMail({ 
            profile: { name: userExist?.name, email: userExist?.email }, 
            subject: "forget-password",
            linkUrl: passwordResetLink
        });

        return NextResponse.json({ message: "Please check your email" });

    } catch (error) {
        return NextResponse.json({ error: (error as any)?.message }, { status: 500})
    }
}