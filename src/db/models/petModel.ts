// @ts-nocheck
import { model } from 'mongoose';
import { petSchema } from '../schemas/index.ts';

const Pet = model('pets', petSchema);

class PetModel {
    async findLowestLevel() {
        return await Pet.findOne({ level: 0 }).lean();
    }
    async findByLevel(level) {
        return await Pet.findOne({ level }).lean();
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
        const updatedPet = await Pet.findByIdAndUpdate(id, pet, {
            new: true
        }).lean();
        return updatedPet;
    }
    async delete(id) {
        return await Pet.findByIdAndDelete(id).lean();
    }
}

export default PetModel;
