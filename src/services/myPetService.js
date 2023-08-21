import { MyPetModel } from '../db/models/index.js';

class MyPetService {
    constructor() {
        this.myPetModel = new MyPetModel();
    }
    async getMyPet(userId) {
        return await this.myPetModel.findByUserId(userId);
    }
    async addMyPet(userId, petId, petName) {
        return await this.myPetModel.create(userId, petId, petName);
    }
    async updateMyPet(id, myPet) {
        return await this.myPetModel.update(id, myPet);
    }
    async deleteMyPet(id) {
        return await this.myPetModel.delete(id);
    }
}
export default MyPetService;
