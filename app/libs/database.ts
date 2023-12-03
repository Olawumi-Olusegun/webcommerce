
import mongoose from "mongoose";

let connection: typeof mongoose;

const url = 'mongodb://localhost:27017/next-ecommerce';


const startDatabase = async () => {
    
    try {
        
        if(!connection) {
            connection = await mongoose.connect(url);
        }

        return connection;

    } catch (error) {
        throw new Error((error as any)?.message);
    }
}

export default startDatabase;