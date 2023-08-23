import { TodoContentModel, TodoCategoryModel } from '../db/models/index.js';
import { HistoryService, RewardService } from '../services/index.js';

class TodoContentService {
    constructor() {
        this.todoContentModel = new TodoContentModel();
        this.todoCategoryModel = new TodoCategoryModel();
        this.historyService = new HistoryService();
        this.rewardService = new RewardService();
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
        const { id, userId, todo, status } = content;
        // 히스토리 조회
        const history = await this.historyService.getHistory(userId, id);
        // 히스토리 없으면 보상 지급 및 히스토리 추가
        if (!history.length) {
            // 보상 지급
            await this.rewardService.giveReward(userId);
            // 히스토리 추가
            await this.historyService.addHistory(userId, id);
        }

        // 내용 업데이트 (완료처리 or 내용 수정)
        return await this.todoContentModel.update(content);
    }

    async deleteContent(id) {
        return await this.todoContentModel.delete(id);
    }
}

export default TodoContentService;
