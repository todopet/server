import { model } from "mongoose";
import { userSchema } from "../schemas/index.js";

const User = model("users", userSchema);

class UserModel {
    constructor() {
        this.userProjection = { password: 0, __v: 0 };
    }

    async create(newUser) {
        const existingUser = await User.findOne({ googleId: newUser.googleId });
        if (existingUser) {
            throw new Error("이미 가입되어있는 유저입니다."); // 중복된 googleId가 있는 경우 에러를 던짐
        }

        const createNewUser = await User.create(newUser);
        return createNewUser;
    }

    async findAll() {
        const users = await User.find({}, this.userProjection);
        return users;
    }

    async findByGoogleId(googleId) {
        const user = await User.findOne({ googleId });
        return user;
    }

    async findById(userId) {
        const user = await User.findById(userId);
        return user;
    }

    async update({ userId, update }) {
        const filter = { _id: userId };
        const option = {
            returnOriginal: false,
            select: this.userProjection
        };

        const updatedUser = await User.findOneAndUpdate(filter, update, option);
        return updatedUser;
    }

    async updateMembershipStatus(userId, status) {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }

        user.membershipStatus = status; // 상태 변경
        await user.save(); // 변경 사항을 데이터베이스에 저장

        return user; // 업데이트된 사용자 정보 반환
    }
}

export default UserModel;
