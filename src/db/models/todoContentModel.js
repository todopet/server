import mongoose from 'mongoose';
// import { todoCategoryModel, todoContentModel, historyModel } from './index.js';

class TodoContentModel {
    constructor(todoCategoryModel, todoContentModel, historyModel) {
        this.todoCategoryModel = todoCategoryModel;
        this.todoContentModel = todoContentModel;
        this.historyModel = historyModel;
    }
    async findByCategoryId(id, start, end) {
        return await this.todoContentModel
            .find({
                categoryId: id,
                createdAt: {
                    $gte: start,
                    $lte: end
                }
            })
            .lean();
    }
    async findById(id) {
        return await this.todoContentModel.findById(id).lean();
    }
    async create(content) {
        const { categoryId, todo, createdAt } = content;

        return (
            await this.todoContentModel.create({
                categoryId,
                todo,
                createdAt
            })
        ).toObject();
    }
    async update(content) {
        const { id, todo, status } = content;

        return await this.todoContentModel
            .findByIdAndUpdate(
                id,
                {
                    todo,
                    status
                },
                {
                    new: true
                }
            )
            .lean();
    }

    async delete(id) {
        return await this.todoContentModel.findByIdAndDelete(id).lean();
    }
    async deleteTodoContentByCategoryId(categoryId) {
        return await this.todoContentModel.deleteMany({ categoryId });
    }
}

export default TodoContentModel;
