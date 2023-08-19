import { Schema } from "mongoose";

const inventorySchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        items: [
            {
                item: {
                    type: Schema.Types.ObjectId,
                    ref: "Item",
                    required: true
                },
                quantity: {
                    type: Number,
                    default: 0
                }
            }
        ]
    },
    {
        timestamps: true
    }
);

export default inventorySchema;
