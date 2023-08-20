import { PetModel } from "../db/models/index.js";

class PetService {
    constructor() {
        this.petModel = new PetModel();
    }
    async getLowestLevel() {
        return await this.petModel.findLowestLevel();
    }
    async getPet(id) {
        return await this.petModel.find(id);
    }
    async addPet(pet) {
        return await this.petModel.create(pet);
    }
    async updatePet(id, pet) {
        return await this.petModel.update(id, pet);
    }
    async deletePet(id) {
        return await this.petModel.delete(id);
    }
}
export default PetService;
