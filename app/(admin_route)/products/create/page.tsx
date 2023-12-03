"use client"

import React from 'react'
import ProductForm from '@/app/components/ProductForm'
import { NewProductInfo } from '@/app/types'
import { NewProductInfoSchema } from '@/app/utils/validationSchema'
import * as yup from 'yup'
import { toast } from 'react-toastify'
import { uploadImage } from '@/app/utils/helpers'
import { createProduct } from '../action'
import { useRouter } from 'next/navigation'


const CreateProduct = () => {
  const router = useRouter();

  const handleCreateProduct = async (values: NewProductInfo) => {
    
    const { thumbnail, images } = values;

    try {
      await NewProductInfoSchema.validate(values, { abortEarly: false });
      const thumbnailRes = await uploadImage(thumbnail!);
      
      let productImages: { id: string, url: string }[] = [];

      if(images) {
        const uploadPromise  = images?.map(async (imageFile) => {
          const {id, url } = await uploadImage(imageFile);
          return { id, url }
        });

        productImages = await Promise.all(uploadPromise);

      }

      await createProduct({
        ...values,
        price: {
          base: values.mrp,
          discounted: values.salePrice,
        },
        thumbnail: thumbnailRes,
        images: productImages,
      });

      router.refresh();
      router.push("/products");

    } catch (error) {
        if(error instanceof yup.ValidationError) {
          error?.inner?.map((errorItem) => {
            toast.error(errorItem.message)
          });

        }
    }
  }

  return (
    <div>
        <ProductForm 
        onSubmit={handleCreateProduct}
        onImageRemove={() => {}}
        />
    </div>
  )
}

export default CreateProduct