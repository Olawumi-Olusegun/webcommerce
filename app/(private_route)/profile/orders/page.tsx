
import React from 'react';
import startDatabase from '@/app/libs/database';
import OrderModel from '@/app/models/orderModel';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import OrderListPublic, { Orders } from '@/app/components/OrderListPublic';


const fetchOrders = async () => {
    
    const session = await auth();

    if(!session.user) {
        return redirect("/profile");
    }

    await startDatabase();
    const orders = await OrderModel.find({userId: session.user.id}).sort("-createdAt");

    const orderArray: Orders[] = orders.map((order) => {
        return {
            id: order._id.toString(),
            paymentStatus: order.paymentStatus,
            total: order.totalAmount,
            deliveryStatus: order.deliveryStatus,
            products: order.orderItems,
            date: order.createdAt.toString(),
        }
    });
    

    return JSON.stringify(orderArray);
}

export default async function Orders() {

    const ordersResult = await fetchOrders();

    if(!ordersResult) {
        return redirect("/profile");
    }

    const orders = JSON.parse(ordersResult);

  return (
    <div>
        <OrderListPublic orders={orders} />
    </div>
  )
}
