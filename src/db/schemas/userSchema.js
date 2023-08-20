import { Schema } from "mongoose";

const userSchema = new Schema(
    {
        googleId: {
            type: String,
            unique: true,
            required: true
        },
        nickname: {
            type: String,
            unique: true,
            required: true
        },
        membershipStatus: {
            type: String,
            enum: ["active", "withdrawn", "suspended"],
            default: "active",
            required: true
        },
        picture: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

export default userSchema;