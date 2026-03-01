// @ts-nocheck
import { UserModel, HistoryModel } from '../db/models/index.ts';
import {
  InventoryService,
  MyPetService,
  TodoCategoryService,
  TodoContentService
} from './index.ts';
import { setKoreaDay, formatDateToString } from '../utils/common.ts';

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
      categoryId: category1._id,
      todo: '할일1',
      date: formatDateToString(
        new Date(new Date().getTime() + 9 * 60 * 60 * 1000)
      )
    });
    await this.todoContentService.addContent({
      categoryId: category1._id,
      todo: '할일2',
      date: formatDateToString(
        new Date(new Date().getTime() + 9 * 60 * 60 * 1000)
      )
    });
    const category2 = await this.todoCategoryService.addCategory({
      userId: createdNewUser._id,
      category: '목표2'
    });
    await this.todoContentService.addContent({
      categoryId: category2._id,
      todo: '할일3',
      date: formatDateToString(
        new Date(new Date().getTime() + 9 * 60 * 60 * 1000)
      )
    });
    await this.todoContentService.addContent({
      categoryId: category2._id,
      todo: '할일4',
      date: formatDateToString(
        new Date(new Date().getTime() + 9 * 60 * 60 * 1000)
      )
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
    // if (newNickname.trim() === '') {
    //   throw new Error(
    //     '닉네임은 한글 6글자 또는 영어 12글자 이하로 설정해야 합니다.'
    //   );
    // }
    const maxCharacterLength = 8; // 모든 글자에 대한 최대 글자 수
    if (newNickname.trim() !== newNickname) {
      return null;
    }

    if (newNickname.split(' ').length > 1) {
      return null;
    }

    if (newNickname.length <= maxCharacterLength && newNickname.length > 0) {
      const updatedUser = await this.userModel.updateNickname(
        userId,
        newNickname
      );
      return updatedUser;
    } else {
      return null;
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
