import { InventoryModel } from '../db/models/index.js';
import { ItemService } from './index.js';
import mongoose from 'mongoose';

class InventoryService {
    constructor() {
        this.inventoryModel = new InventoryModel();
        this.itemService = new ItemService();
    }

    async getInventoryByInventoryId(inventoryId) {
        // 인자 이름 변경 및 findById 메서드 사용
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

    async addInventory(userId, items) {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error('Invalid userId');
        }

        return await this.inventoryModel.create({
            userId: userId.toString(),
            items
        });
    }

    async updateInventoryItemQuantity(inventoryId, itemId, quantity) {
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
            (item) => item.item && item.item.toString() === itemId
        );

        if (existingItem) {
            existingItem.quantity += quantity;

            if (existingItem.quantity <= 0) {
                const updatedItems = inventory.items.filter(
                    (item) => item.item.toString() !== itemId
                );
                inventory.items = updatedItems;
            }
        } else if (quantity > 0) {
            const itemInfo = await this.itemService.getItem(itemId);

            if (!itemInfo) {
                throw new Error('Item not found');
            }

            inventory.items.push({
                item: itemId,
                quantity,
                info: itemInfo
            });
        } else {
            throw new Error('Item not found in inventory');
        }

        return await this.inventoryModel.update(inventoryId, {
            items: inventory.items
        });
    }

    async deleteInventoryItem(inventoryId, itemId) {
        const inventory = await this.inventoryModel.findByInventoryId(
            inventoryId
        );

        if (!inventory) {
            throw new Error('Inventory not found');
        }

        const updatedItems = inventory.items.filter(
            (item) => item.item.toString() !== itemId
        );

        return await this.inventoryModel.update(inventoryId, {
            items: updatedItems
        });
    }

    async addItemToInventory(inventoryId, itemId, quantity) {
        // 인자 이름 변경
        const inventory = await this.inventoryModel.findByInventoryId(
            inventoryId
        );

        if (!inventory) {
            throw new Error('Inventory not found');
        }

        const existingItem = inventory.items.find(
            (item) => item.item && item.item.toString() === itemId
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            // 아이템 정보 가져오기
            const itemInfo = await this.itemService.getItem(itemId);

            if (!itemInfo) {
                throw new Error('Item not found');
            }

            inventory.items.push({
                item: itemId,
                quantity,
                info: itemInfo // 아이템 정보 추가
            });
        }

        return await this.inventoryModel.update(inventoryId, {
            // inventoryId 사용
            items: inventory.items
        });
    }
}

export default InventoryService;
