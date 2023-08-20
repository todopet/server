import { model } from "mongoose";
import { petSchema } from "../schemas/index.js";

const Pet = model("pets", petSchema);

class PetModel {
    async findLowestLevel() {
        console.log(await Pet.findOne({ level: 0 }).lean());
        console.log("aa");

        return await Pet.findOne({ level: 0 }).lean();
    }
    async find(id) {
        return await Pet.findById(id).lean();
    }
    async create(pet) {
        return (await Pet.create(pet)).toObject();
    }
    async update(id, pet) {
        return (await Pet.findByIdAndUpdate(id, pet)).toObject();
    }
    async delete(id) {
        return await Pet.findByIdAndDelete(id);
    }
}

export default PetModel;
