import { BadgeModel } from '../db/models/index.js';

class BadgeService {
    constructor() {
        this.badgeModel = new BadgeModel();
    }
    async getBadge(id) {
        return await this.badgeModel.findById(id);
    }
    async getAllBadges() {
        return await this.badgeModel.findAll();
    }
    async addBadge(badge) {
        return await this.badgeModel.create(badge);
    }
    async updateBadge(id, badge) {
        return await this.badgeModel.update(id, badge);
    }
    async deleteBadge(id) {
        return await this.badgeModel.delete(id);
    }
}

export default BadgeService;
