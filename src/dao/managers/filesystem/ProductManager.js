import fs from 'fs'
const files = "./files";
const file = files + "/products.json";


let products = [];

class ProductManager {
  constructor(title, description, price, thumbnail, code, stock, status, category) {
    this.nameFile = file;
    this.title = title;
    this.description = description;
    this.price = price;
    this.thumbnail = thumbnail;
    this.code = code;
    this.stock = stock;
    this.status = status;
    this.category = category;
    this.id;
  }

  async save() {
    if (!fs.existsSync(files)){await fs.promises.mkdir(files, { recursive: true });
    await fs.promises.writeFile(file, JSON.stringify(products));}
        const productsNew = await ProductManager.getProducts();
      productsNew.push(this);
        this.id = productsNew.length;
        await fs.promises.writeFile(file, JSON.stringify(productsNew));
      
    
      
      
  }

  static async get() {
    
      if (fs.existsSync(file)){
        let string = await fs.promises.readFile(file, "utf-8");
      let content = await JSON.parse(string);
      return content
      } else {
        return products
      }
    
  }

  static async find(id) {
    let string = await fs.promises.readFile(file, "utf-8");
    let content = JSON.parse(string);
    let found = content.find((el) => el.id == id);
    if (found) {
      return found
    } else {
      return false
    }
  }

  static async updateProduct(id, change, desc) {
    let string = await fs.promises.readFile(file, "utf-8");
    let content = JSON.parse(string);
    let found = content.find((el) => el.id == id);
    if (found) {
      if (change == "id") {
        console.log("ID's cannot be modified.");
      } else {
        found[change] = desc;
        products = content.filter((el) => el.id != id);
        products.push(found);
        await fs.promises.writeFile(file, JSON.stringify(products));
      }
    } else {
      console.log("Product cannot be updated, as it does not exist.");
    }
  }

  static async delete(id) {
    let string = await fs.promises.readFile(file, "utf-8");
    let content = JSON.parse(string);
    let found = content.find((el) => el.id == id);
    if (found) {
      let filter = content.filter((el) => el.id != id);
      products = filter;
      await fs.promises.writeFile(file, JSON.stringify(products));
    } else {
      return false
    }
  }

}

export default ProductManager