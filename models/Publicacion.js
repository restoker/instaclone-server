import {Schema, model} from 'mongoose';



const PublicacionesSchema = new Schema({
    idUser: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    file: {
        type: String,
        trim: true,
        required: true,
    },
    typeFile: {
        type: String,
        trim: true
    },
    createAt: {
        type: Date,
        default: Date.now(),
    }
})


export default model('Publicacion', PublicacionesSchema);