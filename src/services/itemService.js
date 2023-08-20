import { ItemModel } from "../db/models/index.js";

class ItemService {
    constructor() {
        this.itemModel = new ItemModel();
    }
    async getItem(id) {
        return await this.itemModel.find(id);
    }
    async addItem(item) {
        return await this.itemModel.create(item);
    }
    async updateItem(id, item) {
        return await this.itemModel.update(id, item);
    }
    async deleteItem(id) {
        return await this.itemModel.delete(id);
    }
}

export default ItemService;
