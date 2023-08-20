import mongoose, { model } from "mongoose";
import {
    historySchema,
    todoCategorySchema,
    todoContentSchema
} from "../schemas/index.js";

const TodoContent = model("todoContents", todoContentSchema);
const TodoCategory = model("todoCategories", todoCategorySchema);
const History = model("histories", historySchema);

class TodoContentModel {
    // async find(id) {
    //     // TODO: 날짜 오름차순, 내림차순 정렬 필요?
    //     return await TodoContent.find({ userId: id }).lean();
    // }
    // async findById(id) {
    //     // TODO: 날짜 오름차순, 내림차순 정렬 필요?
    //     return await TodoContent.findById(id, { userId }).lean();
    // }
    async create(content) {
        const { categoryId, userId, todo } = content;
        // content 등록 후 그 내용을 category에 저장
        const todoContent = await TodoContent.create({
            userId,
            categoryId,
            todo
        });
        console.log("todoContent");
        // console.log(todoContent);
        const id = categoryId;

        // 카테고리 아래에 content 저장
        await TodoCategory.findByIdAndUpdate(id, {
            $push: { todos: todoContent }
        });

        return todoContent.toObject();
    }
    async update(content) {
        const { categoryId: id, userId, contentId, todo, status } = content;
        // 히ㅏ스토리 조회해서 데이터 있으면 보상주고 아님 안줌
        // 인벤토리에 데이터 꽂아줌
        // console.log(id, userId, contentId);
        const history = await History.findOne({
            userId: new mongoose.Types.ObjectId(userId),
            contentId
        });
        // console.log(history);

        // 히스토리에 내용 저장
        // await History.create({ userId, contentId: todoContent._id });
        // console.log(
        //     await TodoCategory.findOne({
        //         _id: new mongoose.Types.ObjectId(id), // 문서의 _id
        //         "todos._id": contentId // todo 객체의 _id
        //     })
        // );

        // TODO: 변화된 데이터만 리턴해 내고 싶은데 그렇게는 할 수 없을까?
        return (
            await TodoCategory.findOneAndUpdate(
                {
                    _id: new mongoose.Types.ObjectId(id), // 문서의 _id
                    "todos._id": new mongoose.Types.ObjectId(contentId) // todo 객체의 _id
                },
                {
                    $set: {
                        "todos.$.todo": todo,
                        "todos.$.status": status
                    }
                },
                { new: true }
            )
        ).toObject();
    }

    async delete(categoryId, contentId) {
        const id = new mongoose.Types.ObjectId(categoryId);
        return await TodoCategory.findByIdAndUpdate(id, {
            $pull: { todos: { _id: new mongoose.Types.ObjectId(contentId) } }
        });
    }
}

export default TodoContentModel;
