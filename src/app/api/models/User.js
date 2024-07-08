import mongoose, { mongo } from "mongoose";

const userSchema = new mongoose.Schema({
    username: {type:String, required:true},
    avatar: {type:String},
    paymentId: {type:String},
    paymentSecret: {type:String},
    instagram: {type:String},
    linkedin : {type:String},
    github : {type:String},
});

const User = mongoose.model('User', userSchema);

export default User;