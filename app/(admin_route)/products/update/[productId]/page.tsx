import UpdateProduct from '@/app/components/UpdateProduct';
import startDatabase from '@/app/libs/database';
import ProductModel from '@/app/models/productModel';
import { ProductResponse } from '@/app/types';
import { isValidObjectId } from 'mongoose';
import { redirect } from 'next/navigation';
import React from 'react'

interface Props {
    params: {
        productId: string;
    }
}

const fetchProductInfo = async (productId: string): Promise<string> => {

    if(!isValidObjectId(productId)){
        return redirect("/404");
    }

     await startDatabase();

        const product = await ProductModel.findById(productId);

        if(!product) {
            return redirect("/404");
        }

        const finalProduct: ProductResponse = {
            id: product?._id?.toString(),
            title: product?.title,
            description: product?.description,
            bulletPoints: product?.bulletPoints,
            thumbnail: product?.thumbnail,
            images: product?.images?.map(({ url, id }) => ({url, id })),
            price: product?.price,
            quantity: product?.quantity,
            category: product?.category,
        }

        return JSON.stringify(finalProduct);
        
}

export default async function UpdateProductPage(props: Props) {

    const { productId } = props.params;

    const product = await fetchProductInfo(productId);

    return <UpdateProduct product={JSON.parse(product)} />
}
