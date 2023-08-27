import { Schema } from 'mongoose';
import petSchema from './petSchema.js';

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
