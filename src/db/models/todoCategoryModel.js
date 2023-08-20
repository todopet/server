import { model } from "mongoose";
import { todoCategorySchema } from "../schemas/index.js";

const TodoCategory = model("todoCategories", todoCategorySchema);

class TodoCategoryModel {
    // 각각 findById로 주면 좋을 것 같은데 category랑 content랑 동일한거 써서 안될 것 같음
    // 특정 user에 대한 모든 카테고리 조회
    async findCategories(userId) {
        return await TodoCategory.find({ userId }).lean();
    }
    // 특정 카테고리 1개 조회
    async findCategory(id) {
        return await TodoCategory.findById(id).lean();
    }
    async findById(id) {
        // TODO: 날짜 오름차순, 내림차순 정렬 필요?
        return await TodoCategory.findById(id).lean();
    }
    async create(userId, category) {
        return (await TodoCategory.create({ userId, category })).toObject();
    }
    async update(id, category) {
        return (
            await TodoCategory.findByIdAndUpdate(id, {
                category
            })
        ).toObject();
    }
    async delete(id) {
        return (await TodoCategory.findByIdAndDelete(id)).toObject();
    }
}

export default TodoCategoryModel;
