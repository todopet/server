import { model } from 'mongoose';
import { historySchema } from '../schemas/index.js';

const History = model('histories', historySchema);
class HistoryModel {
    async findHistories(userId, start, end) {
        return await History.find({
            userId,
            createdAt: {
                $gte: start,
                $lte: end
            }
        }).lean();
    }
    async createHistory(userId, contentId) {
        return (await History.create({ userId, contentId })).toObject();
    }
}
export default HistoryModel;
