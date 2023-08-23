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

    async getMyPetById(petStorageId, myPetId) {
        const petStorage = await this.getPetStorageByPetStorageId(petStorageId);

        const pet = petStorage.pets.find(
            (pet) => pet._id.toString() === myPetId
        );
        if (!pet) {
            throw new Error('pet not found in petStorage');
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
        const myPetWithInfo = await Promise.all(
            petStorage.pets.map(async (pet) => {
                const petInfo = await this.petService.getPet(pet.pet);
                return {
                    ...pet,
                    info: petInfo
                };
            })
        );
        return {
            ...petStorage,
            pets: myPetWithInfo
        };
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

        // pets 배열에 0 레벨 펫을 추가하여 petStorage 생성
        const petStorage = await this.myPetModel.create({
            userId: userId.toString(),
            pets: [{ pet: lowestLevelPet._id }] // 펫의 ObjectId를 객체로 감싸서 할당
        });

        return petStorage;
    }

    async addMyPet(userId, petId) {
        const pet = await this.petService.getPet(petId);

        // 기존 petStorage 가져오기
        const petStorageId = await this.getPetStorageIdByUserId(userId);
        const petStorage = await this.myPetModel.findByPetStorageId(
            petStorageId
        );

        // 기존 petStorage의 pets 배열에 펫을 추가
        petStorage.pets.push({ pet: pet._id });

        // 수정된 petStorage 저장
        await this.myPetModel.update(petStorageId, petStorage);

        return petStorage;
    }

    //펫 정보 각각 업데이트
    async updatePetInMyPet(myPetId, updatedFields) {
        console.log(myPetId);
        console.log(updatedFields);
        const myPet = await this.myPetModel.findById(myPetId);
        console.log(myPet);
        if (!myPet) {
            return { error: 'MyPet not found', data: null };
        }

        Object.assign(myPet.info, updatedFields); // 요청의 필드들을 업데이트
        const updatedMyPet = await this.myPetModel.update(myPetId, myPet);

        return { error: null, data: updatedMyPet };
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
