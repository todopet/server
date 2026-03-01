// @ts-nocheck
import { Router } from 'express';
import { PetService } from '../services/index.ts';
import { buildResponse } from '../misc/utils.ts';
import asyncHandler from '../middlewares/asyncHandler.ts';

const petRouter = Router();
const petService = new PetService();

// Pet 조회
petRouter.get(
    '/:id',
    asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const result = await petService.getPet(id);
        return result;
    })
);

// Pet 전체 조회
petRouter.get(
    '/',
    asyncHandler(async (req, res, next) => {
        const result = await petService.getAllPets(); // 새로운 메서드 추가
        return result;
    })
);

// Pet 저장
petRouter.post(
    '/',
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
        return result;
    })
);

// Pet 수정
petRouter.patch(
    '/:id',
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
        return result;
    })
);

// Pet 삭제
petRouter.delete(
    '/:id',
    asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const result = await petService.deletePet(id);
        return result;
    })
);

export default petRouter;
