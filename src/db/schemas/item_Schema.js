import mongoose from "mongoose";

class Item {
    constructor() {
        const itemSchema = new mongoose.Schema(
            {
                name: {
                    type: String,
                    required: true
                },
                description: {
                    type: String,
                    required: true
                },
            },
            {
                timestamps: true
            }
        );
        return mongoose.model("Item", itemSchema);
    }
}

export default new Item();
