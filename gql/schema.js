import {gql} from 'apollo-server'

const typeDefs = gql`

    type User {
        id: ID
        nombre: String
        username: String
        email: String
        avatar: String
        siteweb: String
        descripcion: String
        createAt: String
    }

    type Token {
        token: String
    }

    type UpdateAvatar {
        status: Boolean
        urlAvatar: String
    }

    type Publicacion {
        status: Boolean
        urlFile: String
    }
    
    type Publication {
        id: ID
        idUser: ID
        file: String
        typeFile: String
        createAt: String
    }

    type Comentario {
        id: ID
        idPublicacion: String
        idUser: User
        comentario: String
        createAt: String
    }

    type FeedPublication {
        id: ID
        idUser: User
        file: String
        typeFile: String
        createAt: String
    }

    input UserInput {
        nombre: String!
        username: String!
        email: String!
        password: String!
    }

    input LoginInput {
        email: String!
        password: String!
    }

    input ComentarioInput {
        idPublicacion: ID!
        comentario: String!
    }

    input UpdateUserInput {
        nombre: String
        username: String
        email: String
        currentPassword: String
        newPassword: String
        siteweb: String
        descripcion: String
    }

    type Query {
        #user
        getUser(id: ID, username: String): User
        search(search: String): [User]
        
        #follow
        isFollow(username: String!): Boolean
        getFollowers(username: String!): [User]
        getFollowings(username: String!): [User]
        getNotFollowers: [User]

        #publicaciones
        getPublications(username: String!): [Publication]
        getPublicacionesFollowers: [FeedPublication]

        #comentarios
        getComentarios(id: ID!): [Comentario]

        #likes
        getLikePublicacion(idPublicacion: ID!): Boolean
        getTotalLikesPublication(idPublicacion: ID!): Int
    }

    type Mutation {
        #usuario
        registro(input: UserInput): User
        login(input: LoginInput): Token
        actualizarAvatar(file: Upload): UpdateAvatar
        eliminarAvatar: Boolean
        updateUser(input: UpdateUserInput): Boolean

        #follow
        follow(username: String!): Boolean
        unFollow(username: String!): Boolean 

        #publicaciones
        publicacion(file: Upload): Publicacion

        #comentarios
        agregarComentario(input: ComentarioInput): Comentario

        #likes
        addLike(idPublicacion: ID!): Boolean
        disLike(idPublicacion: ID!): Boolean
    }
`;


export default typeDefs;