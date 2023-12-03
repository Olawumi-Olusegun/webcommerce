
import ReviewForm from '@/app/components/ReviewForm'
import startDatabase from '@/app/libs/database';
import ReviewModel from '@/app/models/reviewModel';
import { auth } from '@/auth';
import { ObjectId, isValidObjectId } from 'mongoose';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import React from 'react'


interface Props {
  params: {
    productId: string;
  }
}

interface ProductReviewPopulate {
  productId: {
    title: string;
    thumbnail: { url: string }
  }
}



const fetchReview = async (productId: string) => {

  if(!isValidObjectId(productId)) {
    return redirect("/404");
  }

  const session = await auth();

  if(!session?.user) {
    return redirect("/auth/signin");
  }

  const userId = session.user.id;

  await startDatabase();


  const review = await ReviewModel.findOne({userId, productId}).populate<ProductReviewPopulate>({
    path: "productId",
    model: "Product",
    select: "title thumbnail.url"
  });



  if(review) {
    return {
      id: review._id.toString(),
      rating: review.rating,
      comment: review.comment,
      product: {
        title: review.productId.title,
        thumbnail: review.productId.thumbnail.url,
      }
    }
  }
}



export default async function Review({ params }: Props) {

  const { productId } = params;

  const review = await fetchReview(productId);


  if(!review) {
    return redirect('/');
  }

  const initialValues = review ? { 
    comment: review?.comment || "", 
    rating: review?.rating || 0
  } : undefined;

  return (
    <div className='p-4 space-y-4'> 
      
      <div className="flex items-center space-x-4">
        <Image 
        src={review?.product.thumbnail || ""}
        alt={review?.product?.title || "thumbnail"}
        width={50}
        height={50}
        className='rounded'
        />
        <h3>{review?.product.title}</h3>
      </div>

        <ReviewForm 
        productId={productId} 
        initialValue={initialValues}
        />

    </div>
  )
}
