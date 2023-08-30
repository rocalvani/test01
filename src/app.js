import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import passport from "passport";
import initializePassport from "./config/passport.config.js";
import MongoStore from "connect-mongo";
import session from 'express-session'
import { Server, Socket } from "socket.io";




// import usersRouter from './routes/users.router.js';
// import petsRouter from './routes/pets.router.js';
// import adoptionsRouter from './routes/adoption.router.js';
// import sessionsRouter from './routes/sessions.router.js';

import viewRouter from "./routes/views.routes.js"
import productsRouter from "./routes/products.routes.js"
import cartsRouter from "./routes/cart.routes.js"
import usersRouter from "./routes/user.routes.js"
import usersViewRouter from './routes/users.views.router.js';
import sessionsRouter from "./routes/sessions.routes.js"
import githubLoginRouter from "./routes/githubLogin.views.router.js"
import jwtRouter from './routes/jwt.router.js'
import productsViewsRouter from './routes/products.views.router.js'
import cartViewsRouter from './routes/cart.views.router.js'
import commmentRouter from './routes/comment.routes.js'
import wishlistRouter from './routes/wishlist.routes.js'
import paymentRouter from './routes/payments.routes.js'


const app = express();
const PORT = process.env.PORT||9090;
// 
// const connection = mongoose.connect('mongodb+srv://admin:rocio1@cluster0.facejpa.mongodb.net/Ecommerce')
// process.env.MONGO_URL
app.use(express.json());
app.use(session({
    store: MongoStore.create({
      mongoUrl: 'mongodb+srv://admin:rocio1@cluster0.facejpa.mongodb.net/Ecommerce',
      mongoOptions: {useNewUrlParser: true, useUnifiedTopology: true},
      ttl: 60
    }),
    secret: "secret",
    resave: false,
    saveUninitialized: true
  }))

// PASSPORT 
initializePassport()
app.use(passport.initialize())
app.use(passport.session())

// COOKIE PARSER
app.use(cookieParser('jwtCookieToken'))

// app.use('/api/users',usersRouter);
// // app.use('/api/pets',petsRouter);
// app.use('/api/adoptions',adoptionsRouter);
// app.use('/api/sessions',sessionsRouter);

// ROUTER
app.use('/api/products', productsRouter)
app.use('/api/carts', cartsRouter)
app.use('/api/users', usersRouter)
app.use('/api/sessions',sessionsRouter);
app.use('/github', githubLoginRouter);
app.use("/api/jwt", jwtRouter);
app.use("/api/comment", commmentRouter)
app.use("/api/wishlist", wishlistRouter)
app.use('/api/payments', paymentRouter)

// ROUTER VIEWS
app.use('/', viewRouter)
app.use('/users',usersViewRouter);
app.use("/shop", productsViewsRouter)
app.use("/checkout", cartViewsRouter)

app.listen(PORT,()=>console.log(`Listening on ${PORT}`))


// SOCKET 

export const socketServer = new Server(httpServer)

socketServer.on('connection', socket => {
socket.on("message", async data => {
  let result = await messageService.save(data)
  let chat = await messageService.getAll()
  socketServer.emit("messages", chat)
})
})