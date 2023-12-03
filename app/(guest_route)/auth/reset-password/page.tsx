import UpdatePassword from '@/app/components/UpdatePassword';
import startDatabase from '@/app/libs/database';
import PasswordResetTokenModel from '@/app/models/passwordResetTokenModel';
import { redirect } from 'next/navigation';
import React from 'react'

interface Props {
    searchParams: {
        token: string;
        userId: string;
    }
}

const fetchTokenValidation = async (token: string, userId: string) => {
    
    await startDatabase();

        try {
            const resetToken = await PasswordResetTokenModel.findOne({ user: userId});

            if(!resetToken) return null;

            const isValidToken = await resetToken.compareToken(token);

            if(!isValidToken) return null;

            return true;

        } catch (error) {
            
        }
}

const ResetPassword = async ({ searchParams }: Props) => {

    const { token, userId } = searchParams;

    if(!token || !userId) return redirect('/404');

    const isValid = await fetchTokenValidation(token, userId);

    if(!isValid ) return redirect('/404');

    return <UpdatePassword token={token} userId={userId} />
}

export default ResetPassword;