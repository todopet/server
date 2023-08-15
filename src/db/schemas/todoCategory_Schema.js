import mongoose from "mongoose";
import todoContentSchema from "./todoContent_Schema.js";

const todoCategorySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        category: {
            type: String,
            required: true
        },
        todos: [todoContentSchema]
    },
    {
        timestamps: true
    }
);

export default todoCategorySchema;