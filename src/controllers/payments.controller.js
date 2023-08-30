import PaymentService from "../dao/payment.service.js";
import { cartServices} from "../dao/repository/index.js";

// PAYMENT INTENT //

export const paymentIntent = async (req, res) => {
    try {
      let cart = await cartServices.populated(req.query.id);
  
      //CHEQUEO DE STOCK
  
      let finalCart = [];
      let amount = 0;
  
      let prices = [];
  
      let intentCart = []
  
      await cart.products.forEach(async (el) => {
        if (el.product.stock < el.quantity) {
          finalCart.push({ product: el.product._id });
        } else {
        
          amount = amount + el.quantity;
          await prices.push(el.quantity * el.product.price);
          await intentCart.push(el._id)
        }
      });
  
      // SI HAY PRODUCTOS A COMPRAR
  
      if (amount != 0) {
  
        // MULTIPLICAR A CENTAVOS DE DOLAR
  
        let total =
          (await prices.reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0
          )) * 100;
  
        const paymentIntentInfo = {
          amount: total,
          currency: "usd",
          metadata: {
            userId: cart.user._id,
            cart: intentCart,
          },
        };
  
        const service = new PaymentService();
        let result = await service.createPaymentIntent(paymentIntentInfo);
        res.status(201).send({ status: "success", payload: result});
      }else {
        res.status(400).send({status: "error", msg: "This cart has no products available for purchase.", productsLeft: finalCart});
      }
    } catch (error) {
      req.logger.fatal(`Server error @ ${req.method}${req.url}`);
      res.status(error.code).send({status: "error", message: "There was a third-party error."})
    }
  }