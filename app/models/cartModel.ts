import {
    ObjectId,
    Document,
    Schema,
    models,
    model,
    Model,
} from 'mongoose';


interface CartItem {
    productId: ObjectId,
    quantity: number;
}

interface CartDocument extends Document {
    userId: ObjectId,
    items: CartItem[];
    
}

const cartItemSchema = new Schema<CartDocument>({
    userId: { type: Schema.Types.ObjectId, required: true },
    items: [{
              productId: { 
                type:  Schema.Types.ObjectId,  
                required: true,  
                ref: "Product", 
            },
            quantity: { type: Number, default: 1 }
            }],
    
}, {timestamps: true});


const CartModel = models.Cart || model("Cart", cartItemSchema);

export default CartModel as Model<CartDocument>