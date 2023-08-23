import { MyPetModel } from '../db/models/index.js';
import { PetService } from './index.js';
import mongoose from 'mongoose';

class MyPetService {
    constructor() {
        this.myPetModel = new MyPetModel();
        this.petService = new PetService();
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
            (pet) =>pet._id.toString() === myPetId
        );
        if (!pet){
            throw new Error('pet not found in petStorage');
        }
        return pet;
    }

    async getPetStorageByPetStorageId(petStorageId) {
        const petStorage = await this.myPetModel.findByPetStorageId(petStorageId);
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

    async addMyPet(userId, petId, myPetName) {
        const pet = await this.petService.getPet(petId); // 이 부분 추가
        return await this.myPetModel.create(userId, pet,myPetName); // pet 대신에 pet 객체 전달
    }

    async updatePetInMyPet(myPetId, updatedPetInfo) {
        const myPet = await this.myPetModel.findById(myPetId);

        if (!myPet) {
            return { error: 'MyPet not found', data: null };
        }

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
