import { model } from "mongoose";
import { badgeSchema } from "../schemas/index.js";

const Badge = model("badges", badgeSchema);

class BadgeModel {
    async findById(id) {
        return await Badge.findById(id);
    }
    async findAll() {
        return await Badge.find().lean();
    }
    async create(badge) {
        return (await Badge.create(badge)).toObject();
    }
    async update(id, badge) {
        const updatedBadge = await Badge.findByIdAndUpdate(id, badge, {
            new: true
        }).lean();
        return updatedBadge;
    }
    async delete(id) {
        return await Badge.findByIdAndDelete(id).lean();
    }
}

export default BadgeModel;
