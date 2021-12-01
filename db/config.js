import {connect} from 'mongoose';
// import {config} from 'dotenv'
// config();

const conectarDB = async _ => {
    try {
        await connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        });
        console.log('Conectado a la base de datos'.blue);
    } catch (e) {
        console.log(e);
        process.exit(1);
    }
}


export default conectarDB;