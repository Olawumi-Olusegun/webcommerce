import FeaturedProductForm from '@/app/components/FeaturedProductForm'
import FeaturedProductTable from '@/app/components/FeaturedProductTable';
import startDatabase from '@/app/libs/database';
import FeaturedProductModel from '@/app/models/featuredProductModel';
import React from 'react'



const fetchFeaturedProduct = async () => {
  try {
    await startDatabase();
    const featuredProducts = await FeaturedProductModel.find();

    return featuredProducts.map((product) => {
      return {
        id: product._id.toString(),
        title: product.title,
        link: product.link,
        linkTitle: product.linkTitle,
        banner: product.banner.url,
      }
    })
  } catch (error) {
    
  }
}



const AddFeaturedProduct = async () => {
 const featuredProducts = await fetchFeaturedProduct();

 if(!featuredProducts) return;

  return (
    <div>
        <FeaturedProductForm />
        <FeaturedProductTable products={featuredProducts} />
    </div>
  )
}


export default AddFeaturedProduct;