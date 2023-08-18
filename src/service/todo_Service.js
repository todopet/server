import { TodoModel } from "../db/models/index.js";

class TodoService {
    constructor() {
        this.todoModel = new TodoModel();
    }
    async getCategories(userId) {
        return await this.todoModel.findCategories(userId);
    }
    async getCategory(categoryId) {
        return await this.todoModel.findCategory(categoryId);
    }
    async addCategory(categoryInfo) {
        const { userId, category } = categoryInfo;
        return await this.todoModel.create(userId, category);
    }
    async updateCategory(id, category) {
        return await this.todoModel.update(id, category);
    }
    async deleteCategory(id) {
        return await this.todoModel.delete(id);
    }

    // --------- 계획 getContents
    // async getContents() {
    //     return await this.todoModel.find();
    // }
    // async getContent(id) {
    //     return await this.todoModel.findById(id);
    // }
    // async addCategory(category) {
    //     return await this.todoModel.create(category);
    // }
    // async updateCategory(id, category) {
    //     return await this.todoModel.update(id, category);
    // }
    // async deleteCategory(id) {
    //     return await this.todoModel.delete(id);
    // }
}

export default TodoService;
