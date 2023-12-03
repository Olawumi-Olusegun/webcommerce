
import { getCartItems } from '@/app/libs/cartHelper';
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

        const cartId = data.cartId as string;

        if(!isValidObjectId(cartId)) {
            return NextResponse.json({
                error: "Invalid cartId"
            }, { status: 401});
        }

        const cartItems = await getCartItems(session.user.id, cartId);

        if(!cartItems) {
            return NextResponse.json({
                error: "Cart not found"
            }, { status: 404});
        }

        const lineItems = cartItems.products.map((product) => {
            return  {
                price_data: {
                    currency: "NGN",
                    unit_amount: Number(product.price) * 100,
                    product_data: {
                        name: product.title,
                        images: [product.thumbnail]
                    }
                },
                quantity: product.qty,
            }
        });

        const customer = await stripe.customers.create({
            metadata: {
                userId: session.user.id,
                cartId,
                type: 'checkout',
                // paymentIntent: ""
            }
        });

        const params: Stripe.Checkout.SessionCreateParams = {
            mode: "payment",
            payment_method_types: ["card"],
            line_items: lineItems,
            success_url: process.env.PAYMENT_SUCCESS_URL || "",
            cancel_url: process.env.PAYMENT_CANCEL_URL || "",
            shipping_address_collection: { allowed_countries: ["NG"] },
            customer: customer.id,
        }

       const checkoutSession =  await stripe.checkout.sessions.create(params)

       return NextResponse.json({ url: checkoutSession.url, }, { status: 200});

    } catch (error) {
        return NextResponse.json({ error: "Something went wrong, could not checkout"}, { status: 500 })
    }
}