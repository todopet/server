import { Router } from "express";
import { ItemService } from "../services/index.js";
import { buildResponse } from "../misc/utils.js";
import asyncHandler from "../middlewares/asnycHandler.js";

const itemRouter = Router();
const itemService = new ItemService();

// item 조회
itemRouter.get(
    "/:id",
    asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const result = await itemService.getItem(id);
        res.json(buildResponse(result));
    })
);

// item 저장
itemRouter.post(
    "/",
    asyncHandler(async (req, res, next) => {
        const {
            itemName,
            description,
            image,
            status,
            effect,
            exp,
            probability
        } = req.body;
        const result = await itemService.addItem({
            itemName,
            description,
            image,
            status,
            effect,
            exp,
            probability
        });
        res.json(buildResponse(result));
    })
);

// item 수정
itemRouter.patch(
    "/:id",
    asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const {
            itemName,
            description,
            image,
            status,
            effect,
            exp,
            probability
        } = req.body;
        const result = await itemService.updateItem(id, {
            itemName,
            description,
            image,
            status,
            effect,
            exp,
            probability
        });
        res.json(buildResponse(result));
    })
);

// item 삭제
itemRouter.delete(
    "/:id",
    asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const result = await itemService.deleteItem(id);
        res.json(buildResponse(result));
    })
);

export default itemRouter;
