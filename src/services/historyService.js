import { HistoryModel, UserModel } from '../db/models/index.js';
import dayjs from 'dayjs';

class HistoryService {
    constructor() {
        this.historyModel = new HistoryModel();
        this.userModel = new UserModel();
    }
    async getHistories(userId) {
        // 날짜 객체 선언
        const currentDate = dayjs();
        const start = currentDate.startOf('day');
        const end = currentDate.endOf('day');
        // 입력 날짜의 요일 가져오기
        // const dateObj = new Date(date);
        // 대한민국은 UTC+9 이기 때문에, UTC 시간을 맞추기 위해 시간 변수 선언
        // const utcPlusTime = 9 * 60 * 60 * 1000;
        // DB에서 조회 시간 start, end를 설정한다.
        // const start = new Date(dateObj.getTime() - utcPlusTime);
        // dateObj.setDate(dateObj.getDate() + 1);
        // const end = new Date(dateObj.getTime() - utcPlusTime);
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

    async getRanking() {
        // 현재 시간
        const currentDate = dayjs();
        // 입력 날짜의 요일 가져오기
        const dayOfWeek = currentDate.day();
        // 이전 일요일 찾기
        const previousSunday = currentDate.subtract(dayOfWeek, 'day').toDate();
        // 이후 토요일 찾기
        const nextSaturday = currentDate.add(6 - dayOfWeek, 'day').toDate();

        // 랭킹 구하기 (유저아이디, 투두 해결 갯수)
        const ranking = await this.historyModel.findRanking(
            previousSunday,
            nextSaturday
        );

        // 유저 아이디 배열 만들기
        const userIds = ranking.map((item) => item.userId);
        // 해당 배열로 유저 정보 불러오기
        const userInfo = await this.userModel.findByIdAllUser(userIds);

        // 데이터 정제
        const result = ranking.map((item, index) => {
            const user = userInfo.find(
                (info) => info._id.toString() === item.userId.toString()
            );
            return {
                count: item.count,
                userInfo: user,
                rank: index + 1
            };
        });
        return result;
    }
}
export default HistoryService;
