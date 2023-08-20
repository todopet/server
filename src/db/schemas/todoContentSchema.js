import { Schema } from "mongoose";

const todoContentSchema = new Schema(
    {
        userId: {
            type: String,
            // type: Schema.Types.ObjectId,
            // ref: "User",
            required: true
        },
        categoryId: {
            type: String,
            required: true
        },
        todo: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ["pending", "completed"],
            default: "pending"
        }
    },
    {
        timestamps: true
    }
);

export default todoContentSchema;
