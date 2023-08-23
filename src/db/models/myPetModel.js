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
    }

    async create(userId, pet, myPetName) {
        return (
            await MyPet.create({
                userId: userId,
                pets: [
                    {
                        pet: pet._id, // petId 대신에 pet 객체의 ID를 저장
                        myPetName
                    }
                ]
            })
        ).toObject();
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
