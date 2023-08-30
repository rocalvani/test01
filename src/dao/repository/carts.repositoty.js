export default class cartRepository {
    constructor(dao) {
        this.dao = dao;
      }

      save = async(el) =>{
        let result = this.dao.save(el)
        return result;
      }

      find = async(id) =>{
        let result = this.dao.find(id)
        return result;
      }

      populated = async (id)=>{
        let result = this.dao.populated(id)
        return result;
      }
      
      addProduct = async(a,b) => {
        let result = this.dao.addToCart(a, b);
        return result;
      }

      update = async(a,b) => {
        let result = this.dao.update(a, b);
        return result;
      }

      deleteProduct = async(a,b) =>{
        let result = this.dao.deleteProduct(a ,b)
        return result;
      }

      updateCart = async(a, b, c,) =>{
        let result = this.dao.updateCart(a, b, c,)
        return result;
      }

      fill = async(id) =>{
        let result = this.dao.fill(id);
        return result;
      }
}