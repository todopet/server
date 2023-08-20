import { model } from "mongoose";
import { itemSchema } from "../schemas/index.js";

const Item = model("items", itemSchema);

class ItemModel {
    async findById(id) {
        return await Item.findById(id);
    }
    async create(item) {
        return (await Item.create(item)).toObject();
    }
    async update(id, item) {
        const updatedItem = await Item.findByIdAndUpdate(id, item, {
            new: true
        }).lean();
        return updatedItem;
    }
    async delete(id) {
        return await Item.findByIdAndDelete(id).lean();
    }
}

export default ItemModel;
