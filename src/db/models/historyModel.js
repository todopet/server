import { model } from "mongoose";
import { historySchema } from "../schemas/index.js";

const HistoryCategory = model("histories", historySchema);
class HistoryModel {}
export default HistoryModel;
