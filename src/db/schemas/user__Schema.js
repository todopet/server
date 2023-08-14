import mongoose from "mongoose";

class User {
    constructor() {
        const userSchema = new mongoose.Schema(
            {
                nickname: {
                    type: String,
                    required: true,
                },
                membershipStatus: {
                    type: String,
                    enum: ["active", "withdrawn", "suspended"],
                    required: true,
                },
                inventory: [
                    {
                        item: {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: "Item",
                        },
                        quantity: {
                            type: Number,
                            default: 0,
                        }
                    }
                ]
            },
            {
                timestamps: true,
            }
        );

        return mongoose.model("User", userSchema);
    }
}

export default new User();
