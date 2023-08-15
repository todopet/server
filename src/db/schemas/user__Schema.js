import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        nickname: {
            type: String,
            required: true
        },
        membershipStatus: {
            type: String,
            enum: ["active", "withdrawn", "suspended"],
            default: "active",
            required: true
        },
    },
    {
        timestamps: true
    }
);

export default userSchema;
