require('dotenv').config({path: '.env'});
// https://stackoverflow.com/questions/27753411/how-do-i-delete-an-object-on-aws-s3-using-javascript
const AWS = require('aws-sdk');


const ID = process.env.AWS_ID;
const secret = process.env.AWS_SECRETA;
const bucketName = process.env.AWS_BUCKET_NAME;

// login a AWS
AWS.config.update({
    credentials: {
        accessKeyId: ID,
        secretAccessKey: secret,
    }
})


export const uploadImage = async (file, userId, carpeta) => {
    const {filename, createReadStream, mimetype} = await file;
    const readStream = createReadStream();
    // const extension = mimetype.split("/")[1];
    const objectName = `${carpeta}/${userId}-${filename}`;
    try {
        const response = await new AWS.S3().upload({
            Bucket: bucketName,
            Key: objectName,
            ACL: 'public-read',
            Body: readStream, //file
        })
        .promise();
        return response.Location;
    } catch (e) {
        console.log(e);
        throw new Error('No se pudo agregar la imagen');
    }
}