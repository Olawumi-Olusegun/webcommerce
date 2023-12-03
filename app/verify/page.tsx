"use client"

import React, { useEffect } from 'react'
import { notFound, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

interface Props {
    searchParams: {
        token: string;
        userId: string;
    }
}

export default function Verify(props: Props) {

    const router = useRouter();

    const { token, userId } = props.searchParams;

    if(!token || !userId) return notFound();

    useEffect(() => {
        fetch('/api/verify', {
            method: "POST",
            body: JSON.stringify({token, userId}),
            headers: {
                "Content-Type": "application/json",
            }
        }).then(async (response) => {
            const apiRes = await response.json();
            const {error, message } = apiRes as { message: string; error: string }
            if(response.ok) {
                toast.success(message)
                router.replace("/")
            }

            if(!response.ok && error) {
                toast.error(error);
            }
        } )
    }, []);

  return (
    <div className='text-3xl text-center opacity-70 p-5 animate-pulse'>
        Please wait...
        <p>We are verifying your email</p>
    </div>
  )
}
