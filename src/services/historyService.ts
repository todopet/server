// @ts-nocheck
import { HistoryModel, UserModel } from '../db/models/index.ts';
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

    return await this.historyModel.findHistories(userId, start, end);
  }
  async addHistory(userId, contentId) {
    return await this.historyModel.createHistory(userId, contentId);
  }

  async deleteHistory(id) {
    return await this.historyModel.delete(id);
  }

  async deleteAllHistoryByUserId(id) {
    return await this.historyModel.deleteMany(id);
  }

  async getRanking(count) {
    // 현재 시간
    const currentDate = dayjs();
    // 입력 날짜의 요일 가져오기
    const dayOfWeek = currentDate.day();
    // 이전 일요일 찾기
    const previousSunday = currentDate
      .subtract(dayOfWeek, 'day')
      .startOf('day')
      .toDate();
    // 이후 토요일 찾기
    const nextSaturday = currentDate
      .add(6 - dayOfWeek, 'day')
      .endOf('day')
      .toDate();

    // 랭킹 구하기 (유저아이디, 투두 해결 갯수)
    const ranking = await this.historyModel.findRanking(
      previousSunday,
      nextSaturday,
      +count
    );
    // 유저 아이디 배열 만들기
    const userIds = ranking.map((item) => item.userId);
    // 해당 배열로 유저 정보 불러오기
    const userInfo = await this.userModel.findByIdAllUser(userIds);
    // 데이터 정제
    const userInfoMap = userInfo.reduce((map, singleInfo) => {
      map[singleInfo._id.toString()] = singleInfo;
      return map;
    }, {});
    const result = ranking.map((item, index) => {
      const user = userInfoMap[item.userId.toString()]; // O(1)
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
