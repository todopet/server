import { UserModel } from '../db/models/index.js';
import { InventoryService, MyPetService } from './index.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';

dayjs.extend(utc);

class UserService {
    constructor() {
        this.userModel = new UserModel();
        this.inventoryService = new InventoryService();
        this.myPetService = new MyPetService();
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
}

export default UserService;
