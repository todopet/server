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

    async findUserHistory(userId) {
        return await History.find({ userId }).lean();
    }
    async createHistory(userId, contentId) {
        return (await History.create({ userId, contentId })).toObject();
    }

    async findRanking(start, end) {
        return await History.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: start, // 'start' 날짜
                        $lte: end // 'end' 날짜
                    }
                }
            },
            {
                $group: {
                    _id: '$userId', // 사용자 별로 그룹화
                    count: { $sum: 1 } // 데이터 갯수 세기
                }
            },
            {
                $sort: { count: -1, createdAt: -1 } // 갯수에 따라 내림차순 정렬 (랭킹 순서), 갯수 같을 시 최근 생성 순서
            },
            {
                $project: {
                    _id: 0, // _id 필드 제거
                    userId: '$_id', // 결과에서 필요한 필드만 남김
                    count: 1 // count 필드
                }
            },
            {
                $limit: 10 // 상위 10개 데이터만 가져오기
            }
        ]);
    }

    async deleteMany(userId) {
        return await History.deleteMany({ userId }).lean();
    }
}
export default HistoryModel;
