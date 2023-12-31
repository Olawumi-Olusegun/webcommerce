import EmailVerificationBanner from "@/app/components/EmailVerificationBanner";
import ProfileForm from "@/app/components/ProfileForm";
import { fetchUserProfile } from "@/app/components/navbar";
import Link from "next/link";
import React from "react";



export default async function Profile() {
  const profile = await fetchUserProfile();

  return (
    <div>
       <EmailVerificationBanner verified={profile.verified} id={profile.id} />
      <div className="flex py-4 space-y-4">
        <div className="border-r border-gray-700 p-4 space-y-4">
          <ProfileForm
            id={profile.id}
            email={profile.email}
            name={profile.name}
            avatar={profile.avatar}
          />
        </div>

        <div className="p-4 flex-1">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold uppercase opacity-70 mb-4">
              Your recent orders
            </h1>
            <Link href="/profile/orders" className="uppercase hover:underline">
              See all orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
