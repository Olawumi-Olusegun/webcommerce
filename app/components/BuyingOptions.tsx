"use client";

import React, { useState, useTransition } from "react";
import { Button } from "@material-tailwind/react";
import CartCountUpdater from "@components/CartCountUpdater";
import { useParams, useRouter } from "next/navigation";
import useAuth from "../hooks/useAuth";
import { toast } from "react-toastify";

export default function BuyingOptions() {
  const [quantity, setQuantity] = useState(1);
  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  const { loggedIn } = useAuth();

  const { product } = useParams();

  const productId = product[1];

  const handleIncrement = () => {
    setQuantity((prevCount) => prevCount + 1);
  };

  const handleDecrement = () => {
    if (quantity === 0) return;
    setQuantity((prevCount) => prevCount - 1);
  };

  const addToCart = async () => {
    
    if(!productId) return;

    if(!loggedIn) {
      return router.push("/auth/signin")
    }

      try {
       const response = await fetch("/api/product/cart", {
          method: "POST",
          body: JSON.stringify({productId, quantity})
        });

        const { error } = await response.json();

        if(!response.ok && error) {
          toast.error(error);
        }

      } catch (error) {
        
      }
  }

  return (
    <div className="flex items-center space-x-2">
      <CartCountUpdater
        onDecrement={handleDecrement}
        onIncrement={handleIncrement}
        value={quantity}
      />

      <Button 
       variant="text"
       disabled={isPending}
       onClick={() => {
        startTransition(async () => await addToCart() )
       } }
      >
        Add to Cart
      </Button>

      <Button disabled={isPending} color="amber" className="rounded-full">
        Buy Now
      </Button>
    </div>
  );
}
