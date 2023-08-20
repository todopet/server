import mongoose, { model } from "mongoose";
import { myPetSchema, petSchema } from "../schemas/index.js";

const MyPet = model("myPets", myPetSchema);
const Pet = model("pets", petSchema);

class MyPetModel {
    async find(userId) {
        // 결과에서 pet Id 꺼내서 pet쪽 컬렉션 또 조회, 그 다음에 가공해서 보낸다.
        const myPet = await MyPet.findOne({ userId }).lean();

        const pet = await Pet.findById(myPet.pets[0].pet);
        myPet.pets[0].petInfo = pet;

        return myPet;
        // return await MyPet.findOne({ userId }).lean();
    }

    async create(userId, petId, myPetName) {
        return (
            await MyPet.create({
                userId: userId,
                pets: [
                    {
                        pet: new mongoose.Types.ObjectId(petId),
                        myPetName
                    }
                ]
            })
        ).toObject();
    }
    async update(id, myPet) {
        return (await MyPet.findByIdAndUpdate(id, myPet)).toObject();
    }
    async delete(id) {
        return await MyPet.findByIdAndDelete(id);
    }
}

export default MyPetModel;
