import { HistoryModel } from '../db/models/index.js';

class HistoryService {
    constructor() {
        this.historyModel = new HistoryModel();
    }
    async getHistory(userId, contentId) {
        return await this.historyModel.findHistory(userId, contentId);
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
