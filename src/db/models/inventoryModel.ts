// @ts-nocheck
import { model } from 'mongoose';
import { inventorySchema } from '../schemas/index.ts';

const InventoryCategory = model('inventories', inventorySchema);

class InventoryModel {
    async findById(inventoryId) {
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

    async adjustItemQuantityByInventoryItemId(
        inventoryId,
        inventoryItemId,
        quantityDelta,
        requireAvailable = false
    ) {
        const filter = requireAvailable && quantityDelta < 0
            ? {
                  _id: inventoryId,
                  items: {
                      $elemMatch: {
                          _id: inventoryItemId,
                          quantity: { $gte: Math.abs(quantityDelta) }
                      }
                  }
              }
            : {
                  _id: inventoryId,
                  'items._id': inventoryItemId
              };

        return await InventoryCategory.findOneAndUpdate(
            filter,
            { $inc: { 'items.$.quantity': quantityDelta } },
            { new: true }
        ).lean();
    }

    async adjustItemQuantityByItemId(inventoryId, itemId, quantityDelta) {
        return await InventoryCategory.findOneAndUpdate(
            {
                _id: inventoryId,
                'items.item': itemId
            },
            {
                $inc: {
                    'items.$.quantity': quantityDelta
                }
            },
            { new: true }
        ).lean();
    }

    async addItemIfNotExists(inventoryId, itemId, quantity) {
        return await InventoryCategory.findOneAndUpdate(
            {
                _id: inventoryId,
                'items.item': { $ne: itemId }
            },
            {
                $push: {
                    items: { item: itemId, quantity }
                }
            },
            { new: true }
        ).lean();
    }

    async removeInventoryItem(inventoryId, inventoryItemId) {
        return await InventoryCategory.findOneAndUpdate(
            { _id: inventoryId },
            {
                $pull: {
                    items: { _id: inventoryItemId }
                }
            },
            { new: true }
        ).lean();
    }

    async removeItemByItemId(inventoryId, itemId) {
        return await InventoryCategory.findOneAndUpdate(
            { _id: inventoryId },
            {
                $pull: {
                    items: { item: itemId }
                }
            },
            { new: true }
        ).lean();
    }

    async removeNonPositiveQuantityItemByInventoryItemId(
        inventoryId,
        inventoryItemId
    ) {
        return await InventoryCategory.findOneAndUpdate(
            { _id: inventoryId },
            {
                $pull: {
                    items: {
                        _id: inventoryItemId,
                        quantity: { $lte: 0 }
                    }
                }
            },
            { new: true }
        ).lean();
    }

    async removeNonPositiveQuantityItemByItemId(inventoryId, itemId) {
        return await InventoryCategory.findOneAndUpdate(
            { _id: inventoryId },
            {
                $pull: {
                    items: {
                        item: itemId,
                        quantity: { $lte: 0 }
                    }
                }
            },
            { new: true }
        ).lean();
    }
}

export default InventoryModel;
