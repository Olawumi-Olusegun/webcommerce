import React from 'react'
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Navbar from '../components/navbar';


interface Props {
    children: React.ReactNode;
}

export default async function GuestLayout({ children}: Props) {
   
   const session = await auth();

   if(session) {
    return redirect("/");
   }

   return <>
    <Navbar />
    {children}
    </>
}
