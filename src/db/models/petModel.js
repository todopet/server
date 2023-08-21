import { model } from "mongoose";
import { petSchema } from "../schemas/index.js";

const Pet = model("pets", petSchema);

class PetModel {
    async findLowestLevel() {
        console.log(await Pet.findOne({ level: 0 }).lean());
        console.log("aa");

        return await Pet.findOne({ level: 0 }).lean();
    }
    async findById(id) {
        return await Pet.findById(id).lean();
    }
    async findAllPets() {
        return await Pet.find().lean();
    }
    async create(pet) {
        return (await Pet.create(pet)).toObject();
    }
    async update(id, pet) {
        const updatedPet = await Pet.findByIdAndUpdate(id, pet, { new: true }).lean();
        return updatedPet;
    }
    async delete(id) {
        return await Pet.findByIdAndDelete(id).lean();
    }
}

export default PetModel;
