import { Router } from 'express';
import { InventoryService } from '../services/index.js';
import { buildResponse } from '../misc/utils.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import userAuthorization from '../middlewares/userAuthorization.js';

const inventoryRouter = Router();
const inventoryService = new InventoryService();

// 인벤토리 조회
inventoryRouter.get(
    '/:inventoryId', // 경로 수정
    asyncHandler(async (req, res, next) => {
        const { inventoryId } = req.params;
        const result = await inventoryService.getInventoryByInventoryId(
            inventoryId
        );
        res.json(buildResponse(result));
    })
);

// 인벤토리 생성
inventoryRouter.post(
    '/',
    asyncHandler(async (req, res, next) => {
        const { userId, items } = req.body;
        const result = await inventoryService.addInventory(userId, items);
        res.json(buildResponse(result));
    })
);

// 인벤토리 아이템 추가
inventoryRouter.post(
    '/addItem',
    asyncHandler(async (req, res, next) => {
        const { inventoryId, itemId, quantity } = req.body; // 인자 이름 수정
        const result = await inventoryService.addItemToInventory(
            inventoryId, // 인자 이름 수정
            itemId,
            quantity
        );
        res.json(buildResponse(result));
    })
);

// 인벤토리 아이템 수량 변경
inventoryRouter.patch(
    '/:inventoryId/:itemId',
    asyncHandler(async (req, res, next) => {
        const { inventoryId, itemId } = req.params;
        const { quantity } = req.body;
        console.log(inventoryId, itemId);
        console.log(quantity);
        const result = await inventoryService.updateInventoryItemQuantity(
            inventoryId, // 인자 이름 수정
            itemId,
            quantity
        );
        res.json(buildResponse(result));
    })
);

// 인벤토리 아이템 삭제
inventoryRouter.delete(
    '/:inventoryId/:itemId',
    //userAuthorization,
    asyncHandler(async (req, res, next) => {
        const { inventoryId, itemId } = req.params;
        const result = await inventoryService.deleteInventoryItem(
            inventoryId, // 인자 이름 수정
            itemId
        );
        res.json(buildResponse(result));
    })
);
export default inventoryRouter;
