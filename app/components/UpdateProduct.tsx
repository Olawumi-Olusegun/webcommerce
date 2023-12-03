"use client";

import React from 'react';
import ProductForm, { InitialValue } from './ProductForm';
import { NewProductInfo, ProductResponse, ProductToUpdate } from '../types';
import { removeAndUpdateProductImage, removeImageFromCloud, updateProduct } from '../(admin_route)/products/action';
import { updateProductInfoSchema } from '@utils/validationSchema';
import * as yup from 'yup'
import { toast } from 'react-toastify';
import { extractPublicId, uploadImage } from '../utils/helpers';
import { useRouter } from 'next/navigation';

interface UpdateProduct {
    product: ProductResponse;
}

const UpdateProduct = ({product}: UpdateProduct) => {
  const router = useRouter();
    const initialValue: InitialValue = {
        ...product,
        thumbnail: product?.thumbnail.url,
        images: product?.images?.map(({ url }) => url),
        mrp: product?.price?.base,
        salePrice: product?.price?.discounted,
        bulletPoints: product?.bulletPoints || [],
    }

const handleImageRemove = async (source: string) => {
  const publicId = extractPublicId(source);
  removeAndUpdateProductImage(product.id, publicId);
}


const handleSubmitProduct = async (values: NewProductInfo) => {
    
  const { thumbnail, images } = values;

  try {
    await updateProductInfoSchema.validate(values, { abortEarly: false });

    const dataToUpdate: ProductToUpdate = {
      title: values.title,
      description: values.description,
      category: values.category,
      quantity: values.quantity,
      price: {
        base: values.mrp,
        discounted: values.salePrice,
      }
    }
    
    if(thumbnail) {
      await removeImageFromCloud(product?.thumbnail?.id);
      const {id, url} = await uploadImage(thumbnail);
      dataToUpdate.thumbnail = { id, url }
    }

    if(images?.length) {
      const uploadPromise = images.map(async (imageFile) => {
        return await uploadImage(imageFile);
      });

      dataToUpdate.images = await Promise.all(uploadPromise);

    }

    updateProduct(product?.id, dataToUpdate);

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
        initialValue={initialValue}  
        onSubmit={handleSubmitProduct} 
        onImageRemove={handleImageRemove}
        />
    </div>
  )
}

export default UpdateProduct