import { Router } from "express";
import { InventoryService } from "../services/index.js";
import { buildResponse } from "../misc/utils.js";
import asyncHandler from "../middlewares/asnycHandler.js";

const inventoryRouter = Router();
const inventoryService = new InventoryService();

export default inventoryRouter;
