import { userModel } from "../models/users.js";

export default class userService {
  constructor() {
    console.log("user service working with mongodb.");
  }

  static async getAll() {
    let result = await userModel.find();
    return result.map((el) => el.toObject());
  }

  static async find(el) {
    let result = await userModel.findOne({ email: el });
    return result;
  }

  static async findByID(el) {
    let result = await userModel.findById(el);
    return result;
  }

  static async create(el) {
    let result = await userModel.create(el);
    return result;
  }

  static async update(id, data) {
    let result = await userModel.findOneAndUpdate(id, data);
    return result;
  }

  static async upgrade(id, data) {
    let result = await userModel.updateOne(
      {
        _id: id,
      },
      {
        $set: {
          role: data,
        },
      }
    );
    return result;
  }

  static async addDocs(id, data) {
    let result = await userModel.updateOne(
      {
        _id: id,
      },
      {
        $push: { documents: { document: data } },
      }
    );
    return result;
  }

  static async delete(id) {
    let result = await userModel.deleteOne(id);
    return result;
  }

  static async populated(el) {
    let result = await userModel
    .findOne({ email: el })
    .populate("wishlist.product");
    return result;
  }

  static async wishlist(user, pid) {
    let result= await userModel.updateOne({
      email: user,
    }, {
      $push: {wishlist: {product: pid}}
    });
    return result
  }

  static async wishlistDel(user, pid) {
    let result= await userModel.updateOne({
      email: user,
    }, {
      $pull: {
        wishlist: {product: pid}
      }
    });
    return result
  }
}
