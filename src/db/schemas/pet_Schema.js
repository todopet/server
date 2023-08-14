import mongoose from "mongoose";

class Pet {
    constructor() {
        const petSchema = new mongoose.Schema(
            {
                name: {
                    type: String,
                    required: true
                },
                level: {
                    type: Number,
                    default: 0
                },
                exp: {
                    type: Number,
                    default: 0
                },
                hunger: {
                    // 포만감
                    type: Number,
                    default: 100
                },
                affection: {
                    // 애정도
                    type: Number,
                    default: 100
                },
                cleanliness: {
                    // 청결도
                    type: Number,
                    default: 100
                },
                condition: {
                    // 컨디션(fatigue피로도 였는데 피로도 100이면 말이 안되는거같아 condition 으로 변경)
                    type: Number,
                    default: 100
                }
            },
            {
                timestamps: true
            }
        );

        return mongoose.model("Pet", petSchema);
    }
}

export default new Pet();
