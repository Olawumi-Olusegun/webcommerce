import mongoose, { model, models, Model, Document } from "mongoose";
import bcrypt from 'bcrypt';

interface UserDocument extends Document {
    name: string;
    email: string;
    password: string;
    role?: "user" | "admin",
    avatar?: { url: string, id: string },
    verified: boolean;

}

interface Method {
    comparePassword: (password: string) => Promise<boolean>
}

const userSchema = new mongoose.Schema<UserDocument, {}, Method>({
    name: { type: String, required: true, trim: true  },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true  },
    password: { type: String, required: true, trim: true  },
    role: { type: String, enum: ["user", "admin"], default: "user"},
    avatar: { type: Object, url: String, id: String },
    verified: { type: Boolean, default: false },
}, { timestamps: true });



userSchema.pre("save", async function(next) {
    try {
        if(this.isModified("password")) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(this.password, salt);
            this.password = hashedPassword;
        }
        next();
    } catch (error) {
        throw error;
    }
});

userSchema.methods.comparePassword = async function(plainPassword) {
    try {
        return await bcrypt.compare(plainPassword, this.password)
    } catch (error) {
        throw error;
    }
}


const UserModel = models.User || model("User", userSchema);

export default UserModel as Model<UserDocument, {}, Method> ;

