import { UserModel, HistoryModel } from '../db/models/index.js';
import {
  InventoryService,
  MyPetService,
  TodoCategoryService,
  TodoContentService
} from './index.js';
import { setKoreaDay, formatDateToString } from '../utils/common.js';

class UserService {
  constructor() {
    this.userModel = new UserModel();
    this.inventoryService = new InventoryService();
    this.myPetService = new MyPetService();
    this.historyModel = new HistoryModel();
    this.todoCategoryService = new TodoCategoryService();
    this.todoContentService = new TodoContentService();
  }
  async addUser(userInfo) {
    const newUserInfo = {
      googleId: userInfo.id,
      picture: userInfo.picture,
      nickname: userInfo.name
    };
    const createdNewUser = await this.userModel.create(newUserInfo);

    // 아래와 같이 이미 인벤토리가 있는지 여부를 체크하여 생성 여부를 결정합니다.
    const existingInventory = await this.inventoryService.getInventoryByUserId(
      createdNewUser._id
    );
    if (!existingInventory) {
      // 인벤토리가 없을 경우에만 생성
      await this.inventoryService.addInventory(createdNewUser._id, []);
    }

    // 펫보관함 생성 로직 추가
    const existingPetStorage = await this.myPetService.getMyPet(
      createdNewUser._id
    );
    if (!existingPetStorage) {
      await this.myPetService.addPetStorage(createdNewUser._id, []);
    }

    // 목표 및 할일 추가
    const category1 = await this.todoCategoryService.addCategory({
      userId: createdNewUser._id,
      category: '목표1'
    });
    await this.todoContentService.addContent({
      categoryId: category1._id.toString(),
      todo: '할일1',
      date: formatDateToString(new Date())
    });
    await this.todoContentService.addContent({
      categoryId: category1._id.toString(),
      todo: '할일2',
      date: formatDateToString(new Date())
    });
    const category2 = await this.todoCategoryService.addCategory({
      userId: createdNewUser._id,
      category: '목표2'
    });
    await this.todoContentService.addContent({
      categoryId: category2._id.toString(),
      todo: '할일3',
      date: formatDateToString(new Date())
    });
    await this.todoContentService.addContent({
      categoryId: category2._id.toString(),
      todo: '할일4',
      date: formatDateToString(new Date())
    });

    return createdNewUser; // 사용자 정보 반환
  }

  async findUserById(userId) {
    const user = await this.userModel.findById(userId);
    return user;
  }

  async findByGoogleId(googleId) {
    const user = await this.userModel.findByGoogleId(googleId);
    return user;
  }

  async updateUserMembershipStatus(userId, newStatus) {
    const updatedUser = await this.userModel.updateMembershipStatus(
      userId,
      newStatus
    );
    return updatedUser;
  }
  async updateUserNickname(userId, newNickname) {
    if (newNickname.trim() === '') {
      throw new Error(
        '닉네임은 한글 6글자 또는 영어 12글자 이하로 설정해야 합니다.'
      );
    }

    // 한글은 1글자, 영어와 숫자는 0.5글자, 특수문자는 1글자로 계산합니다.
    const koreanCount = (newNickname.match(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g) || [])
      .length;
    const englishCount = (newNickname.match(/[a-zA-Z]/g) || []).length * 0.5;
    const numberCount = (newNickname.match(/[0-9]/g) || []).length * 0.5;
    const specialCharCount = (
      newNickname.match(/[^ㄱ-ㅎ|ㅏ-ㅣ|가-힣|a-zA-Z0-9]/g) || []
    ).length;

    const totalLength =
      koreanCount + englishCount + numberCount + specialCharCount;

    if (totalLength <= 6) {
      const updatedUser = await this.userModel.updateNickname(
        userId,
        newNickname
      );
      return updatedUser.nickname;
    } else {
      return null;
    }
  }

  async WithdrawUserAndToken(userId) {
    try {
      // 회원 탈퇴 처리와 새로운 토큰 발급 수행
      const newToken = await this.withdrawUser(userId);

      return newToken; // 새로운 토큰 반환
    } catch (error) {
      console.error('Error withdrawing user:', error);
      throw error; // 에러 다시 throw
    }
  }

  async withdrawUser(userId) {
    const updateResult = await this.userModel.updateMembershipStatus(
      userId,
      'withdrawn'
    );
    return updateResult;
  }

  async getUserInfo(userId) {
    // 가입일 (기본 유저정보에 있음)
    // 함께한 날짜 (현재날짜에서 가입일 뺀 다음 일자로 반환)
    // todo history 남겨져 있는 날짜의 갯수 구해야함
    // todo history 남겨져 있는 history 전체 갯수 구해야함
    const user = await this.userModel.findById(userId);
    // 함께한 날짜
    const withPetDate = setKoreaDay(user.createdAt);
    const userHistory = await this.historyModel.findUserHistory(userId);

    // todo를 달성한 횟수
    const todoCount = userHistory.length;

    userHistory.sort((a, b) =>
      a.createdAt.toString().localeCompare(b.createdAt.toString())
    );

    // todo를 달성한 날짜
    const historyCount = userHistory.filter((item, index, array) => {
      // 첫 번째 요소는 항상 결과 배열에 포함
      if (index === 0) {
        return true;
      }
      // 현재 요소의 날짜와 이전 요소의 날짜를 비교하여 다른 경우에만 true 반환
      return (
        formatDateToString(item.createdAt) !==
        formatDateToString(array[index - 1].createdAt)
      );
    }).length;

    user.withPetDate = withPetDate;
    user.todoCount = todoCount;
    user.historyCount = historyCount;

    return user;
  }
}

export default UserService;
