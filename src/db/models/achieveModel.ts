// @ts-nocheck
import { model } from "mongoose";
import { achieveSchema } from "../schemas/index.ts";

const AchieveCategory = model("achieves", achieveSchema);
class AchieveModel {}
export default AchieveModel;
