import { TodoContentModel } from "../db/models/index.js";

class TodoContentService {
    constructor() {
        this.todoContentModel = new TodoContentModel();
    }
    async getContents() {
        return await this.todoContentModel.find();
    }
    async getContent(id) {
        return await this.todoContentModel.findById(id);
    }
    async addContent(category) {
        return await this.todoContentModel.create(category);
    }
    async updateContent(id, category) {
        return await this.todoContentModel.update(id, category);
    }
    async deleteContent(id) {
        return await this.todoContentModel.delete(id);
    }
}

export default TodoContentService;
