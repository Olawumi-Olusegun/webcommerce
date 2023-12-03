import React from 'react'
import ProductView from '@/app/components/ProductView';
import startDatabase from '@/app/libs/database';
import ProductModel from '@/app/models/productModel';
import { ObjectId, isValidObjectId } from 'mongoose';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import ReviewModel from '@/app/models/reviewModel';
import ReviewsList from '@/app/components/ReviewsList';


interface Product {
    params: {
        product: string;
    }
}

interface UserReviewPopulate {
    userId: {
      _id: ObjectId,
      name: string;
      avatar: { url: string }
    }
  }

const fetchProduct = async (productId: string) => {
    if(!isValidObjectId(productId)) {
        return redirect("/404");
    }
    
    await startDatabase();

    try {

        const product = await ProductModel.findById(productId);

        if(!product) {
            return redirect("/404");
        }

        return JSON.stringify({
            id: product._id.toString(),
            title: product.title,
            description: product.description,
            thumbnail: product.thumbnail?.url,
            images: product.images?.map((image) => image?.url),
            bulletPoints: product.bulletPoints,
            price: product.price,
            sale: product.sale,
            rating: product.rating,
        });

    } catch (error) {
        
    }
}

const fetchProductReviews = async (productId: string) => {

    if(!isValidObjectId(productId)) {
      return redirect("/404");
    }
  
    await startDatabase();
  
  
    const reviews = await ReviewModel.find({productId}).populate<UserReviewPopulate>({
      path: "userId",
      model: "User",
      select: "_id name avatar.url"
    });
  
    const result = reviews.map((review) => {
      return {
        id: review._id.toString(),
        rating: review.rating,
        comment: review.comment,
        date: review.createdAt,
        user: {
          id: review.userId._id.toString(),
          title: review.userId.name,
          thumbnail: review.userId.avatar.url,
        }
      }
    });
  
  
    return JSON.stringify(result);
  }

export default async function Product({params}: Product) {
    const { product } = params;
    const productId = product[1];

    const productInfo = JSON.parse(await fetchProduct(productId) as string);

    
  const reviewResult = await fetchProductReviews(productId);
  const reviews = JSON.parse(reviewResult);

    let productImages = [productInfo.thumbnail];

    if(productInfo.images) {
        productImages = productImages.concat(productInfo.images);
    }

  return (
    <div className='p-4'>
        <ProductView 
         title={productInfo.title}
         description={productInfo.description}
         images={productInfo.images}
         price={productInfo.price}
         sale={productInfo.sale}
         points={productInfo.bulletPoints}
         rating={productInfo.rating}
        />

        <div className='py-4 space-y-4'>
            <div className="flex items-center justify-between">
                <h1 className='text-2xl font-semibold mb-2'>Reviews</h1>
                <Link href={`/add-review/${productInfo.id}`}>Add Reviews</Link>
            </div>
         <ReviewsList reviews={reviews} />

        </div>
        </div>

  )
}
