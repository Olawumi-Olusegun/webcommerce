"use client";
import React from 'react'
import { signOut } from 'next-auth/react';

interface Props {
    children: React.ReactNode;
}

export default function SignOutButton({ children }: Props) {

  const handleSignOut = async () => await signOut();

  return (
    <div onClick={ async () => {
      await signOut()
    } }>
        {children}
    </div>
  )
}
