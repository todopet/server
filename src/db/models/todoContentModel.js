import { model } from "mongoose";
import { todoContentSchema } from "../schemas/index.js";

const TodoContent = model("todoContents", todoContentSchema);

class TodoContentModel {
    async find(id) {
        // TODO: 날짜 오름차순, 내림차순 정렬 필요?
        return await TodoContent.find({ userId: id }).lean();
    }
    async findById(id) {
        // TODO: 날짜 오름차순, 내림차순 정렬 필요?
        return await TodoContent.findById(id, { userId }).lean();
    }
    async create(content) {
        return (await TodoContent.create(content)).toObject();
    }
    async update(id, category) {
        return await TodoContent.findByIdAndUpdate(id, { category }).toObject();
    }
    async delete(id) {
        return (await TodoContent.findByIdAndDelete(id)).toObject();
    }
}

export default TodoContentModel;
