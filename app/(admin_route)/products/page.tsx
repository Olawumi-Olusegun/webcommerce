import React from 'react';
import ProductTable, { Product } from '@/app/components/ProductTable';
import startDatabase from '@/app/libs/database';
import ProductModel from '@/app/models/productModel';

const fetchProduct  = async (pageNo: number, perPage: number): Promise<Product[]> => {
  
  const skipCount = (pageNo - 1) * perPage;

  await startDatabase();

    const products = await ProductModel.find().sort('-createdAt').skip(skipCount).limit(perPage);
  
    return products.map((product) => {
        return {
          id: product._id.toString(),
          title: product.title,
          description: product.description,
          // bulletPoints: product.bulletPoints,
          // images: product.images,
          thumbnail: product.thumbnail.url,
          price: {
            mrp: product?.price?.base,
            salePrice: product?.price?.discounted,
            saleOff: product.sale,
          },
          quantity: product.quantity,
          category: product?.category,
      }
    });

}


export default async function Products () {

  const products = await fetchProduct(1, 5);

  console.log({products})

  return (
    <>
      <ProductTable 
      currentPageNo={1} 
      products={products} 
      />
    </>
  )
}