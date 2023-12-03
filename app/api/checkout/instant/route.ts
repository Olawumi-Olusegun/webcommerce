import ProductModel from '@/app/models/productModel';
import { auth } from '@/auth';
import { isValidObjectId } from 'mongoose';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2023-10-16",
});


export const POST = async (req: Request) => {
    try {

        const session = await auth();

        if(!session.user) {
            return NextResponse.json({
                error: "Unauthorized request"
            }, { status: 401});
        }

        const data = await req.json();

        const productId = data.productId as string;

        if(!isValidObjectId(productId)) {
            return NextResponse.json({
                error: "Invalid productId"
            }, { status: 401});
        }

        const product = await ProductModel.findById(productId);


        if(!product) {
            return NextResponse.json({
                error: "Cart not found"
            }, { status: 404});
        }

        const lineItems =  {
                price_data: {
                    currency: "NGN",
                    unit_amount: Number(product.price.discounted) * 100,
                    product_data: {
                        name: product.title,
                        images: [product.thumbnail.url]
                    }
                },
                quantity: 1,
            };

        const customer = await stripe.customers.create({
            metadata: {
                userId: session.user.id,
                type: 'instant-checkout',
                product: JSON.stringify({
                    id: productId,
                    title: product.title,
                    price: product.price.discounted,
                    totalPrice: product.price.discounted,
                    thumbnail: product.thumbnail.url,
                    qty: 1
                })
            }
        });

        const params: Stripe.Checkout.SessionCreateParams = {
            mode: "payment",
            payment_method_types: ["card"],
            line_items: [lineItems],
            success_url: process.env.PAYMENT_SUCCESS_URL || "",
            cancel_url: process.env.PAYMENT_CANCEL_URL || "",
            shipping_address_collection: { allowed_countries: ["NG"] },
            customer: customer.id,
        }

       const checkoutSession =  await stripe.checkout.sessions.create(params);

       return NextResponse.json({ url: checkoutSession.url, }, { status: 200});

    } catch (error) {
        return NextResponse.json({ error: "Something went wrong, could not checkout"}, { status: 500 });
    }
}