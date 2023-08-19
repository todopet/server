import { Router } from "express";
import { PetService } from "../services/index.js";
import { buildResponse } from "../misc/utils.js";
import asyncHandler from "../middlewares/asnycHandler.js";

const petRouter = Router();
const petService = new PetService();

export default petRouter;
