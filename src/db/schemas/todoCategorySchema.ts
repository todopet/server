// @ts-nocheck
import { Schema } from 'mongoose';
import todoContentSchema from './todoContentSchema.ts';

const todoCategorySchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        category: {
            type: String,
            required: true
        },
        ended: {
            type: Boolean,
            required: true,
            default: false
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

export default todoCategorySchema;
