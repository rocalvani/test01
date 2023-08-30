import {productModel} from "../models/products.js"

export default class productService {
    constructor() { 
        console.log("Working courses with Database persistence in mongodb");
    }

    static async get() {
        let products = await productModel.find();
        return products.map(el=>el.toObject());
    }
    
   static async save(el) {
        let result = await productModel.create(el);
        return result;
    }

    static async find(el){
        let result = await productModel.findById(el)
        return result;
    }

    static async delete(el) {
        let del = await productModel.deleteOne(el._id);
        return del
    }

    static async findByName(name){
        const result = await productModel.findOne({title: name});
        return result;
    };

static async findBy(data){
    const result = await productModel.find(data);
    return result;
}

    static async updateProduct(id, data){
        let result = await productModel.findOneAndUpdate(id, data)
          return result;

    }

    static async populated(id) {
        let result = await productModel
        .findOne({ _id: id })
        .populate("owner");

        console.log(result)
    return result;
      }

      static async addComment(pid, data) {
        let result= await productModel.updateOne({
          _id: pid,
        }, {
          $push: {comments: {comment: data}}
        });
        return result
      }

       static async deleteComment(pid, id){

    let result = await productModel.findByIdAndUpdate(pid, {
      $pull: {
        comments: {_id: id}
      }
    })
    return result
  }
}