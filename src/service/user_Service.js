import UserModel from "../db/models/user_Model.js";

class UserService {
    constructor() {
        this.userModel = new UserModel();
    }
    async addUser(userInfo) {
        const { googleId, picture } = userInfo;

        //구글 아이디 중복확인
        const user = await this.userModel.findByGoogleId(googleId);
        if (user) {
            throw new Error("이미 가입되어있는 아이디입니다.");
        }
        const newUserInfo = {
            googleId: userInfo.id,
            picture: userInfo.picture,
            nickname: userInfo.name
        };
        const createdNewUser = await this.userModel.create(newUserInfo);
        return createdNewUser;
    }
}

export default UserService;
