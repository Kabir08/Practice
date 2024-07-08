import mongoose from "mongoose";

const MONGODB_URI=process.env.NEXT_PUBLIC_MONGODB_URI;

async function connectDB(){
    try{
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser:true,
            useUnifiedTopology:true,
        });
        console.log('Connected to Mongodb');
    }catch(error){
        console.error('MongoDb connection error:', error)
    }
}

export default connectDB;