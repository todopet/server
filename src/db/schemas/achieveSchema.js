import { Schema } from "mongoose";

const achieveSchema = new Schema(
    {
        /**
         * 업적 내용(첫 투두 완료하기)
         * 달성 조건 숫자
         * 선물 상태(수령함, 수령가능, 미달성)
         */
        // 업적 내용
        name: {
            type: String,
            required: true
        },
        // 업적 내용 설명
        description: {
            type: String,
            required: true
        },
        // 업적 달성 조건 (숫자)
        condition: {
            type: Number,
            required: true
        },
        // 업적 달성 상태 (수령함, 수령가능, 미달성)
        status: {
            type: String,
            enum: ["received", "available", "incomplete"],
            default: "incomplete"
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

export default achieveSchema;
