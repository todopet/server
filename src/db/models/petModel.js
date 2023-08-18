import { model } from "mongoose";
import { petSchema } from "../schemas/index.js";

const Pet = model("pets", petSchema);

class PetModel {}

export default PetModel;
