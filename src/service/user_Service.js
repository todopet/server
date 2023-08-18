import UserModel from "../db/models/user_Model.js";

class UserService {
    constructor() {
        this.userModel = new UserModel();
    }
    async addUser(userInfo) {
        const { googleId, picture } = userInfo;

        const user = await this.userModel.findByGoogleId(googleId);
        if (user) {
            if (user.membershipStatus === "withdrawn") {
                await this.userModel.updateMembershipStatus(user._id, "active");
                return "Signup Success (Membership Restored)";
            } else {
                throw new Error("이미 가입되어있는 아이디입니다.");
            }
        }

        const newUserInfo = {
            googleId: userInfo.id,
            picture: userInfo.picture,
            nickname: userInfo.name
        };
        const createdNewUser = await this.userModel.create(newUserInfo);
        return "Signup Success";
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
        const updateResult = await this.userModel.updateMembershipStatus(
            userId,
            "withdrawn"
        );
        return updateResult;
    }
}

export default UserService;
