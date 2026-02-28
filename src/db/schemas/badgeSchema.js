import { Schema } from 'mongoose';

const badgeSchema = new Schema(
  {
    // 어떤 카테고리에 대한 뱃지인지?
    category: {
      type: String, // todo, pet, use, item, sItem
      required: true
    },
    // 해당 카테고리에 대한 조건
    condition: {
      type: Number,
      required: true
    },
    // 뱃지 이름
    title: {
      type: String,
      required: true
    },
    // 뱃지 설명
    description: {
      type: String,
      required: true
    },
    // badge 이미지 경로
    url: {
      type: String,
      required: true
    }
  },
  {
    versionKey: false
  }
);

export default badgeSchema;
