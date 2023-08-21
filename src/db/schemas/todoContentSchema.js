import { Schema } from 'mongoose';

const todoContentSchema = new Schema(
    {
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
            enum: ['pending', 'completed'],
            default: 'pending'
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

export default todoContentSchema;
