import { Router } from 'express';
import { InventoryService, MyPetService } from '../services/index.js';
import { buildResponse } from '../misc/utils.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import userAuthorization from '../middlewares/userAuthorization.js';

const inventoryRouter = Router();
const inventoryService = new InventoryService();
const myPetService = new MyPetService();
// 인벤토리 조회
inventoryRouter.get(
    '/',
    asyncHandler(async (req, res, next) => {
        const userId = req.currentUserId;
        const inventoryId = await inventoryService.getInventoryIdByUserId(
            userId
        );
        const result = await inventoryService.getInventoryByInventoryId(
            inventoryId
        );
        res.json(buildResponse(result));
    })
);

// 인벤토리 아이템 단일 조회
inventoryRouter.get(
    '/items/:inventoryItemId',
    asyncHandler(async (req, res, next) => {
        const { inventoryItemId } = req.params;
        const inventoryId = await inventoryService.getInventoryIdByUserId(
            req.currentUserId
        );
        const result = await inventoryService.getInventoryItemById(
            inventoryId,
            inventoryItemId
        );
        return result;
    })
);

//아이템 사용
inventoryRouter.post(
    '/:inventoryItemId/use',
    asyncHandler(async (req, res, next) => {
        const { inventoryItemId } = req.params;
        const { quantity } = req.body;
        const userId = req.currentUserId;

        // 인벤토리 아이템 정보 가져오기
        const inventoryItem =
            await inventoryService.getInventoryItemByInventoryItemId(
                userId,
                inventoryItemId
            );

        if (!inventoryItem) {
            throw new Error('Inventory item not found');
        }

        const updatedPet = await myPetService.updatePetWithItemEffect(
            userId,
            inventoryItem.info.status,
            inventoryItem.info.effect,
            inventoryItem.info.experience,
            quantity
        );
        //console.log(updatedPet);

        // 아이템 사용 및 인벤토리 업데이트
        const itemUsed = await inventoryService.useItemAndUpdateInventory(
            userId,
            inventoryItemId
        );

        if (!itemUsed) {
            throw new Error(
                'Failed to use item or item not found in inventory'
            );
        }

        // 아이템 사용 결과 및 업데이트된 펫 정보 반환
        res.json(buildResponse({ updatedPet }));
    })
);

// 인벤토리 아이템 추가
inventoryRouter.post(
    '/addItem',
    asyncHandler(async (req, res, next) => {
        const { itemId, quantity } = req.body;
        const result = await inventoryService.addSelectedItemToInventory(
            req.currentUserId, // 사용자 ID로 인벤토리 ID 얻음
            itemId,
            quantity
        );
        return result;
    })
);

// 인벤토리 아이템 수량 변경
inventoryRouter.patch(
    '/items/:inventoryItemId',
    asyncHandler(async (req, res, next) => {
        const { inventoryItemId } = req.params;
        const { quantity } = req.body;

        const inventoryId = await inventoryService.getInventoryIdByUserId(
            req.currentUserId
        );

        const result = await inventoryService.updateInventoryItemQuantity(
            inventoryId,
            inventoryItemId,
            quantity
        );
        return result;
    })
);

// 인벤토리 아이템 삭제
inventoryRouter.delete(
    '/items/:inventoryItemId',
    asyncHandler(async (req, res, next) => {
        const { inventoryItemId } = req.params;

        const inventoryId = await inventoryService.getInventoryIdByUserId(
            req.currentUserId
        );

        const result = await inventoryService.deleteInventoryItem(
            inventoryId,
            inventoryItemId
        );

        return result;
    })
);

export default inventoryRouter;
