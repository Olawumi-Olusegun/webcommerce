import OrderCard from '@/app/components/OrderCard';
import startDatabase from '@/app/libs/database'
import OrderModel from '@/app/models/orderModel';
import { Order } from '@/app/types';
import { redirect } from 'next/navigation';
import React from 'react'


interface User {
    userId: {
        _id: string;
        name: string;
        email: string;
        avatar?: { url: string };
    }
}

const fetchOrders = async () => {
    
    await startDatabase();

    const orders = await OrderModel.find().sort("-createdAt").limit(5).populate<User>({
        path: "userId",
        model: "User",
        select: "name email avatar",
    });

    console.log({ orders });

    const orderResults: Order[] = orders.map((order) => {
        return {
            id: order._id.toString(),
            deliveryStatus: order.deliveryStatus,
            subTotal: order.totalAmount,
            products: order.orderItems,
            customer: {
                id: order.userId._id.toString(),
                name: order.userId.name,
                email: order.userId.email,
                address: order.shippingDetails.address,
                avatar: order.userId?.avatar?.url,
            },
        }
    });

    return JSON.stringify(orderResults);
}

export default async function Orders() {

    const orderResult = await fetchOrders();

    const orders = JSON.parse(orderResult) as Order[];

    console.log({ orders })

    if(!orders || orders.length === 0) {
        return redirect("/dashboard");
    }

  return (
    <div className='py-4 space-y-4 '>
        {orders.map((order) => <OrderCard order={order} key={order.id} disableUpdate={false} /> )}
    </div>
  )
}
