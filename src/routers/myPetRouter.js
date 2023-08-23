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
        const result = await myPetService.getPetStorageByPetStorageId(petStorageId);
        return result;
    })
);

// myPet 단일 조회
myPetRouter.get('/:myPetId', asyncHandler(async (req, res, next) => { 
    const myPetId = req.param;
    const petStorageId = await myPetService.getPetStorageIdByUserId(req.currentUserId);
    console.log(myPetId);
    console.log(petStorageId);
    const result = await myPetService.getMyPetById(
        petStorageId,
        myPetId
    );
    return result;
    })
);

// myPet 저장
myPetRouter.post(
    '/:myPetId',
    asyncHandler(async (req, res, next) => {
        const userId = req.currentUserId;
        const lowestLevelPet = await petService.getLowestLevel();
        const { myPetName } = req.body;
        const result = await myPetService.addMyPet(
            userId,
            lowestLevelPet._id,
            myPetName
        );
        return result;
    })
);

// myPet 수정 (레벨업, 아이템사용시)
myPetRouter.patch(
    '/:myPetId',
    asyncHandler(async (req, res, next) => {
        const { myPetId } = req.params;
        const updatedInfo = req.body; // 수정할 정보

        const result = await myPetService.updatePetInMyPet(
            myPetId,
            updatedInfo
        );
        return result;
    })
);

// myPet 삭제
myPetRouter.delete(
    '/:myPetId',
    asyncHandler(async (req, res, next) => {
        const { myPetId } = req.params;

        const petStorageId = await myPetService.getPetStorageIdByUserId(req.currentUserId);


        const result = await myPetService.deletePetInMyPet(petStorageId,
            myPetId);
        return result;
    })
);

export default myPetRouter;
