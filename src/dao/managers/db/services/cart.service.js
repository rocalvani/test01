import { cartModel } from "../models/carts.js";

export default class cartService {
  constructor() {
    console.log("Working courses with Database persistence in mongodb");
  }

  static async getAll() {
    let carts = await cartModel.find();
    return carts.map((el) => el.toObject());
  }

  static async save(el) {
    let result = await cartModel.create(el);
    return result;
  }

  static async find(el) {
    let result = await cartModel.findById(el);
    return result;
  }

  static async findByUser(el) {
    let result = await cartModel.findOne({user: el})
    return result
  }

  static async update(id, cart) {
    let result = await cartModel.updateOne(
      {
        _id: id,
      },
      {
        $set: {
          products: cart,
        },
      }
    );
    return result;
  }

  static async updateCart(cid, pid, data) {
    let result = await cartModel.updateOne(
      {
        _id: cid,
      },
      {
        $set: {
          "products.$[element].quantity": data,
        },
      },
      { arrayFilters: [{ "element._id": pid }] }
    );

    return result;
  }

  static async fill(cid) {
    let result = await cartModel.updateOne(
      {
        _id: cid,
      },
      {
        $set: { products: [
          {product: '64443d1ad78c001136218eb2'},
          {product: '64443d1ad78c001136218eb6'},
          {product: '64443d1ad78c001136218eb9'},
        ] },
      }
    );
    return result;
  }
  
  static async addToCart(cid, pid) {
    let result= await cartModel.updateOne({
      _id: cid,
    }, {
      $push: {products: {product: pid}}
    });
    return result
  }

  static async deleteProduct(cid, pid){

    let result = await cartModel.findByIdAndUpdate(cid, {
      $pull: {
        products: {_id: pid}
      }
    })
    return result
  }

  static async populated(id) {
    let result = await cartModel
    .findOne({ _id: id })
    .populate("products.product")
    .populate("user");
return result;
  }
}
