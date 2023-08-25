import { model } from 'mongoose';
import { inventorySchema } from '../schemas/index.js';

const InventoryCategory = model('inventories', inventorySchema);

class InventoryModel {
    async findByInventoryId(inventoryId) {
        return await InventoryCategory.findOne({ _id: inventoryId }).lean();
    }
    async findByUserId(userId) {
        return await InventoryCategory.findOne({ userId }).lean();
    }

    async create(inventory) {
        return (await InventoryCategory.create(inventory)).toObject();
    }

    async update(inventoryId, inventory) {
        const updatedInventory = await InventoryCategory.findOneAndUpdate(
            { _id: inventoryId },
            inventory,
            { new: true }
        );
        return updatedInventory;
    }

    async delete(inventoryId) {
        return await InventoryCategory.findOneAndDelete({
            _id: inventoryId
        }).lean();
    }
}

export default InventoryModel;
