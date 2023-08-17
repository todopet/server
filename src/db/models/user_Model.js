import { model } from "mongoose";
import userSchema from '../schemas/user_Schema';

const User = model('users', userSchema);

class userModel {
  constructor() {
    this.userProjection = { password: 0, __v: 0 };
  }

  async create(newUser) {
    const createNewUser = await User.create(newUser);
    return createNewUser;
  }

  async findAll() {
    const users = await User.find({}, this.userProjection);
    return users;
  }

  async findByGoogleId() {
    const user = await User.findOne({ googleId });
    return user;
  }

  async update({ userId, update }) {
    const filter = { _id: userId };
    const option = {
      returnOriginal: false,
      select: this.userProjection,
    };

    const updatedUser = await User.findOneAndUpdate(filter, update, option);
    return updatedUser;
  }
}

export default userModel;