import mongoose from "mongoose";

class Todo {
    constructor() {
        const todoSchema = new mongoose.Schema(
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true
                },
                data: {
                    categories: [
                        {
                            name: {
                                type: String,
                                required: true
                            },
                            todos: [
                                {
                                    content: {
                                        type: String,
                                        required: true
                                    },
                                    status: {
                                        type: String,
                                        enum: ["pending", "completed"],
                                        default: "pending"
                                    }
                                }
                            ]
                        }
                    ]
                }
            },
            {
                timestamps: true
            }
        );

        return mongoose.model("Todo", todoSchema);
    }
}

export default new Todo();
