// @ts-nocheck
import mongoose from 'mongoose';
// import { todoCategoryModel, todoContentModel, historyModel } from './index.ts';

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
                todoDate: {
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
        const { categoryId, todo, todoDate } = content;

        return (
            await this.todoContentModel.create({
                categoryId,
                todo,
                todoDate
            })
        ).toObject();
    }
    async update(content) {
        const { id, todo, status, todoDate } = content;
        return await this.todoContentModel
            .findByIdAndUpdate(
                id,
                {
                    todo,
                    status,
                    todoDate
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
