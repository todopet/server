import { InventoryModel, ItemModel } from '../db/models/index.js';
import { ItemService } from './index.js';
import mongoose from 'mongoose';

class InventoryService {
  constructor() {
    this.inventoryModel = new InventoryModel();
    this.itemModel = new ItemModel();
    this.itemService = new ItemService();
  }

  validateQuantity(quantity, { allowNegative = false } = {}) {
    const normalizedQuantity = Number(quantity);

    if (!Number.isInteger(normalizedQuantity)) {
      throw new Error('Invalid quantity');
    }

    if (normalizedQuantity === 0) {
      throw new Error('Quantity must not be zero');
    }

    if (!allowNegative && normalizedQuantity < 0) {
      throw new Error('Quantity must be greater than zero');
    }

    return normalizedQuantity;
  }

  async getInventoryById(inventoryId) {
    const inventory = await this.inventoryModel.findById(inventoryId);

    if (!inventory) {
      throw new Error('Inventory not found');
    }

    // 아이템 정보 가져오기
    const itemsWithInfo = await Promise.all(
      inventory.items.map(async (item) => {
        const itemInfo = await this.itemModel.findById(item.item);
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

  async getInventoryByUserId(userId) {
    const inventory = await this.inventoryModel.findByUserId(userId);

    if (!inventory) {
      return null;
    }

    // 아이템 정보 가져오기
    const itemsWithInfo = await Promise.all(
      inventory.items.map(async (item) => {
        const itemInfo = await this.itemModel.findById(item.item);
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
  async getInventoryItem(inventoryId, itemId) {
    const inventory = await this.inventoryModel.findById(inventoryId);

    if (!inventory) {
      throw new Error('Inventory not found');
    }

    const itemInInventory = inventory.items.find(
      (item) => item.item && item.item.toString() === itemId
    );

    if (itemInInventory) {
      return itemInInventory;
    }
    return null;
  }
  async getInventoryItemByInventoryItemId(userId, inventoryItemId) {
    const inventoryId = await this.getInventoryIdByUserId(userId);
    const inventory = await this.inventoryModel.findById(inventoryId);

    if (!inventory) {
      throw new Error('Inventory not found');
    }

    const itemInInventory = inventory.items.find(
      (item) => item._id.toString() === inventoryItemId
    );

    if (!itemInInventory) {
      throw new Error('Item not found in inventory');
    }

    const itemInfo = await this.itemService.getItem(itemInInventory.item);

    return {
      ...itemInInventory,
      info: itemInfo
    };
  }

  async getInventoryItemById(inventoryId, itemId) {
    const inventory = await this.getInventoryById(inventoryId);

    const item = inventory.items.find((item) => item._id.toString() === itemId);

    if (!item) {
      throw new Error('Item not found in inventory');
    }

    return item;
  }

  async getInventoryItemWithQuantity(inventoryId, itemId) {
    const inventory = await this.inventoryModel.findById(inventoryId);

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
    }
    return null;
  }

  async getInventoryCount(inventoryId) {
    const inventory = await this.inventoryModel.findById(inventoryId);

    let totalQuantity = 0;
    for (const item of inventory.items) {
      totalQuantity += item.quantity;
    }
    return totalQuantity;
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

  async useItemAndUpdateInventory(userId, inventoryItemId, useQuantity) {
    const quantity = this.validateQuantity(useQuantity);

    const inventoryId = await this.getInventoryIdByUserId(userId);
    const usedItems = await this.getInventoryItemByInventoryItemId(
      userId,
      inventoryItemId
    );

    const updatedInventory =
      await this.inventoryModel.adjustItemQuantityByInventoryItemId(
        inventoryId,
        inventoryItemId,
        -quantity,
        true
      );

    if (!updatedInventory) {
      throw new Error('Item not found in inventory or insufficient quantity');
    }

    await this.inventoryModel.removeNonPositiveQuantityItemByInventoryItemId(
      inventoryId,
      inventoryItemId
    );

    return usedItems;
  }

  async updateInventoryItemQuantity(inventoryId, inventoryItemId, quantity) {
    const adjustedQuantity = this.validateQuantity(quantity, {
      allowNegative: true
    });

    const updatedInventory =
      await this.inventoryModel.adjustItemQuantityByInventoryItemId(
        inventoryId,
        inventoryItemId,
        adjustedQuantity,
        adjustedQuantity < 0
      );

    if (!updatedInventory) {
      throw new Error('Item not found in inventory or insufficient quantity');
    }

    return await this.inventoryModel.removeNonPositiveQuantityItemByInventoryItemId(
      inventoryId,
      inventoryItemId
    );
  }

  async updateInventoryItemReward(inventoryId, inventoryItemId, quantity) {
    const rewardQuantity = this.validateQuantity(quantity);

    const updatedInventory = await this.inventoryModel.adjustItemQuantityByItemId(
      inventoryId,
      inventoryItemId,
      rewardQuantity
    );

    if (!updatedInventory) {
      throw new Error('Item not found in inventory');
    }

    return updatedInventory;
  }
  async deleteInventoryItem(inventoryId, inventoryItemId) {
    return await this.inventoryModel.removeInventoryItem(
      inventoryId,
      inventoryItemId
    );
  }

  async addItemToInventory(inventoryId, itemId, quantity) {
    const addQuantity = this.validateQuantity(quantity);

    const itemInfo = await this.itemService.getItem(itemId);

    if (!itemInfo) {
      throw new Error('Item not found');
    }

    const updatedExisting = await this.inventoryModel.adjustItemQuantityByItemId(
      inventoryId,
      itemId,
      addQuantity
    );
    if (updatedExisting) {
      return updatedExisting;
    }

    const inserted = await this.inventoryModel.addItemIfNotExists(
      inventoryId,
      itemId,
      addQuantity
    );
    if (inserted) {
      return inserted;
    }

    const updatedAfterRace =
      await this.inventoryModel.adjustItemQuantityByItemId(
        inventoryId,
        itemId,
        addQuantity
      );

    if (!updatedAfterRace) {
      throw new Error('Inventory not found');
    }

    return updatedAfterRace;
  }
  async addSelectedItemToInventory(userId, itemId, quantity) {
    const addQuantity = this.validateQuantity(quantity);

    const inventoryId = await this.getInventoryIdByUserId(userId);

    return await this.addItemToInventory(inventoryId, itemId, addQuantity);
  }
  //회원 탈퇴시 인벤토리 삭제
  async deleteInventoryByUserId(userId) {
    const inventory = await this.getInventoryByUserId(userId);

    if (inventory) {
      await this.inventoryModel.delete(inventory._id);
    }
  }
}

export default InventoryService;
