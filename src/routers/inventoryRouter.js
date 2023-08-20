import { Router } from "express";
import { InventoryService } from "../services/index.js";
import { buildResponse } from "../misc/utils.js";
import asyncHandler from "../middlewares/asnycHandler.js";
import userAuthorization from "../middlewares/userAuthorization.js";

const inventoryRouter = Router();
const inventoryService = new InventoryService();

// 인벤토리 조회
inventoryRouter.get(
    "/:userId",
    userAuthorization,
    asyncHandler(async (req, res, next) => {
        const { userId } = req.params;
        const result = await inventoryService.getInventoryByUserId(userId);
        res.json(buildResponse(result));
    })
);

// 인벤토리 생성
inventoryRouter.post(
    "/",
    asyncHandler(async (req, res, next) => {
        const { userId, items } = req.body;
        const result = await inventoryService.addInventory({
            userId,
            items
        });
        res.json(buildResponse(result));
    })
);

// 인벤토리 아이템 추가
inventoryRouter.post(
    "/addItem",
    asyncHandler(async (req, res, next) => {
        const { userId, itemId, quantity } = req.body;
        const result = await inventoryService.addItemToInventory(
            userId,
            itemId,
            quantity
        );
        res.json(buildResponse(result));
    })
);

//인벤토리 아이템 수량 변경
inventoryRouter.patch(
    "/:userId",
    asyncHandler(async (req, res, next) => {
        const { userId } = req.params;
        const { items } = req.body;
        const result = await inventoryService.updateInventory(userId, {
            items
        });
        res.json(buildResponse(result));
    })
);

// 인벤토리 아이템 삭제
inventoryRouter.delete(
    "/:userId/:itemId",
    userAuthorization,
    asyncHandler(async (req, res, next) => {
        const { userId, itemId } = req.params;
        const result = await inventoryService.deleteItemFromInventory(
            userId,
            itemId
        );
        res.json(buildResponse(result));
    })
);
export default inventoryRouter;
