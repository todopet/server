import { todoCategoryModel } from './index.js';
class TodoCategoryModel {
    constructor() {
        this.todoCategoryModel = todoCategoryModel;
    }

    // 특정 user에 대한 모든 카테고리 조회
    async findByUserId(userId) {
        return await this.todoCategoryModel.find({ userId }).lean();
    }
    // 특정 카테고리 1개 조회
    async findById(id) {
        return await this.todoCategoryModel.findById(id).lean();
    }
    async create(userId, category) {
        return (
            await this.todoCategoryModel.create({ userId, category })
        ).toObject();
    }
    async update(id, category) {
        return await this.todoCategoryModel
            .findByIdAndUpdate(id, {
                category
            })
            .lean();
    }
    async delete(id) {
        return await this.todoCategoryModel.findByIdAndDelete(id).lean();
    }
}

export default TodoCategoryModel;
