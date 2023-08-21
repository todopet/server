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
    TodoContentModel,
    TodoCategoryModel,
    ItemModel,
    PetModel,
    MyPetModel,
    InventoryModel,
    AcheiveModel,
    HistoryModel
};

// 의존성 주입
const todoCategoryModel = model('todoCategories', todoCategorySchema);
const todoContentModel = model('todoContents', todoContentSchema);
const historyModel = model('histories', historySchema);

export { todoCategoryModel, todoContentModel, historyModel };
