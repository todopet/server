import { model } from "mongoose";
import { achieveSchema } from "../schemas/index.js";

const AchieveCategory = model("achieves", achieveSchema);
class AchieveModel {}
export default AchieveModel;
