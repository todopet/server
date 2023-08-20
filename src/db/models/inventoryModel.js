import { model } from "mongoose";
import { inventorySchema } from "../schemas/index.js";

const InventoryCategory = model("inventories", inventorySchema);
class InventoryModel {}
export default InventoryCategory;
