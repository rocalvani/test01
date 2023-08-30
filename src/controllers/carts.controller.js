import nodemailer from "nodemailer";
import config from "../config/config.js";
import { v4 as uuidv4 } from 'uuid';
import { ticketService} from "../dao/managers/factory.js";
import { cartServices, productServices } from "../dao/repository/index.js";
import CustomError from "../errors/CustomError.js";
import { productService } from "../dao/managers/factory.js";
import EErrors from "../errors/enums.js";
import { generateServerError } from "../errors/messages/serverError.message.js";
import PaymentService from '../dao/payment.service.js'
import { generateCartError, generateOwnerError } from "../errors/messages/cartManagementError.js";
import __dirname from "../utils.js";
import { transporter } from "../mailing.js";

// ----------   FIND ONE CART ---------- //
export const getCart = async (req, res) => {
  try {
    let cart = await cartServices.populated(req.params.cid)

    if(cart){

        res.status(201).send({ status: "success", id: cart._id, products: cart.products })
      } else {
        req.logger.warning(`cart search failed @ ${req.method} ${req.url}`);

      CustomError.createError({
        name: "cart search error",
        cause: generateCartError(),
        message: "This cart couldn't be found",
        code: EErrors.NOT_FOUND,
      });
      }
  } catch (error) {

    req.logger.fatal(`Server error @ ${req.method}${req.url} with message: ${error.message}`);
    res.status(error.code).send({status: "error", message: error.message})
  }
};

// ---------- ADD PRODUCT TO CART ---------- //

export const addProductToCart = async (req, res) => {
  try {
    let cart = await cartServices.find(req.params.cid)
    let productIN = cart.products.find((el) => el.product == req.params.pid)
    let product = await productServices.populated(req.params.pid)

    // EVALUATE THAT OWNER AND CART RECEIPIENT ARE NOT THE SAME //
    if (req.user.email != product.owner.email){
      if (productIN) {
        let code = productIN._id
        let result = await cartServices.updateCart(req.params.cid, code, productIN.quantity +1);}
        else {
          let result = await cartServices.addProduct(req.params.cid, req.params.pid) 
        }
      let cart = await cartServices.find(req.params.cid);
       res.status(201).send({status: "success", cart:cart});
    } else {
      req.logger.warning(`cart search failed @ ${req.method} ${req.url}`);

      CustomError.createError({
        name: "Product to cart error",
        cause: generateOwnerError(),
        message: "This product cannot be added to the cart.",
        code: EErrors.INVALID_TYPES_ERROR,
      });
    }


  } catch (error) {
    req.logger.fatal(`Server error @ ${req.method}${req.url} with message: ${error.message}`);
    res.status(error.code).send({status: "error", message: error.message})
  }
}

// ---------- DELETE PRODUCT FROM CART ---------- //

export const deleteProductFromCart = async (req, res) => {
  try {
    let result = await cartServices.deleteProduct(req.params.cid, req.params.pid)
    let cart = await cartServices.populated(req.params.cid)
    res.status(201).send({status: "success", cart: cart,msg: "product deleted from this cart.", result: result});
  } catch(error) {
    req.logger.fatal(`Server error @ ${req.method}${req.url}`);
    res.status(error.code).send({status: "error", message: "Product deletion failed on server end."})
  }
}

// ---------- EMPTY CART ---------- //

export const emptyCart = async (req,res) => {
  try {
    await cartServices.update(req.params.cid, []);
    res.status(201).send({status: "success", msg: "this cart was emptied."});
  }
  catch(error){   
    req.logger.fatal(`Server error @ ${req.method}${req.url} `);
  res.status(error.code).send({status: "error", message: "Cart emptying failed on server end."})}
}

