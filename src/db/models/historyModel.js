import { model } from 'mongoose';
import { historySchema } from '../schemas/index.js';

const History = model('histories', historySchema);
class HistoryModel {
    async findHistory(userId, contentId) {
        return await History.find({ userId, contentId }).lean();
    }
}
export default HistoryModel;
