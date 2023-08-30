import { userModel } from "../dao/managers/db/models/users.js";
import { generateJWToken } from "../utils.js";
import { validPass } from ".././utils.js";
import { cartService } from "../dao/managers/factory.js";
import { createHash } from ".././utils.js";
import UserDTO from "../dao/dto/user.dto.js";
import { userServices } from "../dao/repository/index.js";
// import CustomError from "../errors/CustomError.js";
import {
  generateDuplicateErrorInfo,
  generateLogInErrorInfo,
  generateUserErrorInfo,
} from "../errors/messages/userCreationError.message.js";
import EErrors from "../errors/enums.js";

// LOG IN //

export const logIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userServices.find(email);

    if (!user) {
      req.logger.warning(`User search failed @ ${req.method} ${req.url}`);

      // CustomError.createError({
      //   name: "user logging error",
      //   cause: generateLogInErrorInfo(),
      //   message: "User does not exist.",
      //   code: EErrors.NOT_FOUND,
      // });

    }
    if (!validPass(user, password)) {
      req.logger.warning(
        `User credentials were incorrect @ ${req.method} ${req.url}`
      );
    
      // CustomError.createError({
      //   name: "user logging error",
      //   cause: generateUserErrorInfo(),
      //   message: "Credentials are incorrect.",
      //   code: EErrors.INVALID_TYPES_ERROR,
      // });
      }

    // UPDATE DE LAST CONNECTION //
    let last_connection = new Date();
    await userServices.updateUser(
      { _id: user._id },
      { last_connection: last_connection.toDateString() }
    );

    const tokenUser = {
      name: `${user.first_name}`,
      email: email,
      age: `${user.age}`,
      role: `${user.role}`,
    };
    const accessToken = generateJWToken(tokenUser);

    // CON COOKIES
    res.cookie("jwtCookieToken", accessToken, {
      maxAge: 86400000,
      httpOnly: true,
    });
    // CREA CART EN LOGIN
    let cart = await cartService.findByUser(user._id);

    if (!cart) {
      let result = await cartService.save({ user: user._id });
    }
    cart = await cartService.findByUser(user._id);
    res
      .status(201)
      .send({ message: "successful login", user: tokenUser, cart: cart });
  } catch(error) {
    req.logger.fatal(`Server error @ ${req.method}${req.url} with message: ${error.message}`);
    res.status(error.code).send({status: "error", message: error.message})
  }
};

// SIGN UP FOR A NEW USER //

export const signUp = async (req, res) => {
  try {
    const { first_name, last_name, email, age, password } = req.body;
  let pfp = req.file;
  let user;


  if (!password || !email) {
    req.logger.warning(
      `User credentials were insufficient @ ${req.method} ${req.url}`
    );

  //   CustomError.createError({
  //     name: "User Creation Error",
  //     cause: generateUserErrorInfo({ first_name, last_name, age, email }),
  //     message: "There was an error during user creation.",
  //     code: EErrors.INVALID_TYPES_ERROR
  // });
  }

  const exists = await userServices.find(email);
  if (exists) {
    req.logger.warning(`user already exists @ ${req.method} ${req.url}`);

    // CustomError.createError({
    //   name: "user creation error",
    //   cause: generateDuplicateErrorInfo(),
    //   message: "User already exists.",
    //   code: EErrors.INVALID_TYPES_ERROR,
    // });
  }

  if (pfp) {
    user = {
      first_name,
      last_name,
      email,
      age,
      pfp: pfp.filename,
      password: createHash(password),
    };
  } else {
    user = {
      first_name,
      last_name,
      email,
      age,
      password: createHash(password),
    };
  }
  const result = await userServices.create(user);

  res.status(201).send({status: "success", payload: result});

  } catch (error) {
    req.logger.fatal(`Server error @ ${req.method}${req.url} with message: ${error.message}`);
    res.status(error.code).send({status: "error", message: error.message})
  }
}

// CURRENT
export const current = async (req, res) => {
  let result = await userServices.censor(req.user.email);
  const user = await userServices.find(req.user.email);

  let cart = await cartService.findByUser(user._id);
  res.status(201).send({status: "success", user: result, uid: user._id, cid: cart._id})
};


// LOG IN THROUGH GITHUB //

export const githubLogin = async (req, res) => {
  const token = generateJWToken(req.session.user)
   // CON COOKIES
   res.cookie("jwtCookieToken", token, {
      maxAge: 86400000,
      httpOnly: false,
    });
    
    res.status(201).send({status: "success", token: token });
}

// GITHUB CALLBACK //

export const githubCallback = async(req,res)=> {
  req.session.user = req.user;
  const token = generateJWToken(req.session.user)
   // CON COOKIES
   res.cookie("jwtCookieToken", token, {
      maxAge: 86400000,
      httpOnly: false,
    });

    // UPDATE DE LAST CONNECTION // 
    let last_connection = new Date(); 
    
    await userServices.updateUser({_id: req.session.user._id}, { last_connection: last_connection.toDateString()}); 

  res.status(201).redirect(`http://localhost:3000/home`)
}

// LOG OUT //
export const logOut = async (req, res) => {
 try {
  const user = await userServices.find(req.user.email)

  // UPDATE DE LAST CONNECTION // 
  let last_connection = new Date();
  await userServices.updateUser({_id: user._id}, { last_connection: last_connection.toDateString()}); 
res.status(201).clearCookie("jwtCookieToken").send({status: "success", message: "User has successfully logged out."});

 } catch (error) {
  req.logger.fatal(`Server error @ ${req.method}${req.url} `);
res.status(500).send({status: "error", message:"Something went wrong on our end."})
 }
}