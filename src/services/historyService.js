import { HistoryModel } from '../db/models/index.js';

class HistoryService {
    constructor() {
        this.historyModel = new HistoryModel();
    }
    async getHistories(userId, date) {
        // 날짜 객체 선언
        const dateObj = new Date(date);
        // 대한민국은 UTC+9 이기 때문에, UTC 시간을 맞추기 위해 시간 변수 선언
        const utcPlusTime = 9 * 60 * 60 * 1000;
        // DB에서 조회 시간 start, end를 설정한다.
        const start = new Date(dateObj.getTime() - utcPlusTime);
        dateObj.setDate(dateObj.getDate() + 1);
        const end = new Date(dateObj.getTime() - utcPlusTime);
        return await this.historyModel.findHistories(userId, start, end);
    }
    async addHistory(userId, contentId) {
        return await this.historyModel.createHistory(userId, contentId);
    }
    async updateHistory(id, myPet) {
        return await this.historyModel.update(id, myPet);
    }
    async deleteHistory(id) {
        return await this.historyModel.delete(id);
    }
}
export default HistoryService;
