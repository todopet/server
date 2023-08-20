import { InventoryModel } from "../db/models/index.js";
import mongoose from "mongoose";

class InventoryService {
    constructor() {
        this.inventoryModel = new InventoryModel();
    }

    async getInventoryByUserId(userId) {
        return await this.inventoryModel.findByUserId(userId);
    }

    async addInventory(userId, items) {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error("Invalid userId");
        }

        return await this.inventoryModel.create({
            userId: userId.toString(),
            items
        });
    }

    async updateInventory(userId, inventoryData) {
        const inventory = await this.inventoryModel.findByUserId(userId);
        if (!inventory) {
            throw new Error("Inventory not found");
        }

        const updatedItems = inventory.items.map((existingItem) => {
            const updatedItem = inventoryData.items.find(
                (newItem) => newItem.item === existingItem.item.toString()
            );

            if (updatedItem) {
                existingItem.quantity = updatedItem.quantity;
            }

            return existingItem;
        });

        inventoryData.items.forEach((newItem) => {
            const existingItem = updatedItems.find(
                (item) => item.item.toString() === newItem.item
            );

            if (!existingItem) {
                updatedItems.push({
                    item: newItem.item,
                    quantity: newItem.quantity
                });
            }
        });

        inventory.items = updatedItems;

        return await this.inventoryModel.update(userId, {
            items: updatedItems
        });
    }

    async deleteItemFromInventory(userId, itemId) {
        const inventory = await this.inventoryModel.findByUserId(userId);
        if (!inventory) {
            throw new Error("Inventory not found");
        }

        const updatedItems = inventory.items.filter(
            (item) => item.item.toString() !== itemId
        );
        inventory.items = updatedItems;

        const updatedInventory = await this.inventoryModel.update(userId, {
            items: updatedItems
        });

        return updatedInventory;
    }

    async addItemToInventory(userId, itemId, quantity) {
        const inventory = await this.inventoryModel.findByUserId(userId);

        if (!inventory) {
            throw new Error("Inventory not found");
        }

        const existingItem = inventory.items.find(
            (item) => item.item && item.item.toString() === itemId
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            inventory.items.push({ item: itemId, quantity });
        }

        return await this.inventoryModel.update(userId, {
            items: inventory.items
        });
    }
}

export default InventoryService;
