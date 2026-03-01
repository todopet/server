// @ts-nocheck
import { Router } from 'express';
import { MyPetService, PetService } from '../services/index.ts';
import { buildResponse } from '../misc/utils.ts';
import asyncHandler from '../middlewares/asyncHandler.ts';
import signatureMiddleware from '../middlewares/signatureMiddleware.ts';
import { signatureRateLimiter } from '../config/security.ts';

const myPetRouter = Router();
const myPetService = new MyPetService();
const petService = new PetService();

// myPet 전체조회
myPetRouter.get(
  '/',
  asyncHandler(async (req, res, next) => {
    const userId = req.currentUserId;
    const petStorageId = await myPetService.getPetStorageIdByUserId(userId);

    // 펫 정보를 가져오고 계산된 수치를 적용합니다.
    const result = await myPetService.updatePetStatus(petStorageId);

    // 계산된 펫 정보를 클라이언트에 응답합니다.
    return result;
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
    const result = await myPetService.getMyPetByPetId(petStorageId, myPetId);
    return result;
  })
);

// myPet level만 조회
myPetRouter.get(
  '/myPet/level',
  asyncHandler(async (req, res, next) => {
    const userId = req.currentUserId;
    const myPet = await myPetService.getMyPet(userId);
    const result = { level: myPet.pets[0].pet.level };
    return result;
  })
);

// myPet 생성
myPetRouter.post(
  '/',
  asyncHandler(async (req, res, next) => {
    const userId = req.currentUserId;
    const { level } = req.body;

    const pet = await myPetService.getPetByLevel(level);

    const result = await myPetService.addMyPet(userId, pet._id);

    return result;
  })
);

// myPet 수정 (닉네임변경)
myPetRouter.patch(
  '/:myPetId',
  signatureRateLimiter,
  signatureMiddleware,
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

    const result = await myPetService.deletePetInMyPet(petStorageId, myPetId);
    return result;
  })
);

export default myPetRouter;
