// @ts-nocheck
import { ItemModel } from '../db/models/index.ts';

class ItemService {
    constructor() {
        this.itemModel = new ItemModel();
    }
    async getItem(id) {
        return await this.itemModel.findById(id);
    }
    async getAllItems() {
        return await this.itemModel.findAll();
    }
    async addItem({
        name,
        description,
        image,
        status,
        effect,
        experience,
        probability
    }) {
        return await this.itemModel.create({
            name,
            description,
            image,
            status,
            effect,
            experience,
            probability
        });
    }
    async updateItem(id, item) {
        return await this.itemModel.update(id, item);
    }
    async deleteItem(id) {
        return await this.itemModel.delete(id);
    }
}

export default ItemService;
