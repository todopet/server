import UserModel from './userModel.js';
import TodoContentModel from './todoContentModel.js';
import TodoCategoryModel from './todoCategoryModel.js';
import ItemModel from './itemModel.js';
import PetModel from './petModel.js';
import MyPetModel from './myPetModel.js';
import InventoryModel from './inventoryModel.js';
import AcheiveModel from './achieveModel.js';
import HistoryModel from './historyModel.js';

import { model } from 'mongoose';
import {
    todoCategorySchema,
    todoContentSchema,
    historySchema
} from '../schemas/index.js';

export {
    UserModel,
    // TodoContentModel,
    TodoCategoryModel,
    HistoryModel,
    ItemModel,
    PetModel,
    MyPetModel,
    InventoryModel,
    AcheiveModel
};

// 의존성 주입 - 코드끼리 엮여있으면 분리하기 어려움 테스트도 어려움
// const todoCategoryMongooseModel = model('todoCategories', todoCategorySchema);
// const todoContentMongooseModel = model('todoContents', todoContentSchema);
// const todoHistoryMongooseModel = model('histories', historySchema);

const todoCategoryMongooseModel = model('todoCategories', todoCategorySchema);
const todoContentMongooseModel = model('todoContents', todoContentSchema);
const HistoryMongooseModel = model('histories', historySchema);

const todoContentModel = new TodoContentModel(
    todoCategoryMongooseModel,
    todoContentMongooseModel,
    HistoryMongooseModel
);
// const todoCategoryModel = new TodoCategoryModel(todoCategoryMongooseModel);
export { todoContentModel };
// const todoContentModel = new TodoContentModel(todoContentMongooseModel);
// const historyModel = new HistoryModel(todoHistoryMongooseModel);

// export { todoCategoryModel, todoContentModel, historyModel };
