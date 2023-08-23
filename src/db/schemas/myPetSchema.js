import { Schema } from "mongoose";

const myPetSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            required: true
        },
        pets: [
            {
                pet: {
                    type: Schema.Types.ObjectId,
                    required: true
                }
            }
        ]
    },
    {
        timestamps: true,
        versionKey: false
    }
);

export default myPetSchema;
