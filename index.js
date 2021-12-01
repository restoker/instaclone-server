require('dotenv').config();
import { ApolloServer } from 'apollo-server-express';
import express from 'express'
// import {connect} from 'mongoose';
import resolvers from './gql/resolver';
import typeDefs from './gql/schema';
import jwt from 'jsonwebtoken'
import {graphqlUploadExpress} from 'graphql-upload'

require('colors');

import conectarDB from './db/config';

!async function() {
    await conectarDB();

    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: ({req}) => {
            const token = req?.headers?.authorization.split(' ')[1];
                if(token) {
                    try {
                        const user = jwt.verify(token, process.env.SECRETA);
                        // console.log(user);
                        return {user};
                    } catch (e) {
                        console.log(e);
                        console.log('Los permisos fueron revocados');
                        throw new Error('Token invalido');
                    }
                }
            },
        });
    await server.start();

    const app = express();
    app.use(graphqlUploadExpress())
    server.applyMiddleware({app});

    await new Promise((r) => app.listen({port: process.env.PORT || 4000}, r)) 

    console.log(`Server running in: http://localhost:4000${server.graphqlPath}`);
}()