// ---------- MODIFY QUANTITY OF A PRODUCT IN CART ---------- //
export const addMoreOf = async (req, res) => {
  try {
    let cart = await cartServices.find(req.params.cid)
    let product = cart.products.find((el) => el._id == req.params.pid)
    let code = product._id


    if (product) {
      let result = await cartServices.updateCart(req.params.cid, code, req.body.quantity);
      cart = await cartServices.find(req.params.cid)
      res.status(201).send({status: "success", cart: cart})
    } else {
      req.logger.warning(`cart search failed @ ${req.method} ${req.url}`);

      CustomError.createError({
        name: "Product in cart search error",
        cause: generateCartError(),
        message: "This product couldn't be found within the cart",
        code: EErrors.NOT_FOUND,
      });
    }
    
  } catch(error) {
    req.logger.fatal(`Server error @ ${req.method}${req.url} with message: ${error.message}`);
    res.status(error.code).send({status: "error", message: error.message})
  }
}

// ---------- AUTOFILL CART ---------- //

export const autofill = async (req,res) => {
  try {
    await cartServices.fill(req.params.cid);
    res.status(201).send({status: "success", msg: "this cart was filled."});
  }
  catch (error) {
    res.status(500).send({
      status: "error",
      message: "Could not update this cart.",
    });
  }
}


// MAILING
export const finalize = async (req, res) => {
 try {
  let cart = await cartServices.populated(req.params.cid);
  //CHEQUEO DE STOCK

  let finalCart = [];
  let amount = [];

 const promises =  cart.products.map(async (el) => {
    if (el.product.stock < el.quantity) {
      finalCart.push({ product: el.product._id, quantity: el.quantity });
    } else {
      await productServices.updateProduct(
        el.product._id,
        el.product.stock - el.quantity
      );
      amount.push(el.quantity);
    }
  });

  const promise = await Promise.all(promises)


let total = await amount.reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0
      );
     
  // SI HAY PRODUCTOS A COMPRAR
  if (total != 0) {
    // GENERA TICKET //
    let random = uuidv4();

    const found = ticketService.getTicketByCode(random);
    found ? (random = uuidv4()) : random;

    let ticket = {
      code: random,
      purchase_datetime: new Date(),
      amount: total,
      purchaser: cart.user.email,
    };

    ticketService.saveTicket(ticket);


// ACTUALIZA EL CART

await cartServices.update(req.params.cid, finalCart);

const updated = await cartServices.populated(req.params.cid);}




// MAILING

const transporter = nodemailer.createTransport({
service: "gmail",
port: 587,
auth: {
  user: config.gmailAccount,
  pass: config.gmailAppPassword,
},
});
const mailOptions = {
  from: "uwu" + config.gmailAccount,
  to: req.user.email,
  subject: "Gracias por realizar tu compra en uwu",
  html: `<!DOCTYPE html><html lang="en">
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

          <p>Primero que nada: <b>GRACIAS</b>. (｡◕‿‿◕｡)<br>
              Esperamos que disfrutes mucho tus productos cuando lleguen a vos!!</p>
<p>Tu compra tiene el siguiente código:</p>
<p><span style="background-color: pink; padding: 10pt;"><b>${req.params.code}</b></span> </p>
<p><br>Es importante que lo guardes ya que para retirar los productos, o al llegar nuestro envío a la dirección de entrega, se corroborará que tu código sea el indicado para evitar errores.</p>
<p>Además, te dejamos adjunta la factura indicada a tu compra.</p>
<p>Ojalá tengas un muy buen día y sigas brillando con nosotros!!</p>
<p>✧ &#9825; ✧</p>

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
</html>`,
attachments: [
{filename: 'header.png', path: __dirname+'/../frontend/public/img/header.png' , cid: 'header'},
{filename: 'footer.png', path: __dirname+'/../frontend/public/img/footer.png' , cid: 'footer'}],
};

let result = transporter.sendMail(mailOptions, (error, info) => {

  if (error) {
    req.logger.fatal(`Server error @ ${req.method} ${req.url}` )
    
    CustomError.createError({
      name: "Server error",
      cause: generateServerError(),
      message: "Something went wrong on server end.",
      code: EErrors.DATABASE_ERROR
    })
  }
  res.status(201).send({status: "success", options:mailOptions });
});
 } catch (error) {
  req.logger.fatal(`Server error @ ${req.method}${req.url} with message: ${error.message}`);
  res.status(error.code).send({status: "error", message: error.message})
 }
};
