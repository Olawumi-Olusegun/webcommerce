"use server";

import startDatabase from "@/app/libs/database";
import FeaturedProductModel from "@/app/models/featuredProductModel";
import { FeaturedProductForUpdate, NewFeaturedProduct } from "@/app/types";
import { removeImageFromCloud } from "../action";


export const createFeaturedProduct = async (info: NewFeaturedProduct) => {

    try {
        await startDatabase();
        await FeaturedProductModel.create({...info})
    } catch (error) {
        throw error;
    }
}

export const updateFeaturedProduct = async (featuredId: string, info: FeaturedProductForUpdate) => {

    try {
        await startDatabase();
        await FeaturedProductModel.findByIdAndUpdate(featuredId, {...info});
    } catch (error) {
        throw error;
    }
}

export const deleteFeaturedProduct = async (featuredId: string) => {

    try {
        
        await startDatabase();
        const featuredProduct = await FeaturedProductModel.findByIdAndDelete(featuredId);
    
       if(featuredProduct) {
        removeImageFromCloud(featuredProduct.banner.id)
    }

    } catch (error) {
        throw error;
    }
}