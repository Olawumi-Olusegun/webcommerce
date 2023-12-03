import Stripe from "stripe";
import { NextResponse } from "next/server";
import { CartProduct, StripeCustomer } from "@/app/types";
import { getCartItems } from "@/app/libs/cartHelper";
import OrderModel from "@/app/models/orderModel";
import ProductModel from "@/app/models/productModel";
import CartModel from "@/app/models/cartModel";


const stripeSecret = process.env.STRIPE_SECRET_KEY as string;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;


const stripe = new Stripe(stripeSecret || "", {
    apiVersion: "2023-10-16",
});


export const POST = async (req: Request) => {

    const data = await req.text();
    const signature = req.headers.get("stripe-signature") as string;

    let event;

    try {

    event = await stripe.webhooks.constructEvent(data, signature, webhookSecret);

    } catch (error) {
        return NextResponse.json({error: (error as any).message}, { status: 400});
    }

    try {

        if(event.type === "checkout.session.completed") {
            const stripeSession = event.data.object as { 
                customer: string;
                payment_intent: string;
                amount_subtotal: number;
                customer_details: any;
                payment_status: string;
            }

            const customer = await stripe.customers.retrieve(stripeSession.customer) as unknown as StripeCustomer;
            
            const { cartId, userId, type, product } = customer.metadata;

            if(type === 'checkout') {
                const cartItems = await getCartItems(userId, cartId);
                OrderModel.create({
                    userId,
                    stripeCustomerId: stripeSession.customer,
                    paymentIntent: stripeSession.payment_intent,
                    totalAmount: stripeSession.amount_subtotal / 100,
                    shippingDetails: {
                        address: stripeSession.customer_details.address,
                        email: stripeSession.customer_details.email,
                        name: stripeSession.customer_details.name,
                    },
                    paymentStatus: stripeSession.payment_status,
                    orderItems: cartItems.products,
                });

                const updatedProductPromises = cartItems.products.map(async(product)=> {
                    return await ProductModel.findByIdAndUpdate(product.id, {
                        $inc: { quantity: -product.qty }
                    });
                });

                await Promise.all(updatedProductPromises);
                await CartModel.findByIdAndDelete(cartId);
            }


            if(type === 'instant-checkout') {
                const productInfo = JSON.parse(product) as unknown as CartProduct;
                OrderModel.create({
                    userId,
                    stripeCustomerId: stripeSession.customer,
                    paymentIntent: stripeSession.payment_intent,
                    totalAmount: stripeSession.amount_subtotal / 100,
                    shippingDetails: {
                        address: stripeSession.customer_details.address,
                        email: stripeSession.customer_details.email,
                        name: stripeSession.customer_details.name,
                    },
                    paymentStatus: stripeSession.payment_status,
                    orderItems: [
                        {
                            ...productInfo, 
                            totalPrice: productInfo.price,
                        }
                    ],
                });

                const updatedProduct = await ProductModel.findByIdAndUpdate(productInfo.id, {
                    $inc: { quantity: -1}
                });

            }
        }

        return NextResponse.json({});
        
    } catch (error) {
        return NextResponse.json({error: "Something went wronf, unable to create order"}, { status: 500});
    }
}