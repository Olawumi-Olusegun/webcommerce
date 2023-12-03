import React from 'react'
import { isValidObjectId } from 'mongoose';
import { redirect } from 'next/navigation';
import startDatabase from '@/app/libs/database';
import FeaturedProductModel from '@/app/models/featuredProductModel';
import FeaturedProductForm from '@/app/components/FeaturedProductForm';

interface Props {
    params: { featuredId: string; }
}


const fetchFeaturedProduct = async (featuredId: string) => {

    if(!isValidObjectId(featuredId)) return redirect("/404");

    try {
        await startDatabase();
        const featuredProduct = await FeaturedProductModel.findById(featuredId);
        if(!featuredProduct) {
            return redirect("/404");
        }
        return {
            id: featuredProduct._id.toString(),
            banner: featuredProduct.banner.url,
            title: featuredProduct.title,
            link: featuredProduct.link,
            linkTitle: featuredProduct.linkTitle,
        }
    } catch (error) {
        
    }
}

export default async function UpdateFeaturedProduct({params}: Props) {
   
    const { featuredId } = params;

    const featuredProduct = await fetchFeaturedProduct(featuredId);

    if(!featuredProduct) return;

  return (
    <div>
        <FeaturedProductForm initialValue={featuredProduct} />
    </div>
  )
}
