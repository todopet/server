// @ts-nocheck
import { Schema } from 'mongoose';
import petSchema from './petSchema.ts';

const myPetSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            required: true
        },
        pets: [
            {
                pet: petSchema
            }
        ]
    },
    {
        timestamps: true,
        versionKey: false
    }
);

export default myPetSchema;
