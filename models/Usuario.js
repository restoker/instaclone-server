import {Schema, model} from 'mongoose';

const UsuarioSchema = new Schema({
    nombre: {
        type: String,
        required: true,
        trim: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: true,
    },
    avatar: {
        type: String,
        trim: true,
        default: 'https://ui-avatars.com/api/?background=random',
    },
    siteweb: {
        type: String,
        trim: true
    },
    descripcion: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    createAt: {
        type: Date,
        default: Date.now(),
    }
});

export default model('Usuario', UsuarioSchema);