import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import passport from "passport";
import initializePassport from "./config/passport.config.js";

import usersRouter from './routes/users.router.js';
import petsRouter from './routes/pets.router.js';
import adoptionsRouter from './routes/adoption.router.js';
import sessionsRouter from './routes/sessions.router.js';

import productsRouter from "./routes/products.routes.js"
import productsViewsRouter from './routes/products.views.router.js'


const app = express();
const PORT = process.env.PORT||9090;
const connection = mongoose.connect(process.env.MONGO_URL)

app.use(express.json());

// PASSPORT 
initializePassport()
app.use(passport.initialize())
app.use(passport.session())

// COOKIE PARSER
app.use(cookieParser('jwtCookieToken'))

app.use('/api/users',usersRouter);
app.use('/api/pets',petsRouter);
app.use('/api/adoptions',adoptionsRouter);
app.use('/api/sessions',sessionsRouter);
app.use('/api/products', productsRouter)
app.use("/shop", productsViewsRouter)

app.listen(PORT,()=>console.log(`Listening on ${PORT}`))
