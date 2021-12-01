import {model, Schema} from 'mongoose';

const ComentariosSchema = new Schema({
    idPublicacion: {
        type: Schema.Types.ObjectId,
        require: true,
        ref: 'Publicacion'
    },
    idUser: {
        type: Schema.Types.ObjectId,
        require: true,
        ref: 'Usuario'
    },
    comentario: {
        type: String,
        trim: true,
        required: true
    },
    createAt: {
        type: Date,
        default: Date.now(),
    }
});


export default model('comentario', ComentariosSchema);