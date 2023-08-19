import { model } from "mongoose";
import { itemSchema } from "../schemas/index.js";

const Item = model("items", itemSchema);

class ItemModel {
    async find(id) {
        return await Item.findById(id).lean();
    }
    async create(item) {
        return (await Item.create(item)).toObject();
    }
    async update(id, item) {
        return (await Item.findByIdAndUpdate(id, item)).toObject();
    }
    async delete(id) {
        return await Item.findByIdAndDelete(id);
    }
}

export default ItemModel;
