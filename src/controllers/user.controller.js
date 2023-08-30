import { userServices } from "../dao/repository/index.js";
import __dirname, { createHash, expirationJWT, validPass } from "../utils.js";
import { mailOptions, transporter } from "../mailing.js";
import { v4 as uuidv4 } from 'uuid';
import config from "../config/config.js";
import nodemailer from "nodemailer";
import { ticketService } from "../dao/managers/factory.js";
import { generateUserErrorInfo } from "../errors/messages/userCreationError.message.js";
// import CustomError from "../errors/CustomError.js";
import EErrors from "../errors/enums.js";



// GET USERS DTO //
export const getUserDTO = async (req, res) => { 
    try { 
      let result = await userServices.getAll();
      let censored = await userServices.censorMany(result);
      res.send(censored);
    } catch (error) {
      req.logger.fatal(`Server error @ ${req.method} ${req.url}`);
      res.status(500).send({status: "error", message: "Something went wrong on our end."});
    }
  }

  // GET SINGLE USER DTO //
  export const getDTO =async (req, res) => {
   try { 
    let find = await userServices.findByID(req.params.uid);
    let user = await userServices.censor(find.email);
    let tickets = await ticketService.getTicketByEmail(find.email);
    res.status(201).send({ status: "success", user: user, role: req.user.role, tickets: tickets });
  
   } catch (error) {
    req.logger.fatal(`Server error @ ${req.method} ${req.url}`);
    res.status(500).send({status: "error", message: "Something went wrong on our end."});

   }}

