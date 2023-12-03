import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AdminSidebar from '../components/AdminSidebar';

interface AdminProps {
    children: React.ReactNode;
}


export default async function AdminLayout({ children }: AdminProps) {
  
    const session = await auth();
    const user = session?.user;
    const isAdmin = user?.role === 'admin' ? true : false;

    if(!isAdmin) {
        return redirect("/auth/signin");
    }

  return (
    <>
    <AdminSidebar>
        {children}
    </AdminSidebar>
    </>
  )
}
