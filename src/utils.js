import {fileURLToPath} from 'url'
import { dirname } from 'path'
import jwt from 'jsonwebtoken'
import passport from 'passport'
import bcrypt from "bcrypt"
import { faker } from '@faker-js/faker'

import multer from "multer"

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// MULTER //

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        if(file.fieldname === "thumbnail") {
            cb(null,`${__dirname}/../frontend/public/img/products`)
        } else if (file.fieldname === "pfp") {
            cb(null,`${__dirname}/../frontend/public/img/profiles`)
        } else { 
            cb(null,`${__dirname}/../frontend/public/files`)
        }
    },
    filename:function(req,file,cb){
        cb(null,`${Date.now()}-${file.originalname}`)
    }
})

export const upload = multer({storage})


// CREACIÓN DE HASH
export const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10))


// VALIDACIÓN DE USUARIO
export const validPass = (user, password) => {
    return bcrypt.compareSync(password, user.password)
}

// IMPLEMENTACIÓN JWT
export const PRIVATE_KEY = "secretJWT"

export const generateJWToken = (user)=>{
    return jwt.sign({user}, PRIVATE_KEY, {expiresIn: '24h'});
}

export const authToken = (req, res, next) => {
    const authHeader = req.headers.Authorization;

    if(!authHeader){
        return res.status(401).send({error: "User not authenticated or missing token."});
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, PRIVATE_KEY, (error, credentials)=>{
        if (error) return res.status(403).send({error: "Token invalid, Unauthorized!"});
        req.user = credentials.user;
        next();
    })
}

export const passportCall = (strategy) => {
    return async (req, res, next) => {
        passport.authenticate(strategy, function (err, user, info) {
            if (err) return next(err);
            if (!user) {
                return res.status(401).send({error: info.messages?info.messages:info.toString()});
            }
            req.user = user;
            next();
        })(req, res, next);
    }
};


export const authorization = (role) => {
    return async (req, res, next) => {
        if (!req.user) return res.status(401).send("Unauthorized: User not found in JWT"); 
        if (req.user.role !== role) {
            return res.status(403).send("Forbidden: El usuario no tiene permisos con este rol."); 
        } else {
        next();}
    }
};

export const deny = (role) => {
    return async (req, res, next) => {
        if (!req.user) return res.status(401).send("Unauthorized: User not found in JWT"); 
        if (req.user.role === role) {
            return res.status(403).send("Forbidden: El usuario no tiene permisos con este rol."); 
        } else {
        next();}
    }
};

// EXPIRATION DATE FOR RECOVERY TOKEN
export const expirationJWT = (recoveryToken) => {
    return jwt.sign({recoveryToken}, PRIVATE_KEY, {expiresIn: '1h'})
}

export const expirationCall = (strategy) => {
    return async (req, res, next) => {
        passport.authenticate(strategy, function (err, token, info) {
            if (err) return next(err);
            if (!token) {
                return res.render("expired")            }
            req.token = token;
            next();
        })(req, res, next);
    }
};

// FAKER

export const generateProduct = () =>{
    return {
        title: faker.commerce.productName(),
        price: faker.commerce.price(),
        stock: faker.string.numeric(),
        id: faker.database.mongodbObjectId(),
        image: faker.image.url()

    }
}

export default __dirname