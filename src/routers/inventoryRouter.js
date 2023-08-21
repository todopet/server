import { Router } from 'express';
import { InventoryService } from '../services/index.js';
import { buildResponse } from '../misc/utils.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import userAuthorization from '../middlewares/userAuthorization.js';

const inventoryRouter = Router();
const inventoryService = new InventoryService();

// 인벤토리 조회
inventoryRouter.get(
    '/',
    asyncHandler(async (req, res, next) => {
        const userId = req.currentUserId; // 사용자 ID로 인벤토리 ID 얻음
        console.log(userId);
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
        res.json(buildResponse(result));
    })
);

// 인벤토리 아이템 추가
inventoryRouter.post(
    '/addItem',
    asyncHandler(async (req, res, next) => {
        const { itemId, quantity } = req.body;
        const result = await inventoryService.addItemToInventory(
            req.user.userId, // 사용자 ID로 인벤토리 ID 얻음
            itemId,
            quantity
        );
        res.json(buildResponse(result));
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
        ); // 사용자 ID로 인벤토리 ID 얻음

        const result = await inventoryService.updateInventoryItemQuantity(
            inventoryId,
            inventoryItemId,
            quantity
        );

        res.json(buildResponse(result));
    })
);

// 인벤토리 아이템 삭제
inventoryRouter.delete(
    '/items/:inventoryItemId',
    asyncHandler(async (req, res, next) => {
        const { inventoryItemId } = req.params;
        const result = await inventoryService.deleteInventoryItem(
            req.user.userId, // 사용자 ID로 인벤토리 ID 얻음
            inventoryItemId
        );
        res.json(buildResponse(result));
    })
);

export default inventoryRouter;
