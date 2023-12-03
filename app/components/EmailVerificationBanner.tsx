"use client"

import React, { useState } from 'react'
import { toast } from 'react-toastify';

interface Props {
    id?: string;
    verified: boolean;
}

export default function EmailVerificationBanner({id, verified}: Props) {

    const [submitting, setSubmitting] = useState(false);

    const applyForVerification = async () => {
        if(!id) return;

        setSubmitting(true)

        const response = await fetch(`/api/users/verify?userId=${id}`, {
            method: "GET",
        });

        const { message, error } = await response.json();

        if(!response.ok && error) {
            toast.error(error);
        }

        toast.success(message);

        setSubmitting(false)

    }

    if(verified) return null;


  return (
    <div className='p-2 text-center bg-blue-50'>
        <span>It looks like your haven't verified your email</span>
        <button 
        disabled={submitting} 
        onClick={applyForVerification} 
        className='ml-2 font-semibold underline'>
            { submitting ? "Generating link..." : "Get verification link"}
        </button>
    </div>
  )
}
