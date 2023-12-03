
'use server';

import { v2 as cloudinary } from 'cloudinary';
import startDatabase from '@/app/libs/database';
import ProductModel, { NewProduct } from '@/app/models/productModel';
import { ProductToUpdate } from '@/app/types';

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
    secure: true,
});

export const getCloudConfig = async () => {
    return {
        name: process.env.CLOUD_NAME,
        key: process.env.CLOUD_API_KEY,
    }
}

// generate cloud storage
export const getCloudSignature = async () => {
    const secret = cloudinary.config().api_secret as string;
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request({
        timestamp
    }, secret);

    return { timestamp, signature}
}


//create Product
export const createProduct = async (productData: NewProduct) => {
    await startDatabase();
    try {
       await ProductModel.create({...productData});
    } catch (error) {
        throw new Error("Something went wrong, cannot create new product");
    }
}

//Remove image from cloudinary
export const removeImageFromCloud = async (publicId: string) => {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        throw new Error("Unable to delete image");
    }
}

//Remove and update product inage
export const removeAndUpdateProductImage = async (productId: string, publicId: string) => {
    try {
        const response = await cloudinary.uploader.destroy(publicId);

        if(response.ok) {
            await startDatabase();

            const product = await ProductModel.findById(productId, {
                $pull: {
                    images: { id: publicId }
                }
            }, { new: true });

        }

    } catch (error) {
        throw new Error("Error removing and updating product");
    }
}

//Update Product
export const updateProduct = async (productId: string, productInfo: ProductToUpdate) => {

    try {

        await startDatabase();

        let newImageUpdates: typeof productInfo.images = [];

        if(productInfo?.images) {
            newImageUpdates = productInfo?.images;
        }

        delete productInfo.images;

        await ProductModel.findByIdAndUpdate(productId, {
            ...productInfo,
            $push: { images: newImageUpdates}
        }, { new: true });

    } catch (error) {
        throw error;
    }
}