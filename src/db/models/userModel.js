import { model } from 'mongoose';
import { userSchema } from '../schemas/index.js';

const User = model('users', userSchema);

class UserModel {
    constructor() {
        this.userProjection = { password: 0, __v: 0 };
    }

    async create(newUser) {
        const existingUser = await User.findOne({ googleId: newUser.googleId });
        if (existingUser) {
            throw new Error('이미 가입되어있는 유저입니다.');
        }

        const createNewUser = await User.create(newUser);
        // 새로운 문서를 객체로 변환하여 반환
        return createNewUser.toObject();
    }

    async findAll() {
        const users = await User.find({}, this.userProjection).lean();
        return users;
    }

    async findByGoogleId(googleId) {
        const user = await User.findOne({ googleId }).lean();
        return user;
    }

    async findById(userId) {
        const user = await User.findById(userId).lean();
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }

    async findByIdAllUser(userIds) {
        const users = await User.find(
            { _id: { $in: userIds }, membershipStatus: 'active' },
            { membershipStatus: 0, createdAt: 0, updatedAt: 0 }
        );
        return users;
    }

    async update({ userId, update }) {
        const filter = { _id: userId };
        const option = {
            returnOriginal: false,
            select: this.userProjection
        };

        const updatedUser = await User.findOneAndUpdate(
            filter,
            update,
            option
        ).lean();
        return updatedUser;
    }

    async updateNickname(userId, newNickname) {
        const updatedUser = await User.findOneAndUpdate(
            { _id: userId },
            { nickname: newNickname },
            { new: true, lean: true }
        );
        return updatedUser;
    }

    async updateMembershipStatus(userId, status) {
        const updatedUser = await User.findOneAndUpdate(
            { _id: userId },
            { membershipStatus: status },
            { new: true, lean: true }
        );
        return updatedUser;
    }
}

export default UserModel;
