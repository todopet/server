import { Schema } from "mongoose";

const myPetSchema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        pets: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Pet"
            }
        ]
    },
    {
        timestamps: true
    }
);

export default myPetSchema;
