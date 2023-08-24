import { model } from 'mongoose';
import { myPetSchema, petSchema } from '../schemas/index.js';

const MyPet = model('myPets', myPetSchema);
const Pet = model('pets', petSchema);

class MyPetModel {
    async findById(id) {
        return await MyPet.findById(id).lean();
    }

    async findByUserId(userId) {
        return await MyPet.findOne({ userId }).lean();
    }
    async findByPetStorageId(petStorageId) {
        return await MyPet.findOne({ _id: petStorageId }).lean();
        //return await MyPet.findById(petStorageId).lean();
    }

    async create(petStorage) {
        return (await MyPet.create(petStorage)).toObject();
    }

    async createPetStorage(userId, petId) {
        const petStorage = {
            userId: userId,
            pet: petId
        };

        return await MyPet.create(petStorage);
    }

    async update(petStorageId, myPet) {
        const updatedPetStorage = await MyPet.findOneAndUpdate(
            { _id: petStorageId },
            myPet,
            { new: true }
        );
        return updatedPetStorage;
    }

    async delete(myPetId) {
        return await MyPet.findOneAndDelete({
            _id: myPetId
        }).lean();
    }
}

export default MyPetModel;
