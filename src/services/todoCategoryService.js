import { TodoCategoryModel } from "../db/models/index.js";

class TodoCategoryService {
    constructor() {
        this.todoCategoryModel = new TodoCategoryModel();
    }
    async getCategories(userId) {
        return await this.todoCategoryModel.findCategories(userId);
    }
    async getCategory(categoryId) {
        return await this.todoCategoryModel.findCategory(categoryId);
    }
    async addCategory(categoryInfo) {
        const { userId, category } = categoryInfo;
        return await this.todoCategoryModel.create(userId, category);
    }
    async updateCategory(id, category) {
        return await this.todoCategoryModel.update(id, category);
    }
    async deleteCategory(id) {
        return await this.todoCategoryModel.delete(id);
    }
}

export default TodoCategoryService;
