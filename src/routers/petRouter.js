import { Router } from "express";
import { PetService } from "../services/index.js";
import { buildResponse } from "../misc/utils.js";
import asyncHandler from "../middlewares/asnycHandler.js";

const petRouter = Router();
const petService = new PetService();

// Pet 조회
petRouter.get(
    "/:id",
    asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const result = await petService.getPet(id);
        res.json(buildResponse(result));
    })
);

// Pet 전체 조회
petRouter.get(
    "/",
    asyncHandler(async (req, res, next) => {
        const allPets = await petService.getAllPets(); // 새로운 메서드 추가
        res.json(buildResponse(allPets));
    })
);

// Pet 저장
petRouter.post(
    "/",
    asyncHandler(async (req, res, next) => {
        const {
            petName,
            level,
            experience,
            hunger,
            affection,
            cleanliness,
            condition
        } = req.body;
        const result = await petService.addPet({
            petName,
            level,
            experience,
            hunger,
            affection,
            cleanliness,
            condition
        });
        res.json(buildResponse(result));
    })
);

// Pet 수정
petRouter.patch(
    "/:id",
    asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const {
            petName,
            level,
            experience,
            hunger,
            affection,
            cleanliness,
            condition
        } = req.body;
        const result = await petService.updatePet(id, {
            petName,
            level,
            experience,
            hunger,
            affection,
            cleanliness,
            condition
        });
        res.json(buildResponse(result));
    })
);

// Pet 삭제
petRouter.delete(
    "/:id",
    asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const result = await petService.deletePet(id);
        res.json(buildResponse(result));
    })
);

export default petRouter;
