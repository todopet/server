import { Router } from "express";
import { MyPetService } from "../services/index.js";
import { buildResponse } from "../misc/utils.js";
import asyncHandler from "../middlewares/asnycHandler.js";

const myPetRouter = Router();
const myPetService = new MyPetService();

export default myPetRouter;
