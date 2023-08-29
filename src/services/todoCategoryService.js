import { TodoCategoryModel } from '../db/models/index.js';

class TodoCategoryService {
    constructor() {
        this.todoCategoryModel = new TodoCategoryModel();
    }
    async getCategories(userId) {
        return await this.todoCategoryModel.findByUserId(userId);
    }
    async getCategory(categoryId) {
        return await this.todoCategoryModel.findById(categoryId);
    }
    async addCategory(categoryInfo) {
        const { userId, category } = categoryInfo;
        return await this.todoCategoryModel.create(userId, category);
    }
    async updateCategory(id, category) {
        return await this.todoCategoryModel.update(id, category);
    }
    async updateEndCategory(id) {
        return await this.todoCategoryModel.updateEnd(id);
    }
    async deleteCategory(id) {
        return await this.todoCategoryModel.delete(id);
    }
    async deleteAllTodoCategoiesByUserId(userId) {
        return await this.todoCategoryModel.deleteMany(userId);
    }
}

export default TodoCategoryService;
