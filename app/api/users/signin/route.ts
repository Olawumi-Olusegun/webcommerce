import { NextResponse } from 'next/server'
import UserModel from "@/app/models/userModel";
import { SignInCredentials } from "@/app/types"
import startDatabase from '@/app/libs/database';


export const POST = async (req: Request) => {

    const {email, password} = await req.json() as SignInCredentials;
  
    if(!email || !password) {
        return NextResponse.json({ error: "Invalid request, email/password missing"});  
    }

    await startDatabase();

    try {

        const user = await UserModel.findOne({ email });

        if(!user) {
            return NextResponse.json({ error: "Email/Password mis-match"});   
        }

        const passwordMatch = await user.comparePassword(password);

        if(!passwordMatch) {
            return NextResponse.json({ error: "Email/Password mis-match"}); 
        }

        return NextResponse.json({
            user: {
            id: user?._id.toString(),
            name: user?.name,
            email: user?.email,
            role: user?.role,
            avatar: user?.avatar?.url,
            verified: user?.verified
         }});

    } catch (error) {
        return NextResponse.json({ error: (error as any)?.message }, { status: 500});
    }
}