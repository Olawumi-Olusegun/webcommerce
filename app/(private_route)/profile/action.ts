"use server";

import startDatabase from "@/app/libs/database";
import UserModel from "@/app/models/userModel";
import { UserProfileToUpdate } from "@/app/types";

export const updateUserProfile = async (info: UserProfileToUpdate) => {
    try {
        await startDatabase();
        await UserModel.findByIdAndUpdate(info.id, {
            name: info.name,
            avatar: info.avatar,
        });
    } catch (error) {
        throw error;
    }
}