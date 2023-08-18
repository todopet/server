import { Schema } from "mongoose";
import todoContentSchema from "./todoContent_Schema.js";

const todoCategorySchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
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
