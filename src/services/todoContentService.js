import { todoContentModel, TodoCategoryModel } from '../db/models/index.js';
import { HistoryService, RewardService } from '../services/index.js';

class TodoContentService {
    constructor() {
        // this.todoContentModel = new todoContentModel();
        this.todoCategoryModel = new TodoCategoryModel();
        this.historyService = new HistoryService();
        this.rewardService = new RewardService();
    }

    async getMultipleContents(userId, start, end) {
        const categories = await this.todoCategoryModel.findByUserId(userId);

        // 사용자의 각 카테고리에 대해 비동기 작업을 병렬로 시작
        const promises = categories.map(async (category) => {
            const todos = await todoContentModel.findByCategoryId(
                category._id.toString(),
                start,
                end
            );
            category.todos = todos;
        });

        // 모든 비동기 작업이 완료될 때까지 대기하고, 그 후에 결과 리턴
        await Promise.all(promises);

        return categories;
    }

    async getSingleContents(id) {
        return await todoContentModel.findById(id);
    }

    async addContent(content) {
        return await todoContentModel.create(content);
    }

    async updateContent(content) {
        const { id, userId, status } = content;
        // 내용 또는 상태 수정
        const result = await todoContentModel.update(content);

        // 히스토리 조회 (해당 날짜의 히스토리 조회)
        const history = await this.historyService.getHistories(userId);

        // 특정 todo에 대한 히스토리 존재 여부 확인
        const isHistory = history.find((data) => data.contentId === id);

        let message = null;

        // 히스토리가 존재하지 않으면 보상 지급 및 히스토리 추가
        if (!isHistory && status === 'completed') {
            // 히스토리가 하루 10개 이상 있을 경우 보상을 지급하지 않는다.
            if (history.length < 10) {
                // 보상 지급
                const reward = await this.rewardService.giveReward(userId);
                message = {
                    content: '아이템 획득!',
                    reward: reward.name,
                    status: reward.status
                };
            } else {
                message = {
                    content: '오늘 보상 최대치를 받았습니다.',
                    reward: null
                };
            }
            // 히스토리 추가
            await this.historyService.addHistory(userId, id);
        } else if (status === 'completed') {
            message = {
                content: '이미 보상을 수령하였습니다',
                reward: null
            };
        }

        result.message = message;
        return result;
    }

    async deleteContent(id) {
        return await todoContentModel.delete(id);
    }
}

export default TodoContentService;