// DELETE ALL INACTIVE USERS //
export const deleteInactive = async (req, res) => {
    try {
      let users = await userServices.getAll();
      let toDelete = [];
      let ms = 1000 * 60 * 60 * 24;

      
      let lastConnection = users.forEach((el) => {
        let date = Date.now() - Date.parse(el.last_connection);
        let difference = Math.floor(date / ms);
        if (difference > 2) {
          toDelete.push(el);
        }
      });
      let result = toDelete.forEach(async (el) => {
        let options = mailOptions(`<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Factura de compra</title>
          </head>
          <body>
            <center>
              <table width="750">
                <tr>
                  <td width="750" colspan="3">
                    <img src="cid:header" alt="" style="width: 750px; height: 250px" />
                  </td>
                </tr>
                <tr width="750" colspan="3" height="50">
                  <td></td>
                </tr>
                <tr>
                  <td width="50"></td>
                  <td width="650" style="text-align: center; font-family: Arial, Helvetica, sans-serif; font-size: 15pt;">
        
                    <p>Debido a tu prolongada inactividad, tuvimos que dar de baja tu cuenta.</p>
        
                  </td>
                  <td width="50"></td>
                </tr>
                <tr width="750" colspan="3" height="50">
                  <td></td>
                </tr>
                <tr>
                  <td width="750" colspan="3">
                    <img src="" alt="cid:footer" style="width: 750px; height: 50px" />
                  </td>
                </tr>
              </table>
            </center>
          </body>
        </html>`, "Aviso por inactividad", el.email,[
          {filename: 'header.png', path: __dirname+'/../frontend/public/img/header.png' , cid: 'header'},
          {filename: 'footer.png', path: __dirname+'/../frontend/public/img/footer.png' , cid: 'footer'}],  )
        transporter.sendMail(options, (error, info) => {
            if (error) {
              req.logger.fatal(`Server error @ ${req.method} ${req.url}`);
        
              // CustomError.createError({
              //   name: "Server error",
              //   cause: generateServerError(),
              //   message: "Something went wrong on server end.",
              //   code: EErrors.DATABASE_ERROR,
              // });
            }
          });
        await userServices.delete(el._id);
      });

      res.status(201).send({
        status: "success",
        msg: "all inactive users have been cleared.",
      });
    } catch (error) {
      req.logger.fatal(`Server error @ ${req.method}${req.url}`);
      res.status(error.code).send({status: "error", message: error.message})
    }
  }

  // PREMIUM UPGRADE //
  export const premiumUpgrade = async (req, res) => {
    try {
      const user = await userServices.findByID(req.params.uid);
      const docs = user.documents;
  
      if (docs.length == 0 ) {
        req.logger.warning(
          `User documents were insufficient @ ${req.method} ${req.url}`
        );
    
      //   CustomError.createError({
      //     name: "User Creation Error",
      //     cause: generateUserErrorInfo(),
      //     message: "There was an error during upgrade.",
      //     code: EErrors.INVALID_TYPES_ERROR
      // });
      } else {
        let id = docs.find((el) => el.document.name.includes("id"));
      let address = docs.find((el) => el.document.name.includes("address"));
      let state = docs.find((el) => el.document.name.includes("state"));
  
      if (user.role === "user") {
        if (!id || !address || !state) {
          req.logger.warning(
            `User documents were insufficient @ ${req.method} ${req.url}`
          );
      
        //   CustomError.createError({
        //     name: "User Creation Error",
        //     cause: generateUserErrorInfo(),
        //     message: "There was an error during user creation.",
        //     code: EErrors.INVALID_TYPES_ERROR
        // });
        } 
      } else {
        await userServices.upgrade(user._id, "user");
        res
          .status(201)
          .send({ status: "success", msg: "user updated accordingly." });
      }
      }
    } catch (error) {
      req.logger.fatal(`Server error @ ${req.method}${req.url}`);
      res.status(error.code).send({status: "error", message: error.message})
    }
  }

  // EDIT USER //
  export const editUser = async (req, res) => {
    try {
      let id = { _id: req.params.uid };
      let { first_name, last_name, email, age, gender } = req.body;
      let pfp = req.file;
      let data;
     

      if (!first_name && !last_name && !email && !age && !gender && !req.file) {
        req.logger.warning(
          `User edit fields were insufficient @ ${req.method} ${req.url}`
        );
    
      //   CustomError.createError({
      //     name: "User edit Error",
      //     cause: generateUserErrorInfo(),
      //     message: "There was an error during user editing.",
      //     code: EErrors.INVALID_TYPES_ERROR
      // });      
      }
  
      if (pfp) {
        data = {
          first_name: first_name,
          last_name: last_name,
          email: email,
          age: age,
          gender: gender,
          pfp: pfp.filename,
        };
      } else {
        data = {
          first_name: first_name,
          last_name: last_name,
          email: email,
          age: age,
          gender: gender,
        };
      }
      Object.keys(data).forEach((k) => data[k] == "" && delete data[k]);
  
      let result = await userServices.updateUser(id, data);
      res.status(201).send({status: "success", payload: result});
    } catch (error) {
      req.logger.fatal(`Server error @ ${req.method}${req.url}`);
      res.status(error.code).send({status: "error", message: error.message})    }
  }

  // EDIT PASSWORD //
  export const editPassword = async (req, res) => {
    try {
      const { newPass, passConfirmation } = req.body;
      const id = { _id: req.params.uid };
  
      const user = await userServices.findByID(req.params.uid);
  
      if (validPass(user, req.body.newPass)) {
        req.logger.warning(
          `Password editing error @ ${req.method} ${req.url} - Password is the same as the old one.`
        );
    
      //   CustomError.createError({
      //     name: "User editing Error",
      //     cause: generateUserErrorInfo(),
      //     message: "There was an error during user editing.",
      //     code: EErrors.INVALID_TYPES_ERROR
      // });
      } else if (newPass != passConfirmation) {
            req.logger.warning(
      `Password editing error @ ${req.method} ${req.url} - Passwords do not match`
    );

  //   CustomError.createError({
  //     name: "User editing Error",
  //     cause: generateUserErrorInfo(),
  //     message: "There was an error during user editing.",
  //     code: EErrors.INVALID_TYPES_ERROR
  // });
      } else {
        const password = createHash(newPass); 
        let result = await userServices.updateUser(id, { password: password });
        res.status(201).send({status: "success", msg: "successful password change." });
      }
    } catch (error) {
      req.logger.fatal(`Server error @ ${req.method}${req.url}`);
      res.status(error.code).send({status: "error", message: error.message})    }
  }

  // UPLOAD FILES //
  export const uploadFiles = async (req, res) => {
    try {
      const uid = req.params.uid;

      let id = req.files.find((el) =>
        el.originalname.toLowerCase().startsWith("id")
      );
      let address = req.files.find((el) =>
        el.originalname.toLowerCase().startsWith("address")
      );
      let state = req.files.find((el) =>
        el.originalname.toLowerCase().startsWith("state")
      );

      if (!id && !address && !state) {
        req.logger.warning(
          `Information was insufficient @ ${req.method} ${req.url}`
        );
    
      //   CustomError.createError({
      //     name: "User editing Error",
      //     cause: generateUserErrorInfo(),
      //     message: "There was an error during user editing.",
      //     code: EErrors.INVALID_TYPES_ERROR
      // });  
        }

      if (id) {
        await userServices.addDocs(uid, {
          name: id.filename,
          reference: id.path,
        });
      }

      if (address) {
        await userServices.addDocs(uid, {
          name: address.filename,
          reference: address.path,
        });
      }

      if (state) {
        await userServices.addDocs(uid, {
          name: state.filename,
          reference: state.path,
        });
      }

      res.status(201).send({
        status: "success",
        id: id,
        address: address,
        state: state,
      });
    } catch (error) {
      req.logger.fatal(`Server error @ ${req.method}${req.url}`);
      res.status(error.code).send({status: "error", message: error.message})    }
  }
  
  // TOKEN MAILING //
