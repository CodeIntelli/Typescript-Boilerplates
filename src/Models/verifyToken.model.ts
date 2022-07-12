import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    token: {
        type: String,
    },
    otp: { type: String },
    createdAt: { type: Date, default: Date.now }, // 20 minutes
    expiresAt: { type: Date, expires: 1200 },
});

let tokenModel = mongoose.model("token", tokenSchema);
export default tokenModel;