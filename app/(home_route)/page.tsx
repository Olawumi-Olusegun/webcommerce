import startDatabase from '../libs/database'
import ProductModel from '../models/productModel';
import GridView from '../components/GridView';
import ProductCard from '../components/ProductCard';
import FeaturedProductsSlider from '../components/FeaturedProductsSlider';
import FeaturedProductModel from '../models/featuredProductModel';
import HorizontalMenu from '../components/HorizontalMenu';


interface LatestProduct {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  price: {
      base: number;
      discounted: number;
  };
  sale: number;
}


const fetchLatestProducts = async () => {

  const products = await ProductModel.find().sort("-createdAt").limit(20);

  const productList = products.map((product) => {
    return {
      id: product._id.toString(),
      title: product.title,
      description: product.description,
      category: product.category,
      thumbnail: product.thumbnail.url,
      price: product.price,
      sale: product.sale,
      rating: product.rating,
    };
  });

  return JSON.stringify(productList);
};

const fetchFeaturedProducts = async () => {
 
  const products = await FeaturedProductModel.find().sort("-createdAt");
 
  return products.map((product) => {
    return {
      id: product._id.toString(),
      title: product.title,
      banner: product.banner.url,
      link: product.link,
      linkTitle: product.linkTitle,
    };
  });
};


const fetchLastestProductsAndFeaturedProducts = async () => {
  await startDatabase();
// Featured product

  let featuredProducts = await fetchFeaturedProducts();

  // Latest products
  let latestProducts = await fetchLatestProducts();

  return { featuredProducts, latestProducts } 
}

export default async function Home() {

  const { featuredProducts, latestProducts }  = await fetchLastestProductsAndFeaturedProducts();
  
  const parsedProducts = JSON.parse(latestProducts) as LatestProduct[];

  return (
    <div className='py-4 space-y-4'>
      <FeaturedProductsSlider products={featuredProducts} />
      <HorizontalMenu />
      <GridView>
        { parsedProducts?.map((product) =>  <ProductCard key={product?.id} product={product} /> )
        }
      </GridView>
    </div>
  )
  
}
