import { MyPetModel, PetModel } from '../db/models/index.js';
import { PetService } from './index.js';
import mongoose from 'mongoose';

class MyPetService {
    constructor() {
        this.myPetModel = new MyPetModel();
        this.petService = new PetService();
        this.petModel = new PetModel();
    }
    async getMyPet(userId) {
        return await this.myPetModel.findByUserId(userId);
    }
    async getPetStorageIdByUserId(userId) {
        const petStorage = await this.myPetModel.findByUserId(userId);

        if (!petStorage) {
            throw new Error(`petStorage no found for userId: ${userId}`);
        }
        return petStorage._id.toString();
    }

    // myPet 단일 조회
    async getMyPetByPetId(petStorageId, petId) {
        const petStorage = await this.getPetStorageByPetStorageId(petStorageId);
        const pet = petStorage.pets.find((p) => p._id.toString() === petId);

        if (!pet) {
            throw new Error('Pet not found in petStorage');
        }

        return pet;
    }

    async getPetStorageByPetStorageId(petStorageId) {
        const petStorage = await this.myPetModel.findByPetStorageId(
            petStorageId
        );

        if (!petStorage) {
            throw new Error('PetStorage not found');
        }

        return petStorage;
    }

    async getPetByLevel(level) {
        return await this.petModel.findByLevel(level);
    }

    async addPetStorage(userId) {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error('Invalid userId');
        }

        // 펫을 가져오기 위한 PetService 인스턴스 생성
        const petService = new PetService();

        // 0 레벨 펫을 가져옴
        const lowestLevelPet = await petService.getLowestLevel();

        // pets 배열에 0 레벨 펫과 추가 정보를 추가하여 petStorage 생성
        const petStorage = await this.myPetModel.create({
            userId: userId.toString(),
            pets: [
                {
                    pet: lowestLevelPet
                }
            ]
        });
        return petStorage;
    }

    async addMyPet(userId, petId) {
        const pet = await this.petService.getPet(petId);

        // 펫 정보를 생성
        const petInfo = {
            petName: pet.petName,
            level: pet.level,
            experience: pet.experience,
            hunger: pet.hunger,
            affection: pet.affection,
            cleanliness: pet.cleanliness,
            condition: pet.condition
        };
        // 기존 petStorage 가져오기
        const petStorageId = await this.getPetStorageIdByUserId(userId);
        const petStorage = await this.myPetModel.findByPetStorageId(
            petStorageId
        );

        // 기존 petStorage의 pets 배열에 펫을 추가
        petStorage.pets.push({
            pet: pet
        });

        // 수정된 petStorage 저장
        const updatedPetStorage = await this.myPetModel.update(
            petStorageId,
            petStorage
        );

        return updatedPetStorage; // 업데이트된 petStorage를 반환
    }

    //펫 정보 각각 업데이트
    async updatePetInMyPet(petStorageId, petId, updatedFields) {
        const petStorage = await this.getPetStorageByPetStorageId(petStorageId);

        const petToUpdate = petStorage.pets.find(
            (pet) => pet._id.toString() === petId
        );

        if (!petToUpdate) {
            throw new Error('Pet not found in petStorage');
        }

        // 기존 정보를 업데이트할 필드로 덮어씌웁니다.
        Object.assign(petToUpdate.pet, updatedFields);

        // 전체 petStorage 객체를 업데이트합니다 (업데이트된 펫을 포함)
        const updatedPetStorage = await this.myPetModel.update(
            petStorageId,
            petStorage
        );

        return petToUpdate; // 업데이트된 펫 정보를 반환
    }

    async deletePetInMyPet(petStorageId, myPetId) {
        const petStorage = await this.myPetModel.findByPetStorageId(
            petStorageId
        );

        if (!petStorage) {
            throw new Error('petStorage not found');
        }
        const updatedMyPets = petStorage.pets.filter(
            (pet) => pet._id.toString() !== myPetId
        );

        return await this.myPetModel.update(petStorageId, {
            pets: updatedMyPets
        });
    }
}
export default MyPetService;
