import { TodoContentModel, TodoCategoryModel } from '../db/models/index.js';

class TodoContentService {
    constructor() {
        this.todoContentModel = new TodoContentModel();
        this.todoCategoryModel = new TodoCategoryModel();
    }

    async getMultipleContents(userId) {
        const categories = await this.todoCategoryModel.findByUserId(userId);

        // 사용자의 각 카테고리에 대해 비동기 작업을 병렬로 시작
        const promises = categories.map(async (category) => {
            const todos = await this.todoContentModel.findByCategoryId(
                category._id.toString()
            );
            category.todos = todos;
        });
        // 모든 비동기 작업이 완료될 때까지 대기하고, 그 후에 결과 리턴
        await Promise.all(promises);

        return categories;
    }
    async getSingleContents(id) {
        return await this.todoContentModel.findById(id);
    }

    async addContent(content) {
        return await this.todoContentModel.create(content);
    }

    async updateContent(content) {
        return await this.todoContentModel.update(content);
    }

    async deleteContent(categoryId, contentId) {
        return await this.todoContentModel.delete(categoryId, contentId);
    }
}

export default TodoContentService;
