require('dotenv').config();
import { ApolloServer } from 'apollo-server';
// import {connect} from 'mongoose';
import resolvers from './gql/resolver';
import typeDefs from './gql/schema';
import jwt from 'jsonwebtoken'
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

    server.listen({port: process.env.PORT || 4000}).then(({url}) => {
        console.log(`Servidor trabajando en: ${url}`.cyan);
    });

}()

