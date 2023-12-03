import CartItems from '@/app/components/CartItems'
import startDatabase from '@/app/libs/database';
import CartModel from '@/app/models/cartModel';
import { auth } from '@/auth'
import { Types } from 'mongoose';
import { redirect } from 'next/navigation';
import React from 'react'


const fetchCartProducts = async () => {

    const session = await auth();

    if(!session.user) {
        return redirect("/");
    }

    try {
        await startDatabase();
       const [cartItems] = await CartModel.aggregate([
            { $match: { userId: new Types.ObjectId(session.user.id) } },
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "products",
                    foreignField: "_id",
                    localField: "items.productId",
                    as: "product"
                }
            },
            {
                $project: {
                    _id: 0,
                    id: { $toString: "$_id" },
                    totalQty: { $sum: "$items.quantity" },
                    products: {
                        id: { $toString: { $arrayElemAt: ["$product._id", 0] } },
                        thumbnail: { $arrayElemAt: ["$product.thumbnail", 0] },
                        title: { $arrayElemAt: ["$product.title", 0] },
                        price: { $arrayElemAt: ["$product.price.discounted", 0] },
                        qty: "$items.quantity",
                        totalPrice: {
                            $multiply: [
                                "$items.quantity",
                                { $arrayElemAt: ["$product.price.discounted", 0] },
                            ]
                        }
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    id: { $first: "$id" },
                    totalQty: { $sum: "$totalQty"},
                    totalPrice: { $sum: "$totalPrice"},
                    products: {$push: "$products"},
                }
            },
            {
                $project: {
                    _id: 0,
                    id: 1,
                    totalQty: 1,
                    totalPrice: 1,
                    products: 1,
                }
            }
        ]);

        return cartItems;
    } catch (error) {
        
    }
}

export default async function Cart() {

    const cart = await fetchCartProducts();

    if(!cart) {
        return (
            <div className='text-center py-5 px-2'>
                <h3>No item(s) in cart</h3>
                <hr />
            </div>
        )
    }

  return (
    <>
        <CartItems
        cartId={cart.id}
        products={cart.products}
        cartTotal={cart.totalPrice}
        totalQty={cart.totalQty}
        />
    </>
  )
}
