import { model } from "mongoose";
import { itemSchema } from "../schemas/index.js";

const ItemCategory = model("items", itemSchema);

class ItemModel {
    async find(id) {
        return await ItemCategory.findById(id).lean();
    }
    async create(item) {
        return (await ItemCategory.create(item)).toObject();
    }
    async update(id, item) {
        return (await ItemCategory.findByIdAndUpdate(id, item)).toObject();
    }
    async delete(id) {
        return await ItemCategory.findByIdAndDelete(id);
    }
}

export default ItemModel;
