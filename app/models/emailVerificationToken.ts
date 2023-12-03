import mongoose, { Model, ObjectId, models } from 'mongoose'
import bcrypt from 'bcrypt'

interface EmailVerificationTokenDocument extends Document {
    user: ObjectId;
    token: string;
    createdAt?: Date;
}

interface Method {
    compareToken: (token: string) => Promise<boolean>;
}

const emailVerificationTokenSchema = new mongoose.Schema<EmailVerificationTokenDocument, {}, Method>({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "UserModel" },
    token: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now(), expires: 60 * 60 * 24 },
});

emailVerificationTokenSchema.pre("save", async function(next) {
    try {
        if(this.isModified("token")) {
            const salt = await bcrypt.genSalt(10);
            this.token = await bcrypt.hash(this.token, salt);
        }
    
        next();
    } catch (error) {
        throw error;
    }
});


emailVerificationTokenSchema.methods.compareToken = async function(plainToken) {
    try {
        return await bcrypt.compare(plainToken, this.token);
    } catch (error) {
        throw error;
    }
}

const EmailVerificationToken = models.EmailVerificationToken || mongoose.model("EmailVerificationToken", emailVerificationTokenSchema);

export default EmailVerificationToken as Model<EmailVerificationTokenDocument, {}, Method>;