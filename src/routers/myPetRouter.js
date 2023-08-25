import { Router } from 'express';
import { MyPetService, PetService } from '../services/index.js';
import { buildResponse } from '../misc/utils.js';
import asyncHandler from '../middlewares/asyncHandler.js';

const myPetRouter = Router();
const myPetService = new MyPetService();
const petService = new PetService();

// myPet 전체조회
myPetRouter.get(
    '/',
    asyncHandler(async (req, res, next) => {
        const userId = req.currentUserId;
        const petStorageId = await myPetService.getPetStorageIdByUserId(userId);
        const result = await myPetService.getPetStorageByPetStorageId(
            petStorageId
        );
        return result; // 이 부분을 수정합니다.
    })
);

// myPet 단일 조회
myPetRouter.get(
    '/:myPetId',
    asyncHandler(async (req, res, next) => {
        const myPetId = req.params.myPetId;
        const petStorageId = await myPetService.getPetStorageIdByUserId(
            req.currentUserId
        );
        const result = await myPetService.getMyPetByPetId(
            petStorageId,
            myPetId
        );
        return result;
    })
);

// myPet 생성
myPetRouter.post(
    '/',
    asyncHandler(async (req, res, next) => {
        const userId = req.currentUserId;
        const { level } = req.body;

        // 펫 레벨에 따라 해당 레벨의 펫을 가져옵니다.
        const pet = await myPetService.getPetByLevel(level);

        const result = await myPetService.addMyPet(userId, pet._id);

        return result;
    })
);

// myPet 수정 (아이템 버리기, 아이템 추가)
myPetRouter.patch(
    '/:myPetId',
    asyncHandler(async (req, res, next) => {
        const { myPetId } = req.params;
        const updatedFields = req.body; // 수정할 정보
        const petStorageId = await myPetService.getPetStorageIdByUserId(
            req.currentUserId
        );

        const result = await myPetService.updatePetInMyPet(
            petStorageId,
            myPetId,
            updatedFields
        );
        return result;
    })
);

// myPet 삭제
myPetRouter.delete(
    '/:myPetId',
    asyncHandler(async (req, res, next) => {
        const { myPetId } = req.params;

        const petStorageId = await myPetService.getPetStorageIdByUserId(
            req.currentUserId
        );

        const result = await myPetService.deletePetInMyPet(
            petStorageId,
            myPetId
        );
        return result;
    })
);

export default myPetRouter;
