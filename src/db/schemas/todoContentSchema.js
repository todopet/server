import { Schema } from 'mongoose';

const todoContentSchema = new Schema(
    {
        categoryId: {
            type: Schema.Types.ObjectId,
            ref: 'todoCategories',
            required: true
        },
        todo: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['unchecked', 'reverted', 'completed'],
            default: 'unchecked'
        },
        todoDate: {
            type: Date,
            required: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

todoContentSchema.index({ categoryId: 1, createdAt: 1 });

export default todoContentSchema;
