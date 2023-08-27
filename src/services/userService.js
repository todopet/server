import { UserModel, HistoryModel } from '../db/models/index.js';
import { InventoryService, MyPetService } from './index.js';
import dayjs from 'dayjs';

class UserService {
    constructor() {
        this.userModel = new UserModel();
        this.inventoryService = new InventoryService();
        this.myPetService = new MyPetService();
        this.historyModel = new HistoryModel();
    }
    async addUser(userInfo) {
        const { googleId, picture } = userInfo;

        const user = await this.userModel.findByGoogleId(googleId);
        if (user) {
            if (user.membershipStatus === 'withdrawn') {
                await this.updateMembershipStatus(user._id, 'active');
                return 'Signup Success (Membership Restored)';
            } else {
                throw new Error('이미 가입되어있는 아이디입니다.');
            }
        }

        const newUserInfo = {
            googleId: userInfo.id,
            picture: userInfo.picture,
            nickname: userInfo.name
        };
        const createdNewUser = await this.userModel.create(newUserInfo);

        // 아래와 같이 이미 인벤토리가 있는지 여부를 체크하여 생성 여부를 결정합니다.
        const existingInventory =
            await this.inventoryService.getInventoryByUserId(
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

    async updateMembershipStatus(userId, status) {
        const updateResult = await this.userModel.updateOne(
            { _id: userId },
            { $set: { membershipStatus: status } }
        );
        return updateResult;
    }

    async withdrawUser(userId) {
        const updateResult = await this.updateMembershipStatus(
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

        // 함께한 날짜 = 현재날짜 - 가입일
        const withPetDate = Math.floor(
            (dayjs() - user.createdAt) / (24 * 60 * 60 * 1000)
        );

        const userHistory = await this.historyModel.findUserHistory(userId);
        const todoCount = userHistory.length;

        userHistory.sort((a, b) =>
            a.createdAt.toString().localeCompare(b.createdAt.toString())
        );
        const historyCount = userHistory.filter((item, index, array) => {
            // 첫 번째 요소는 항상 결과 배열에 포함
            if (index === 0) {
                return true;
            }

            // 현재 요소의 날짜와 이전 요소의 날짜를 비교하여 다른 경우에만 true 반환
            return (
                item.createdAt.toString() !==
                array[index - 1].createdAt.toString()
            );
        }).length;

        user.withPetDate = withPetDate;
        user.todoCount = todoCount;
        user.historyCount = historyCount;

        return user;
    }
}

export default UserService;
