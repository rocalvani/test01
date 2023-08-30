import fs from "fs";
import __dirname from '../../.././utils.js';
const files = __dirname+'/files';
const file = files + "/carts.json";

let carts = [];

class CartManager {
  constructor(products) {
    this.products = products;
    this.id;
  }

  async save() {
    if (!fs.existsSync(files)) {
      await fs.promises.mkdir(files, { recursive: true });
      await fs.promises.writeFile(file, JSON.stringify(carts));
    }
    let string = await fs.promises.readFile(file, "utf-8");
    const carts = JSON.parse(string);
    carts.push(this);
    this.id = carts.length;
    await fs.promises.writeFile(file, JSON.stringify(carts));
  }

  static async find(id) {
    if (!fs.existsSync(files)) {
      console.log("it doesn't exist")
    }
    else {
      console.log("yes it does");
    }
    let string = await fs.promises.readFile(file, "utf-8");
    let content = JSON.parse(string);
    let found = content.find((el) => el.id == id);
    if (found) {
      return found;
    } else {
      return false;
    }
  }

  static async updateCart(id, cart) {
    let string = await fs.promises.readFile(file, "utf-8");
    let content = JSON.parse(string);
    let cartById = content.find((el) => el.id == id);
    cartById.products = cart;
    let filter = content.filter((el) => el.id != id);
    carts = filter
    carts.push(cartById)
    await fs.promises.writeFile(file, JSON.stringify(carts));
  }
}

export default CartManager;
