// @ts-nocheck
import { model } from 'mongoose';
import { todoCategorySchema } from '../schemas/index.ts';

const TodoCategory = model('todoCategories', todoCategorySchema);

class TodoCategoryModel {
    // constructor() {
    //     this.todoCategoryModel = todoCategoryModel;
    // }

    // 특정 user에 대한 모든 카테고리 조회
    async findByUserId(userId) {
        return await TodoCategory.find({ userId }).lean();
    }
    // 특정 카테고리 1개 조회
    async findById(id) {
        return await TodoCategory.findById(id).lean();
    }
    async create(userId, category) {
        return (await TodoCategory.create({ userId, category })).toObject();
    }
    async update(id, category) {
        return await TodoCategory.findByIdAndUpdate(
            id,
            {
                category
            },
            {
                new: true,
                lean: true
            }
        );
    }
    async updateEnd(id) {
        return await TodoCategory.findByIdAndUpdate(
            id,
            { ended: true },
            {
                new: true,
                lean: true
            }
        );
    }
    async delete(id) {
        return await TodoCategory.findByIdAndDelete(id).lean();
    }
    async deleteMany(userId) {
        return await TodoCategory.deleteMany({ userId }).lean();
    }
}

export default TodoCategoryModel;
