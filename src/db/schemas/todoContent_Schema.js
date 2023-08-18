import { Schema } from "mongoose";

const todoContentSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
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
        completed: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

export default todoContentSchema;