export const tokenMailing = async (req, res) => {
    try {
      const { email } = req.body;
  
    let user = await userServices.find(email)
  
    if (user) { 
      const transporter = nodemailer.createTransport({
        service: "gmail",
        port: 587,
        auth: {
          user: config.gmailAccount,
          pass: config.gmailAppPassword,
        },
      });

      const recovery = uuidv4();
      const recoveryToken = expirationJWT({ token: recovery, user: email });
    
      res.cookie("recoveryToken", recoveryToken, {
        maxAge: 3600000,
        httpOnly: true,
      });
    
      const mailOptions = {
        from: "uwu" + config.gmailAccount,
        to: email,
        subject: "Reestablecimiento de contraseña",
        html: `<!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="UTF-8" />
                <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Reseteo de contraseña</title>
              </head>
              <body>
                <center>
                  <table width="750">
                    <tr>
                      <td width="750" colspan="3">
                        <img src="cid:header" alt="" style="width: 750px; height: 250px" />
                      </td>
                    </tr>
                    <tr width="750" colspan="3" height="50">
                      <td></td>
                    </tr>
                    <tr>
                      <td width="50"></td>
                      <td width="650" style="text-align: center; font-family: Arial, Helvetica, sans-serif; font-size: 15pt;">
            
                        <p>٩(⁎❛ᴗ❛⁎)۶ </p>
                        <p> Recibimos tu pedido de reseteo de contraseña y estamos acá para dejarte el link a tu salvación.</p>
            
                      </td>
                      <td width="50"></td>
                    </tr>
                    <tr>
                      <td width="750" colspan="3" height="50"></td>
                    </tr>
                    <tr>
                        <td width="750" colspan="3"><a href="http://localhost:3000/reset/'${recovery}">
                            <img src="cid:recover" alt="" style="width: 750px; height: 50px" /></a>
                        </td>
                      </tr>
                      <tr>
                        <td width="750" colspan="3" height="20"></td>
                      </tr>
                      <tr>
                        <td width="50"></td>
                        <td width="650" style="text-align: center; font-family: Arial, Helvetica, sans-serif; font-size: 15pt;">
              
                          <p>Recordá que este link es válido por una hora desde el momento de recibido este mail.</p>
                          <p>✧ &#9825; ✧</p>
                          
                        </td>
                        <td width="50"></td>
                      </tr>
                      <tr>
                        <td width="750" colspan="3" height="20"></td>
                      </tr>
                    <tr>
                      <td width="750" colspan="3">
                        <img src="cid:footer" alt="" style="width: 750px; height: 50px" />
                      </td>
                    </tr>
                  </table>
                </center>
              </body>
            </html>`,
        attachments: [
          {filename: 'header.png', path: __dirname+'/../frontend/public/img/header.png' , cid: 'header'},
          {filename: 'recover.png', path: __dirname+'/../frontend/public/img/recover.png' , cid: 'recover'},
          {filename: 'footer.png', path: __dirname+'/../frontend/public/img/footer.png' , cid: 'footer'}],
      };
    
      let result = transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          req.logger.fatal(`Server error @ ${req.method} ${req.url}`);
    
          // CustomError.createError({
          //   name: "Server error",
          //   cause: generateServerError(),
          //   message: "Something went wrong on server end.",
          //   code: EErrors.DATABASE_ERROR,
          // });
        }
      });
      res.status(201).send({status: "success", message: "Email has been sent to the user."})
    } else {
      req.logger.warning(
        `User could not be found @ ${req.method} ${req.url}`
      );
  
    //   CustomError.createError({
    //     name: "User search Error",
    //     cause: generateUserErrorInfo(),
    //     message: "There was an error during user search.",
    //     code: EErrors.NOT_FOUND
    // }); 
     }
   
     
    } catch (error) {
      req.logger.fatal(`Server error @ ${req.method}${req.url}`);
      res.status(error.code).send({status: "error", message: error.message})    }
  
    
  }

  // PASSWORD RESET //
  export const resetPass = async (req, res) => {
    try {
      const password = createHash(req.body.password);
      const user = await userServices.find(req.token.user);
      if (validPass(user, req.body.password)) {
        req.logger.warning(
          `User editing error @ ${req.method} ${req.url}`
        );
    
      //   CustomError.createError({
      //     name: "User editing Error",
      //     cause: generateUserErrorInfo(),
      //     message: "There was an error during user editing.",
      //     code: EErrors.INVALID_TYPES_ERROR
      // });
      } else {
        let result= await userServices.updateUser({_id: user._id}, { password: password }); 
        res.status(201).send({status: "success", payload: result})
      }
    } catch (error) {
      req.logger.fatal(`Server error @ ${req.method}${req.url}`);
      res.status(error.code).send({status: "error", message: error.message})    }
  }

  // ---------- GET COMMENTS FROM PRODUCT ---------- //
