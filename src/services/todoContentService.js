import { todoContentModel, TodoCategoryModel } from '../db/models/index.js';
import {
  HistoryService,
  InventoryService,
  RewardService
} from '../services/index.js';
import { maxVolume } from '../utils/common.js';
import dayjs from 'dayjs';

class TodoContentService {
  constructor() {
    // this.todoContentModel = new todoContentModel();
    this.todoCategoryModel = new TodoCategoryModel();
    this.historyService = new HistoryService();
    this.rewardService = new RewardService();
    this.inventoryService = new InventoryService();
  }

  async getMultipleContents(userId, start, end) {
    const categories = await this.todoCategoryModel.findByUserId(userId);

    const startDate = dayjs(start).startOf('day');
    const endDate = dayjs(end).endOf('day');

    // 사용자의 각 카테고리에 대해 비동기 작업을 병렬로 시작
    const promises = categories.map(async (category) => {
      const todos = await todoContentModel.findByCategoryId(
        category._id.toString(),
        startDate,
        endDate
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
    const { categoryId, todo, date } = content;
    const createdAt = dayjs(date).startOf('day');
    return await todoContentModel.create({ categoryId, todo, createdAt });
  }

  async updateContent(content) {
    const { id, userId, status } = content;
    // 내용 또는 상태 수정 - 히스토리 조회(해당 날짜의 히스토리 조회)
    const [result, history] = await Promise.all([
      todoContentModel.update(content),
      this.historyService.getHistories(userId)
    ]);

    // 특정 todo에 대한 히스토리 존재 여부 확인
    const isHistory = history.find((data) => data.contentId === id);

    let inventoryCount = 0;

    // 히스토리가 존재하지 않으면 보상 지급 및 히스토리 추가
    if (!isHistory && status === 'completed') {
      // 히스토리가 하루 10개 이상 있을 경우 보상을 지급하지 않는다.
      if (history.length < 100) {
        const inventoryId = await this.inventoryService.getInventoryIdByUserId(
          userId
        );
        inventoryCount = await this.inventoryService.getInventoryCount(
          inventoryId
        );

        // 인벤토리 아이템 갯수 체크. 50개 넘으면 안줌
        if (inventoryCount >= maxVolume) {
          result.message = {
            type: 'FULL',
            reward: null
          };
        } else {
          // 보상 지급
          const reward = await this.rewardService.giveReward(userId);
          // 유저의 인벤토리 아이템 갯수 조회
          inventoryCount = await this.inventoryService.getInventoryCount(
            inventoryId
          );
          result.message = {
            type: reward.status.length >= 4 ? 'SPECIAL' : 'NORMAL',
            inventoryCount,
            reward: reward.name
          };
        }
      } else {
        result.message = {
          type: 'ALL_RECEIVED',
          reward: null
        };
      }
      // 히스토리 추가
      await this.historyService.addHistory(userId, id);
    } else if (status === 'completed') {
      result.message = {
        type: 'RECEIVED',
        reward: null
      };
    }

    return result;
  }
  async deleteAllTodoContentsByUserId(userId) {
    const categoryId = await this.todoCategoryModel.findByUserId(userId);
    if (categoryId) {
      for (let i = 0; i < categoryId.length; i++) {
        await todoContentModel.deleteTodoContentByCategoryId(
          categoryId[i]._id.toString()
        );
      }
    }
  }
  async deleteContent(id) {
    return await todoContentModel.delete(id);
  }
}

export default TodoContentService;
