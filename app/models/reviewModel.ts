import { Document, Schema, models, model, Model, ObjectId } from "mongoose";


interface ReviewDocument extends Document {
    userId: ObjectId;
    productId: ObjectId;
    rating: number;
    comment?: string;
    createdAt: Date;
    updatedAt: Date;
}


const reviewSchema = new Schema<ReviewDocument>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    rating: { type: Number, required: true },
    comment: { type: String, },
}, { timestamps: true });


const ReviewModel = models.Review || model("Review", reviewSchema);

export default ReviewModel as Model<ReviewDocument>