import userModel from "../db/models/user_Model";

class UserService {
    constructor(userModel) {
        this.userModel = userModel;
    }
    async addUser(userInfo) {
        const { googleId, picture } = userInfo;

        //구글 아이디 중복확인
        const user = await userModel.findByGoogleId(googleId);
        if (user) {
            throw new Error("이미 가입되어있는 아이디입니다.");
        }
        const newUserInfo = {
            googleId: googleId,
            picture: picture,
            nickname: userInfo.name
        };
        const createdNewUser = await userModel.create(newUserInfo);
        return createdNewUser;
    }
}

export default UserService;
