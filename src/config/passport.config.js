import passport from "passport";
import passportLocal from "passport-local";
import GitHubStrategy from "passport-github2";
import { userModel } from "../dao/managers/db/models/users.js";
import { createHash, validPass } from ".././utils.js";
import jwtStrategy from "passport-jwt";
import { PRIVATE_KEY } from ".././utils.js";
import config from "./config.js";
import { cartService } from "../dao/managers/factory.js";
import { cartServices } from "../dao/repository/index.js";

const localStrategy = passportLocal.Strategy;

// const initializePassport = () => {
//   // ESTRATEGIA DE REGISTRO
//   passport.use(
//     "register",
//     new localStrategy(
//       { passReqToCallback: true, usernameField: "email" },
//       async (req, username, password, done) => {
//         const { name, last, email, age } = req.body;

//         try {
//           const exists = await userModel.findOne({ email });
//           if (exists) {
//             return null, false;
//           }
//           const user = {
//             name,
//             last,
//             email,
//             age,
//             password: createHash(password),
//           };
//           const result = await userModel.create(user);
//           return done(null, result);
//         } catch (error) {
//           return done("error en el registro" + error);
//         }
//       }
//     )
//   );

//   // ESTRATEGIA DE LOGIN
//   passport.use(
//     "login",
//     new localStrategy(
//       { passReqToCallback: true, usernameField: "email" },
//       async (req, username, password, done) => {
//         const { name, last, email, age } = req.body;
//         try {
//           const user = await userModel.findOne({ email: username });
//           if (!user) {
//             return done(null, false);
//           }
//           if (!validPass(user, password)) {
//             return null, false;
//           }
//           return done(null, user);
//         } catch (error) {
//           return done(error);
//         }
//       }
//     )
//   );

//   // ESTRATEGIA CON GITHUB
//   passport.use(
//     "github",
//     new GitHubStrategy(
//       {
//         clientID: "Iv1.a2b00d7b1dff7660",
//         clientSecret: "5a65a0c15e8541443ab6c1dc3542560ae6bb696e",
//         callbackUrl: "http://localhost:8080/api/sessions/githubcallback",
//       },
//       async (accessToken, refreshToken, profile, done) => {
//         try {
//           let user = await userModel.findOne({ email: profile._json.email });
//           if (!user) {
//             let newUser = {
//               name: profile._json.name,
//               last: "",
//               age: 18,
//               email: profile._json.email,
//               password: "",
//             };
//             let result = await userModel.create(newUser);
//             done(null, result);
//           } else {
//             done(null, user);
//           }
//         } catch (error) {
//           return done(error);
//         }
//       }
//     )
//   );

//   // SERIALIZACIÓN Y DESERIALIZACIÓN

//   passport.serializeUser((user, done) => {
//     done(null, user._id);
//   });

//   passport.deserializeUser(async (id, done) => {
//     try {
//       let user = await userModel.findById(id);
//       done(null, user);
//     } catch (error) {
//       console.error("error de deserialización" + error);
//     }
//   });
// };

const JwtStrategy = jwtStrategy.Strategy;
const ExtractJWT = jwtStrategy.ExtractJwt;

const initializePassport = () => {
  passport.use(
    "github",
    new GitHubStrategy(
      {
        clientID: "Iv1.a2b00d7b1dff7660",
        clientSecret: "5a65a0c15e8541443ab6c1dc3542560ae6bb696e",
        callbackUrl:`http://localhost:${config.port}/api/sessions/githubcallback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await userModel.findOne({ email: profile._json.email });
  
          if (!user) {
            let newUser = {
              first_name: profile._json.name,
              last_name: "",
              age: 0,
              email: profile._json.email,
              password: "",
              role: "user"
            };
            let result = await userModel.create(newUser);
            let found = await userModel.findOne({ email: profile._json.email });

            let cart = await cartServices.save({ user: found._id });
            done(null, result);
          } else {
            let cart = await cartServices.save({ user: user._id });
            done(null, user);
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.use(
    "register",
    new localStrategy(
      { passReqToCallback: true, usernameField: "email" },
      async (req, username, password, done) => {
        const { name, last, email, age } = req.body;

        try {
          const exists = await userModel.findOne({ email });
          if (exists) {
            return null, false;
          }
          const user = {
            name,
            last,
            email,
            age,
            password: createHash(password),
          };
          const result = await userModel.create(user);
          return done(null, result);
        } catch (error) {
          return done("error en el registro" + error);
        }
      }
    )
  );

  //Estrategia de obtener Token JWT por Cookie:
  passport.use(
    'jwt',
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
        secretOrKey: PRIVATE_KEY,
      },
      async (jwt_payload, done) => {
        try {
          return done(null, jwt_payload.user);
        } catch (error) {
          console.error(error);
          return done(error);
        }
      }
    )
  );

  passport.use(
    'expiration',
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJWT.fromExtractors([expirationExtractor]),
        secretOrKey: PRIVATE_KEY,
      },
      async (jwt_payload, done) => {
        try {
          return done(null, jwt_payload.recoveryToken);
        } catch (error) {
          console.error(error);
          return done(error);
        }
      }
    )
  );

  //Funciones de Serializacion y Desserializacion
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      let user = await userModel.findById(id);
      done(null, user);
    } catch (error) {
      console.error("Error deserializando el usuario: " + error);
    }
  });
};

const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies["jwtCookieToken"];
  }
  return token;
};

const expirationExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies["recoveryToken"];
  }
  return token;
};

export default initializePassport;
