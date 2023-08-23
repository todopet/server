import { MyPetModel } from '../db/models/index.js';
import { PetService } from './index.js';

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
    async addMyPet(userId, petId, myPetName) {
        const pet = await this.petService.getPet(petId); // 이 부분 추가
        return await this.myPetModel.create(userId, pet, myPetName); // pet 대신에 pet 객체 전달
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
