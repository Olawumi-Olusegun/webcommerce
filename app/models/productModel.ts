import mongoose, { Document, Model, models } from 'mongoose';
import categories from '../utils/categories';


export interface NewProduct {
    title: string;
    description: string;
    bulletPoints: string[];
    thumbnail: { url: string, id: string };
    images?: { url: string, id: string }[];
    price: {
        base: number;
        discounted: number;
    };
    quantity: number;
    category: string;
    rating?: number;
}

interface ProductDocument extends NewProduct {
    sale: number;
    // rating: number;
}

const productSchema = new mongoose.Schema<ProductDocument>({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    bulletPoints: { type: [String], required: true, },
    thumbnail: {
        type: Object,
        required: true,
        id: { type: String, required: true },
        url: { type: String, required: true },
     },
     images: [
     {
        id: { type: String, required: true },
        url: { type: String, required: true },
     }],
     price: {
        type: Object,
        required: true,
        base: { type: Number, required: true },
        discounted: { type: Number, required: true },
     },
     quantity: { type: Number, default: 0 },
     category: { type: String, enum: [...categories], required: true, },
     rating: Number,

}, { timestamps: true });


productSchema.virtual("sale").get(function(this: ProductDocument) {
    return Math.round(((this.price.base - this.price.discounted) / this.price.base) * 100);
});

const ProductModel = models.Product || mongoose.model("Product", productSchema);

export default ProductModel as Model<ProductDocument>