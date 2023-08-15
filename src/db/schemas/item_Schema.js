import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
    {
        itemName: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        effect: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true
    }
);

export default itemSchema;