export const getWish = async (req,res) => {
  try {
   let result = await userServices.populated(req.user.email)
   res.status(201).send({status: "success", payload: result.wishlist})
  } catch (error)  {
    req.logger.fatal(`Server error @ ${req.method}${req.url}`);
    res.status(error.code).send({status: "error", message: "Wishlist could not be retrieved."})
  }
  }

  // ---------- ADD TO WISHLIST ---------- //
  export const wish =  async (req, res) => {
    try {
      let user = await userServices.populated(req.user.email)

    let found = user.wishlist.find((el) => el.product == req.params.pid)

    if (!found) {
        let result = await userServices.wishlist(req.user.email, req.params.pid)
        res.status(201).send({status: "success", msg: "This product was added to your wishlist."})
    } else { 
      req.logger.warning(
        `User editing error @ ${req.method} ${req.url}`
      );
  
    //   CustomError.createError({
    //     name: "User editing Error",
    //     cause: generateUserErrorInfo(),
    //     message: "There was an error during user editing.",
    //     code: EErrors.INVALID_TYPES_ERROR
    // });  
   }
    } catch (error) {
      req.logger.fatal(`Server error @ ${req.method}${req.url}`);
      res.status(error.code).send({status: "error", message: error.message})
    }

   }

   // ---------- DELETE FROM WISHLIST ---------- //
   export const deleteWish = async (req, res) => {
    try {
      let result = await userServices.wishlistDel(req.user.email, req.params.pid)
    res.status(201).send({status: "success", payload: result})
    } catch (error) {
      req.logger.fatal(`Server error @ ${req.method}${req.url}`);
      res.status(error.code).send({status: "error", message: error.message})
    }
}