import { InventoryService, ItemService } from './index.js';

class RewardService {
    constructor() {
        this.inventoryService = new InventoryService();
        this.itemService = new ItemService();
    }

    async giveReward(userId) {
        const inventoryId = await this.inventoryService.getInventoryIdByUserId(
            userId
        );

        const itemList = await this.itemService.getAllItems();
        const guaranteedItems = itemList.filter(
            (item) => item.probability === 100
        );

        // 보상 아이템 중에서 가중치 랜덤으로 받을 아이템 선택
        const totalWeight = itemList.reduce(
            (sum, item) => sum + item.probability,
            0
        );
        const randomValue = Math.random() * totalWeight;

        let cumulativeWeight = 0;
        for (const item of itemList) {
            cumulativeWeight += item.probability;
            if (randomValue <= cumulativeWeight) {
                // 아이템을 획득
                const existingItem =
                    await this.inventoryService.getInventoryItem(
                        inventoryId,
                        item._id.toString()
                    );
                if (existingItem) {
                    // 이미 아이템이 존재하는 경우 수량 증가
                    await this.inventoryService.updateInventoryItemReward(
                        inventoryId,
                        item._id.toString(),
                        1 // 수량을 1 증가시킴
                    );
                } else {
                    // 새로운 아이템 추가
                    await this.inventoryService.addItemToInventory(
                        inventoryId,
                        item._id,
                        1
                    );
                }
                return item;
            }
        }

        // 아이템 획득이 불가능한 경우, 확률이 100인 아이템 중 하나를 지급
        if (guaranteedItems.length > 0) {
            const selectedItem =
                guaranteedItems[
                    Math.floor(Math.random() * guaranteedItems.length)
                ];
            const existingItem = await this.inventoryService.getInventoryItem(
                inventoryId,
                selectedItem._id.toString()
            );
            if (existingItem) {
                await this.inventoryService.updateInventoryItemReward(
                    inventoryId,
                    selectedItem._id.toString(),
                    1 // 수량을 1 증가시킴
                );
            } else {
                // 새로운 아이템 추가
                await this.inventoryService.addItemToInventory(
                    inventoryId,
                    selectedItem._id,
                    1
                );
            }
            return selectedItem;
        }
    }
}

export default RewardService;
