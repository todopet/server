// @ts-nocheck
import UserModel from './userModel.ts';
import TodoContentModel from './todoContentModel.ts';
import TodoCategoryModel from './todoCategoryModel.ts';
import ItemModel from './itemModel.ts';
import PetModel from './petModel.ts';
import MyPetModel from './myPetModel.ts';
import InventoryModel from './inventoryModel.ts';
import AcheiveModel from './achieveModel.ts';
import HistoryModel from './historyModel.ts';
import BadgeModel from './badgeModel.ts';

import { model } from 'mongoose';
import {
    todoCategorySchema,
    todoContentSchema,
    historySchema
} from '../schemas/index.ts';

export {
    UserModel,
    // TodoContentModel,
    TodoCategoryModel,
    HistoryModel,
    ItemModel,
    PetModel,
    MyPetModel,
    InventoryModel,
    AcheiveModel,
    BadgeModel
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
