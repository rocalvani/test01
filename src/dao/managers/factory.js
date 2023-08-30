import config from "../../config/config.js";
import MDBSingleton from "../../config/MDBSingleton.js";

let productService;
let ticketService;
let userService;
let cartService;
let messageService;

switch (config.persistence) {
  case "mongodb":
    const mongo = async () => {
      try {
        await MDBSingleton.getInstance();
      } catch (error) {
        console.error(error);
        process.exit(0);
      }
    };
    mongo();
    const { default: productServiceMongo } = await import(
      "./db/services/product.service.js"
    );
    productService = productServiceMongo;

    const { default: ticketServiceMongo } = await import(
      "./db/services/ticket.service.js"
    );
    ticketService = ticketServiceMongo;

    const { default: userServiceMongo } = await import(
      "./db/services/user.service.js"
    );
    userService = userServiceMongo;

    const {default: messageServiceMongo} = await import (
      "./db/services/message.service.js"
    )
    messageService = messageServiceMongo

    const {default: cartServiceMongo} = await import(
      "./db/services/cart.service.js"
    )
    cartService = cartServiceMongo

    break;
  case "file":
    const { default: productServiceFile } = await import(
      "./filesystem/ProductManager.js"
    );
    productService = productServiceFile;

    const {default: cartServiceFile} = await import("./filesystem/CartManager.js")
    cartService = cartServiceFile
    break;
  default:
    break;
}

export { productService, ticketService, userService, cartService, messageService };
