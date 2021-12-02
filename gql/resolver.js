import Usuario from "../models/Usuario";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
// import { GraphQLUpload } from "apollo-server";
import { uploadImage } from "../utils/aws-upload-image";
import { isValidObjectId } from "mongoose";
import Follow from '../models/Follow'
import Publicacion from "../models/Publicacion";
import Comentario from "../models/Comentario";
import Like from "../models/Like";

const  crearToken= (usuario, secreta, expiresIn) => {
    const {id, email, nombre, username} = usuario;
    return jwt.sign({id, email, nombre, username}, secreta, {expiresIn});    
}
const resolvers = {
    // Upload: GraphQLUpload,
    Query: {
        // User
        getUser: async (_, {id, username}, ctx) => {
            // verificar si el usuario existe
            const usuario = await Usuario.findOne({username});
            if (!usuario) {
                throw new Error('El Usuario no existe');
            }   
            // console.log('Obteniendo usuario');
            return usuario;
        },
        search: async (_, {search}) => {
            const users = await Usuario.find({'nombre': {$regex: search, $options: 'i'}});
            if(!users) {
                throw new Error('No se encontro ninguna coincidencia');
            }
            return users;
        },
        isFollow: async (_, {username}, ctx) => {
            if(username === ctx.user.username) throw new Error('No puedes seguirte a ti mismo :)');
            // verificar si el usuario existe
            const usuario = await Usuario.findOne({username});
            // console.log(usuario);
            if (!usuario) {
                throw new Error('El usuario no existe');
            }

            try {
                const follow = await Follow.find({idUser: ctx.user.id}).where("follow").equals(usuario._id);
                if (follow.length > 0) {
                    return true;
                }
                return false;
            } catch (e) {
                console.log(e);
                return false;
            }
        },
        getFollowers: async (_, {username}, ctx) => {
            // console.log('me ejecute');
            // verificar si el usuario existe
            const user = await Usuario.findOne({username});
            if (!user) {
                throw new Error('El usuario ingresado no existe');
            }
            // verificar las personas que siguen al usuario
            try {
                const followers = await Follow.find({follow: user._id}).populate("idUser");
                let seguidores = [];
                for await(const data of followers) {
                    seguidores = [...seguidores, data.idUser];
                }
            // console.log(user);
                // console.log(seguidores);
                return seguidores;
            } catch (e) {
                console.log(e);
                throw new Error('Internal Server Error');
            }
        },
        getFollowings: async (_, {username}, ctx) => {
              // verificar si el usuario existe
            const user = await Usuario.findOne({username});
            if (!user) {
                throw new Error('El usuario ingresado no existe');
            }
            // verificar las personas que el usuario sigue
            try {
                const followings = await Follow.find({idUser: user._id}).populate("follow");
                let siguiendo = [];
                for await(const data of followings) {
                    siguiendo = [...siguiendo, data.follow];
                }
            // console.log(user);
                // console.log(siguiendo);
                return siguiendo;
            } catch (e) {
                console.log(e);
                throw new Error('Internal Server Error');
            }
        },
        getPublications: async (_, {username}, ctx) => {
             // verificar si el usuario existe
             const user = await Usuario.findOne({username});
             if (!user) {
                 throw new Error('El usuario ingresado no existe');
             }

             try {
                 const publicaciones = Publicacion.find({idUser: user._id}).sort({createAt: -1});
                //  const publicaciones = Publicacion.find().where({idUser: user._id}).sort({createAt: -1});
                 return publicaciones;
             } catch (e) {
                console.log(e);
                throw new Error('Internal Server Error');
             }
        },
        getComentarios: async (_, {id}, ctx) => {
            // verificar si el id es valido
            if(!isValidObjectId(id)){
                throw new Error('el ID seleccionado no existe');
            }
            // verificar si la publicacion existe
            const publicacion = await Publicacion.findOne({_id: id}).sort({createAt: '-1'});
            // console.log(publicacion);
            if (!publicacion) {
                throw new Error('La publicación no existe');
            } 

            try {
                const comentarios = await Comentario.find({idPublicacion: id}).populate("idUser");
                // console.log(comentarios);
                return comentarios;
            } catch (e) {
                console.log(e);
                throw new Error('Internal Server Error');
            }

        },
        getLikePublicacion: async (_, {idPublicacion}, ctx) => {
            // verificar si el id es valido
            if(!isValidObjectId(idPublicacion)){
                throw new Error('el ID seleccionado no existe');
            }

            try {
                const like = await Like.findOne({idPublicacion}).where({idUser: ctx.user.id});
                if(!like) return false;
                return true;
            } catch (e) {
                console.log(e);
                return false;
            }
        },
        getTotalLikesPublication: async (_, {idPublicacion}, ctx) => {
            if (!ctx) {
                throw new Error('No tienen permiso para realizar esta operacion :D')
            }
            // verificar si el id es valido
            if(!isValidObjectId(idPublicacion)){
                throw new Error('el ID seleccionado no existe');
            }

            try {
                // calcular la cantidad de like con idPublicacion
                const totalLikes = await Like.countDocuments({idPublicacion});
                return totalLikes;
            } catch (e) {
                console.log(e);
                throw new Error('Internal Server Error');
            }
        },
        getPublicacionesFollowers: async (_, {}, ctx) => {
            const follows = await Follow.find({idUser: ctx.user.id});
            // const follows = await Follow.find({idUser: ctx.user.id}).populate("follow");
            if (!follows) {
                throw new Error('No se púdo obtener las publicaciones')
            }
            if(follows.length === 0) {
                return [];
            }
            let publicaciones = [];
            try {
                for await(const follow of follows) {
                    const id = follow.follow;
                    const publicacionesUser = await Publicacion.find().where({idUser: id}).sort({createAt: -1}).populate("idUser").limit(5);
                    publicaciones = [...publicaciones, ...publicacionesUser];
                }
                // for await (const follow of follows) {
                //     publicaciones = [...publicaciones, follow.follow];
                // }
                // console.log(publicaciones);

                const resultado = publicaciones.sort((a, b) => {
                    if (new Date(a.createAt) > new Date(b.createAt)) return -1;
                    if (new Date(a.createAt) < new Date(b.createAt)) return 1;
                    return 0;
                });
                // console.log(resultado);
                return resultado;
            } catch (e) {
                console.log(e);
                throw new Error('Error en el servidor, No se pudieron obtener las publicaciones');
            }
        },
        getNotFollowers: async (_, {}, ctx) => {
            try {
                const users = await Usuario.find().limit(50);
                
                let usuariosQueNoSigo = [];

                for await(const user of users) {
                    const usuarioQueSigo = await Follow.findOne({idUser: ctx.user.id}).where('follow').equals(user._id);
                    if (!usuarioQueSigo) {
                        if (String(user._id) !== String(ctx.user.id)) {
                            usuariosQueNoSigo = [...usuariosQueNoSigo, user];
                        }
                    }
                }

                return usuariosQueNoSigo;
                // console.log(user);
            } catch (e) {
                console.log(e);
                throw new Error('Error en el servidor');
            }
            return null;
        }
    },
    Mutation: {
        registro: async (_, {input}) => {
            //    revizar si el usuario existe
            const { username, email, password} = input;
            const usuarioExiste = await Usuario.findOne({email});
            if (usuarioExiste) {
                throw new Error('El correo ya esta registrado');
            }   
            const usernameExiste = await Usuario.findOne({username});
            if (usernameExiste) {
                
                throw new Error('El Nombre de Usuario ya esta registrado');
            }   
            try {
                // hasheando el password
                const salt = bcrypt.genSaltSync(10);
                input.password = bcrypt.hashSync(password, salt);
                // console.log(input);
                // si no existe crear el usuario
                const usuario = new Usuario(input);
                // guardar usuario en la bse de datos
                // console.log(usuario);
                await usuario.save();
                return usuario;

            } catch (e) {
                console.log(e);
            }
        },
        login: async (_, {input}) => {
            const {email, password} = input;
            // verificar si el usuario existe
            const usuario = await Usuario.findOne({email});
            // console.log(usuario);
            if (!usuario) {
                throw new Error('El correo no esta registrado');
            }   
            // revizar si el password es correcto
            const passwordCorrecto = await bcrypt.compare(password, usuario.password); 
            if (!passwordCorrecto) {
                throw new Error('El Email o password es incorrecto');
            }
            // return 'Login correcto'
            return {
                token:  crearToken(usuario, process.env.SECRETA, '7d')
            }
        },
        actualizarAvatar: async (_, {file}, ctx) => {
            if (!ctx) {
                throw new Error('No tienen Permiso para realizar esta operación')
            }
            try {
                const result = await uploadImage(file, ctx.user.id, 'avatar');
                await Usuario.findByIdAndUpdate(ctx.user.id, {avatar: result});
                return {
                    status: true,
                    urlAvatar: result,
                }
            } catch (error) {
                return {
                    status: false,
                    urlAvatar: null,
                }
            }
        },
        eliminarAvatar: async (_, {}, ctx) => {
            if (!ctx) {
                throw new Error('No tienen Permiso para realizar esta operación')
            }
            const {id} = ctx.user;
            // verificar si el id es valido
            if(!isValidObjectId(id)){
                throw new Error('el ID seleccionado no existe'); 
            } 
            try {
                await Usuario.findByIdAndUpdate(id, {avatar: 'https://ui-avatars.com/api/?background=random'});
                return true;
            } catch (e) {
                console.log(e);
                return false;
            }
        },
        updateUser: async (_, {input}, ctx) => {
            const {id} = ctx.user;
            // verificar si el id es valido
            if(!isValidObjectId(id)){
                throw new Error('el ID seleccionado no existe');
            } 
        
            // verificar si el usuario existe
            const usuario = await Usuario.findById(id);
            if (!usuario) {
                throw new Error('El usuario no existe');
            }

            try {
                if(input.currentPassword&&input.newPassword) {
                    // verificar que el currentpassword sea correcto
                    // bcrypt.compare devuelve un booleano
                    const passwordCorrecto = await bcrypt.compare(input.currentPassword, usuario.password);
                    if (!passwordCorrecto) {
                        throw new Error('La contraseña es incorrecta');
                    }
                    const salt = await bcrypt.genSalt(10);
                    const newPassword = await bcrypt.hash(input.newPassword, salt);
                    // actualizar el usuario en la base de datos
                    await Usuario.findByIdAndUpdate(id, {password: newPassword});
                    return true;
                } else {
                    await Usuario.findByIdAndUpdate(id, input);
                    return true;
                }
                // hasheando el password
                // return usuario;
            } catch (e) {
                console.log(e);
                return false
            }
        },
        follow: async (_, {username}, ctx) => {
            // verificar si el usuario existe
            const usuario = await Usuario.findOne({username});
            // console.log(usuario);
            if (!usuario) {
                throw new Error('El usuario no existe');
            }
            if(ctx.user.id === usuario._id.toString()){
                throw new Error('No puede seguirte a ti mismo');
            }
            try {
                const follow = new Follow({
                    idUser: ctx.user.id, //usuario que sigue
                    follow: usuario.id, //usuario seguido
                })

                await follow.save();
                return true;
            } catch (e) {
                console.log(e);
                // throw new Error('Error en el servidor');
                return false;
            }
        },
        unFollow: async (_, {username}, ctx) => {
             // verificar si el usuario existe
             const usuario = await Usuario.findOne({username});
             // console.log(usuario);
             if (!usuario) {
                 throw new Error('El usuario no existe');
             }
            //  unfollow a si mismo
             if(ctx.user.id === usuario._id.toString()){
                throw new Error('No puedes hacer unfollow a ti mismo');
            }
            //  verificar si se esta siguiendo al usuario
            try {
                const follow = await Follow.deleteOne({idUser: ctx.user.id}).where("follow").equals(usuario._id);
                if (follow.deletedCount > 0) {
                    return true;
                } 
                return false;
            } catch (e) {
                console.log(e);
                throw new Error('Internal Server Error');
            }
        },
        publicacion: async (_, {file}, ctx) => {
            if (!ctx) {
                throw new Error('No tienen Permiso para realizar esta operación')
            }
            // console.log(file.type);
            // const {mimetype} = await file.file;
            // console.log(mimetype);
            try {
                const result = await uploadImage(file.file, ctx.user.id, 'publicaciones');
                const publicacion = new Publicacion({idUser: ctx.user.id, file: result, typeFile: file.type});
                // console.log(publicacion);
               
                await publicacion.save();

                return {
                    status: true,
                    urlFile: result,
                }
            } catch (error) {
                return {
                    status: false,
                    urlFile: null,
                }
            }
        },
        agregarComentario: async (_, {input}, ctx) => {
            const {idPublicacion, comentario} = input;
            // verificar si el id es valido
            if(!isValidObjectId(idPublicacion)){
                throw new Error('el ID seleccionado no existe');
            } 
            // verificar si la publicacion existe
            const publicacion = await Publicacion.findOne({_id: idPublicacion});
            // console.log(publicacion);
            if (!publicacion) {
                throw new Error('La publicación no existe');
            }
            try {
                const nuevoComentario = new Comentario({idPublicacion, idUser: ctx.user.id, comentario});
                // console.log(nuevoComentario);
                const comentarioCreado = await nuevoComentario.save();
                return comentarioCreado;
            } catch (e) {
                console.log(e);
                throw new Error('Internal Server Error');
            }
        },
        addLike: async (_, {idPublicacion}, ctx) => {
            // console.log(idPublicacion);
            // verificar si el id es valido
            if(!isValidObjectId(idPublicacion)){
                throw new Error('el ID seleccionado no existe');
            }
            // verificar si la publiacion existe  
            const publicacion = await Publicacion.findById(idPublicacion);
            
            if(!publicacion) {
                throw new Error('la publicacion seleccionada no existe');
            }
            //TODO: Evitar que el usuario de mas de 1 like
            // const existeLike = Like.findOne({idUser: ctx.user.id});
            // if(existeLike) {
            //     throw new Error('Ya dio like a esta publicación :D');
            // }
            //TODO: EVitar que el usuario de like a su porpia publicacion
            
            try {
                // creando el like
                const like = new Like({idPublicacion, idUser: ctx.user.id});
                // console.log(like);
                const newLike = await like.save();
                return true;
            } catch (e) {
                console.log(e);
                return false
            }
        },
        disLike: async (_, {idPublicacion}, ctx) => {
            // verificar si el id es valido
            if(!isValidObjectId(idPublicacion)){
                throw new Error('el ID seleccionado no existe');
            }
            // verificar si la publiacion existe  
            const publicacion = await Publicacion.findById(idPublicacion);
            
            if(!publicacion) {
                throw new Error('la publicacion seleccionada no existe');
            }
            // verificar si el like existe
            // const like = await Like.find()
            // eliminar el like de la base de datos
            try {
                const result = await Like.findOneAndDelete({idPublicacion}).where({idUser: ctx.user.id});
                if (result < 0) throw new Error('no puede dar mas dislikes'); 
                return true
            } catch (e) {
                console.log(e);
                return false
            }
        },
        }
    }

export default resolvers;