import { model } from "mongoose";
import { itemSchema } from "../schemas/index.js";

const ItemCategory = model("items", itemSchema);
class ItemModel {}
export default ItemModel;
