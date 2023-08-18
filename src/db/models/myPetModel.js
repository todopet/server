import { model } from "mongoose";
import { myPetSchema } from "../schemas/index.js";

const MyPet = model("myPets", myPetSchema);

class MyPetModel {}

export default MyPetModel;
