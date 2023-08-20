import { Schema } from "mongoose";

const myPetSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        pets: [
            {
                pet: {
                    type: Schema.Types.ObjectId
                    // ref: "Pet"
                },
                myPetName: {
                    type: String,
                    required: true
                },
                // 경험치
                curExp: {
                    type: Number,
                    default: 0
                },
                // 포만감
                curHunger: {
                    type: Number,
                    default: 0
                },
                // 친밀도
                curAffection: {
                    type: Number,
                    default: 0
                },
                // 청결도
                curCleanliness: {
                    type: Number,
                    default: 0
                },
                // 컨디션
                curCondition: {
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

export default myPetSchema;
