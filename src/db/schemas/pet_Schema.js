import { Schema } from "mongoose";

const petSchema = new Schema(
    {
        petName: {
            type: String,
            required: true
        },
        level: {
            type: Number,
            default: 0
        },
        exp: {
            type: Number,
            default: 0
        },
        hunger: {
            type: Number,
            default: 100
        },
        affection: {
            type: Number,
            default: 100
        },
        cleanliness: {
            type: Number,
            default: 100
        },
        condition: {
            type: Number,
            default: 100
        }
    },
    {
        timestamps: true
    }
);

export default petSchema;
