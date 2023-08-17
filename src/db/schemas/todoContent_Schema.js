import { Schema } from "mongoose";

const todoContentSchema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        content: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ["pending", "completed"],
            default: "pending"
        },
        
    },
    {
        timestamps: true
    }
);

export default todoContentSchema;
