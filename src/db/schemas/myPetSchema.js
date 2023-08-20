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
                    type: Schema.Types.ObjectId
                },
                myPetName: {
                    type: String,
                    required: true
                },
                // 경험치
                experience: {
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
        timestamps: true,
        versionKey: false
    }
);

export default myPetSchema;
