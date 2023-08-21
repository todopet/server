import mongoose from 'mongoose';
import { todoCategoryModel, todoContentModel, historyModel } from './index.js';

class TodoContentModel {
    constructor() {
        this.todoCategoryModel = todoCategoryModel;
        this.todoContentModel = todoContentModel;
        this.historyModel = historyModel;
    }
    async findByCategoryId(id) {
        return await this.todoContentModel.find({ categoryId: id }).lean();
    }
    async findById(id) {
        return await this.todoContentModel.findById(id).lean();
    }
    async create(content) {
        const { categoryId, todo } = content;

        return (
            await this.todoContentModel.create({
                categoryId,
                todo
            })
        ).toObject();
    }
    async update(content) {
        const { id, todo, status } = content;
        // 히스토리 조회해서 데이터 있으면 보상주고 아님 안줌
        // 인벤토리에 데이터 꽂아줌
        // console.log(id, userId, contentId);
        // const history = await this.historyModel.findOne({
        //     contentId
        // });
        // console.log(history);

        // 히스토리에 내용 저장
        // await History.create({ userId, contentId: todoContent._id });
        // console.log(
        //     await TodoCategory.findOne({
        //         _id: new mongoose.Types.ObjectId(id), // 문서의 _id
        //         "todos._id": contentId // todo 객체의 _id
        //     })
        // );
        return await this.todoContentModel
            .findByIdAndUpdate(id, {
                todo,
                status
            })
            .lean();
        // TODO: 변화된 데이터만 리턴해 내고 싶은데 그렇게는 할 수 없을까?
        // return (
        //     await this.todoCategoryModel.findOneAndUpdate(
        //         {
        //             _id: id, // 문서의 _id
        //             'todos._id': contentId // todo 객체의 _id
        //         },
        //         {
        //             $set: {
        //                 'todos.$.todo': todo,
        //                 'todos.$.status': status
        //             }
        //         },
        //         { new: true }
        //     )
        // ).lean();
    }

    async delete(categoryId, contentId) {
        const id = new mongoose.Types.ObjectId(categoryId);
        return await this.todoCategoryModel.findByIdAndUpdate(id, {
            $pull: { todos: { _id: new mongoose.Types.ObjectId(contentId) } }
        });
    }
}

export default TodoContentModel;
