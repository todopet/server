import { InventoryModel } from '../db/models/index.js';
import { ItemService } from './index.js';
import mongoose from 'mongoose';

class InventoryService {
    constructor() {
        this.inventoryModel = new InventoryModel();
        this.itemService = new ItemService();
    }

    async getInventoryByInventoryId(inventoryId) {
        const inventory = await this.inventoryModel.findByInventoryId(
            inventoryId
        );

        if (!inventory) {
            throw new Error('Inventory not found');
        }

        // 아이템 정보 가져오기
        const itemsWithInfo = await Promise.all(
            inventory.items.map(async (item) => {
                const itemInfo = await this.itemService.getItem(item.item);
                return {
                    ...item,
                    info: itemInfo // 아이템 정보 추가
                };
            })
        );

        return {
            ...inventory,
            items: itemsWithInfo // 아이템 정보 포함하여 반환
        };
    }

    async getInventoryIdByUserId(userId) {
        const inventory = await this.inventoryModel.findByUserId(userId);

        if (!inventory) {
            throw new Error(`Inventory not found for userId: ${userId}`);
        }

        return inventory._id.toString();
    }

    async getInventoryItem(inventoryId, itemId) {
        const inventory = await this.inventoryModel.findByInventoryId(
            inventoryId
        );

        if (!inventory) {
            throw new Error('Inventory not found');
        }

        const itemInInventory = inventory.items.find(
            (item) => item.item && item.item.toString() === itemId
        );

        if (itemInInventory) {
            return itemInInventory;
        } else {
            return null;
        }
    }

    async getInventoryItemById(inventoryId, itemId) {
        const inventory = await this.getInventoryByInventoryId(inventoryId);

        const item = inventory.items.find(
            (item) => item._id.toString() === itemId
        );

        if (!item) {
            throw new Error('Item not found in inventory');
        }

        return item;
    }

    async getInventoryItemWithQuantity(inventoryId, itemId) {
        const inventory = await this.inventoryModel.findByInventoryId(
            inventoryId
        );

        if (!inventory) {
            throw new Error('Inventory not found');
        }

        const itemInInventory = inventory.items.find(
            (item) => item.item && item.item.toString() === itemId
        );

        if (itemInInventory) {
            return {
                item: itemInInventory.info,
                quantity: itemInInventory.quantity
            };
        } else {
            return null;
        }
    }
    async addInventory(userId, items) {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error('Invalid userId');
        }

        return await this.inventoryModel.create({
            userId: userId.toString(),
            items
        });
    }

    async updateInventoryItemQuantity(inventoryId, inventoryItemId, quantity) {
        const inventory = await this.inventoryModel.findByInventoryId(
            inventoryId
        );

        if (!inventory) {
            throw new Error('Inventory not found');
        }

        if (isNaN(quantity)) {
            throw new Error('Invalid quantity');
        }

        const existingItem = inventory.items.find(
            (item) => item._id.toString() === inventoryItemId
        );

        if (existingItem) {
            existingItem.quantity += quantity;

            if (existingItem.quantity <= 0) {
                const updatedItems = inventory.items.filter(
                    (item) => item._id.toString() !== inventoryItemId
                );
                inventory.items = updatedItems;
            }
        } else {
            throw new Error('Item not found in inventory');
        }

        await this.inventoryModel.update(inventoryId, {
            items: inventory.items
        });

        return inventory;
    }

    async deleteInventoryItem(inventoryId, inventoryItemId) {
        const inventory = await this.inventoryModel.findByInventoryId(
            inventoryId
        );

        if (!inventory) {
            throw new Error('Inventory not found');
        }

        const updatedItems = inventory.items.filter(
            (item) => item._id.toString() !== inventoryItemId
        );

        return await this.inventoryModel.update(inventoryId, {
            items: updatedItems
        });
    }

    async addItemToInventory(inventoryId, itemId, quantity) {
        const inventory = await this.inventoryModel.findByInventoryId(
            inventoryId
        );

        if (!inventory) {
            throw new Error('Inventory not found');
        }

        const existingItemIndex = inventory.items.findIndex(
            (item) => item.item.toString() === itemId
        );

        if (existingItemIndex !== -1) {
            // 이미 있는 아이템인 경우 수량 증가
            inventory.items[existingItemIndex].quantity += quantity;
        } else {
            // 아이템 정보 가져오기
            const itemInfo = await this.itemService.getItem(itemId);

            if (!itemInfo) {
                throw new Error('Item not found');
            }

            // 새로운 아이템 추가
            inventory.items.push({
                item: itemId,
                quantity,
                info: itemInfo
            });
        }

        return await this.inventoryModel.update(inventoryId, {
            items: inventory.items
        });
    }
}

export default InventoryService;
