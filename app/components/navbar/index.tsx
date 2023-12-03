import React from 'react'
import NavUI from '@components/navbar/NavUi'
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import startDatabase from '@/app/libs/database';
import UserModel from '@/app/models/userModel';
import CartModel from '@/app/models/cartModel';
import { Types } from 'mongoose';


// export const fetchUserProfile = async () => {
  
//   const session = await auth();

//   if (!session?.user) {
//     return redirect("/auth/signin");
//   }

//   await startDatabase();

//   const user = await UserModel.findById(session.user.id);

//   if (!user) {
//     return redirect("/auth/signin");
//   }

//   return {
//     id: user._id.toString(),
//     name: user.name,
//     email: user.email,
//     avatar: user.avatar?.url,
//     verified: user.verified,
//   };
// };


const getCartItemsCount = async () => {

  try {

    const session = await auth();

    // if (!session?.user) {
    //   return redirect("/auth/signin");
    // }

    const userId = session?.user?.id;

    const cart = await CartModel.aggregate([
      { $match: { userId: new Types.ObjectId(userId) } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$_id",
          totalQuantity: { $sum: "$items.quantity" },
        },
      },
    ]);

    if (cart?.length) {
      return cart[0].totalQuantity;
    } else {
      return 0;
    }

  } catch (error) {
    console.log("Error while fetching cart items count: ", error);
    return 0;
  }
};


const Navbar = async () => {

  const cartItemsCount = await getCartItemsCount();
  // const profile = await fetchUserProfile();

  return (
    <div>
        <NavUI cartItemsCount={ cartItemsCount ||  0}   />
    </div>
  )
}

export default Navbar