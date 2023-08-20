import { model } from "mongoose";
import { inventorySchema } from "../schemas/index.js";

const InventoryCategory = model("inventories", inventorySchema);

class InventoryModel {
    async findByUserId(userId) {
        return await InventoryCategory.findOne({ userId: userId }).lean(); // ObjectId로 변환하여 사용
    }

    async create(inventory) {
        return (await InventoryCategory.create(inventory)).toObject();
    }

    async update(userId, inventory) {
        const updatedInventory = await InventoryCategory.findOneAndUpdate(
            { userId },
            inventory,
            { new: true }
        );
        return updatedInventory;
    }

    async delete(userId) {
        return await InventoryCategory.findOneAndDelete({ userId }).lean();
    }
}

export default InventoryModel;
