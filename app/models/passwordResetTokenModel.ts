import mongoose, { Model, ObjectId, models } from "mongoose";
import bcrypt from 'bcrypt'

interface PasswordResetTokenDocument extends Document {
    user: ObjectId;
    token: string;
    createdAt?: Date;
}

interface Method {
    compareToken: (token: string) => Promise<boolean>
}


const passwordResetTokenSchema = new mongoose.Schema<PasswordResetTokenDocument, {}, Method>({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User"  },
    token: { type: String, required: true, trim: true, },
    createdAt: { type: Date, default: Date.now(), expires: 60 * 60 * 24 }
});

passwordResetTokenSchema.pre("save", async function(next) {
    try {
        if(this.isModified("token")) {
            const salt = await bcrypt.genSalt(10);
            this.token = await bcrypt.hash(this.token, salt);
        }
        next();
    } catch (error) {
        throw error;
    }
})

passwordResetTokenSchema.methods.compareToken = async function(token) {
 
   try {
        return await bcrypt.compare(token, this.token)
   } catch (error) {
        throw error;
   }
    
}


const PasswordResetTokenModel = models.PasswordResetToken || mongoose.model("PasswordResetToken", passwordResetTokenSchema);


export default PasswordResetTokenModel as Model<PasswordResetTokenDocument, {}, Method>