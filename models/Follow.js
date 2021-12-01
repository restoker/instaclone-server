import { Schema, model } from "mongoose";

const FollowsSchema = new Schema({
    idUser: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Usuario'
    },
    follow: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Usuario'
    },
    createAt: {
        type: Date,
        default: Date.now(),
    }
});

export default model('Follow', FollowsSchema);



