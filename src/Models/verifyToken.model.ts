import mongoose from "mongoose";
const Schema = mongoose.Schema;

const tokenSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
});

let tokenModel = mongoose.model("token", tokenSchema);
export default tokenModel;