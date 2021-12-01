import {Schema, model} from 'mongoose';

const LikesSchema = new Schema({
    idPublicacion: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Publicacion'
    },
    idUser: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Usuario'
    }
});



export default model('Like', LikesSchema);