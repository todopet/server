import { InventoryModel, ItemModel } from '../db/models/index.js';
import { ItemService } from './index.js';
import mongoose from 'mongoose';

class InventoryService {
  constructor() {
    this.inventoryModel = new InventoryModel();
    this.itemModel = new ItemModel();
    this.itemService = new ItemService();
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
    const inventoryId = await this.getInventoryIdByUserId(userId);

    const inventory = await this.inventoryModel.findById(inventoryId);
    if (!inventory) {
      throw new Error('Inventory not found');
    }

    const existingItemIndex = inventory.items.findIndex(
      (item) => item._id.toString() === inventoryItemId
    );

    if (existingItemIndex !== -1) {
      const usedItems = inventory.items[existingItemIndex];
      // 아이템 수량 감소
      inventory.items[existingItemIndex].quantity -= useQuantity;

      if (inventory.items[existingItemIndex].quantity <= 0) {
        inventory.items.splice(existingItemIndex, 1);
      }

      // 아이템 배열 업데이트 후 저장
      await this.inventoryModel.update(inventoryId, {
        items: inventory.items
      });

      // 사용한 아이템 정보 반환
      return usedItems;
    }
    throw new Error('Item not found in inventory');
  }

  async updateInventoryItemQuantity(inventoryId, inventoryItemId, quantity) {
    if (isNaN(quantity)) {
      throw new Error('Invalid quantity');
    }
    const inventory = await this.inventoryModel.findById(inventoryId);
    if (!inventory) {
      throw new Error('Inventory not found');
    }

    const existingItemIndex = inventory.items.findIndex(
      (item) => item._id.toString() === inventoryItemId
    );

    if (existingItemIndex !== -1) {
      // 이미 있는 아이템인 경우 수량 증가
      inventory.items[existingItemIndex].quantity += quantity;

      if (inventory.items[existingItemIndex].quantity <= 0) {
        inventory.items.splice(existingItemIndex, 1);
      }

      // 아이템 배열 업데이트 후 저장
      await this.inventoryModel.update(inventoryId, {
        items: inventory.items
      });
      return inventory;
    }
    throw new Error('Item not found in inventory');
  }

  async updateInventoryItemReward(inventoryId, inventoryItemId, quantity) {
    if (isNaN(quantity)) {
      throw new Error('Invalid quantity');
    }
    const inventory = await this.inventoryModel.findById(inventoryId);

    if (!inventory) {
      throw new Error('Inventory not found');
    }

    const existingItemIndex = inventory.items.findIndex(
      (item) => item.item.toString() === inventoryItemId
    );

    if (existingItemIndex !== -1) {
      // 이미 있는 아이템인 경우 수량 증가
      inventory.items[existingItemIndex].quantity += quantity;

      if (inventory.items[existingItemIndex].quantity <= 0) {
        inventory.items.splice(existingItemIndex, 1);
      }

      // 아이템 배열 업데이트 후 저장
      await this.inventoryModel.update(inventoryId, {
        items: inventory.items
      });
      return inventory;
    }
    throw new Error('Item not found in inventory');
  }
  async deleteInventoryItem(inventoryId, inventoryItemId) {
    const inventory = await this.inventoryModel.findById(inventoryId);

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
    const inventory = await this.inventoryModel.findById(inventoryId);

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
  async addSelectedItemToInventory(userId, itemId, quantity) {
    const inventoryId = await this.getInventoryIdByUserId(userId);

    const inventory = await this.inventoryModel.findById(inventoryId);

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

    // 인벤토리 업데이트 시에는 inventoryId를 사용
    return await this.inventoryModel.update(inventoryId, {
      items: inventory.items
    });
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
