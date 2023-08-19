import { TodoContentModel, TodoCategoryModel } from "../db/models/index.js";

class TodoContentService {
    constructor() {
        this.todoContentModel = new TodoContentModel();
        this.todoCategoryModel = new TodoCategoryModel();
    }
    async getContents() {
        return await this.todoContentModel.find();
    }
    async getContent(id) {
        return await this.todoContentModel.findById(id);
    }

    // 개발시작
    async addContent(content) {
        return await this.todoContentModel.create(content);
        // return await this.todoContentModel.create(id, content);
    }

    async updateContent(content) {
        return await this.todoContentModel.update(content);
    }
    async deleteContent(categoryId, contentId) {
        console.log("services");
        return await this.todoContentModel.delete(categoryId, contentId);
    }
}

export default TodoContentService;
