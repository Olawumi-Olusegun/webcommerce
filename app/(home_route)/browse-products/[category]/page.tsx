import GridView from "@/app/components/GridView";
import HorizontalMenu from "@/app/components/HorizontalMenu";
import ProductCard from "@/app/components/ProductCard";
import startDatabase from "@/app/libs/database";
import ProductModel from "@/app/models/productModel";



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

interface Props  {
    params: {
        category: string;
    }
}

const fetchProductByCategory = async (category: string) => {
  await startDatabase();
  const products = await ProductModel.find({category}).sort("-createdAt").limit(20);

  const productList = products.map((product) => {
    return {
      id: product._id.toString(),
      title: product.title,
      description: product.description,
      category: product.category,
      thumbnail: product.thumbnail.url,
      price: product.price,
      sale: product.sale,
      // rating: product.rating,
    };
  });

  return JSON.stringify(productList);
};



export default async function ProductByCategory({ params }: Props) {

    const category = decodeURIComponent(params.category);

  const latestProducts = await fetchProductByCategory(category);
  const parsedProducts = JSON.parse(latestProducts) as LatestProduct[];


  return (
    <div className='py-4 space-y-4'>
      <HorizontalMenu />
      {
        parsedProducts.length > 0 ?
        (
        <GridView>
            { parsedProducts?.map((product) =>  <ProductCard key={product?.id} product={product} /> )
            }
        </GridView>
        )
        : <> <h1 className="text-center pt-10 font-semibold text-2xl opacity-40 ">Sorry, their are no products in this category</h1> </>
      }

    </div>
  )
  
}
