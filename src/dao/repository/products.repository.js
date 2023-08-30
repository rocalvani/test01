export default class productRepository {
    constructor(dao) {
        this.dao = dao
    }

    get = async () =>{
        let result = await this.dao.get();
        return result;
    }

    find = async(id) =>{
        let result = await this.dao.find(id);
        return result
    }
    
    findBy = async (data) => {
        let result = await this.dao.findBy(data);
        return result
    }

    save = async(body) =>{
        let result = await this.dao.save(body);
        return result;
    }

    updateProduct = async(a, b) =>{
        let result = await this.dao.updateProduct(a,b)
        return result;
    }

    delete = async(el) =>{
        let result = await this.dao.delete(el);
        return result;
    }

    addComment = async (pid, data) => {
        let result = await this.dao.addComment(pid, data);
        return result;
    }

    deleteComment = async (pid, id) => {
        let result = await this.dao.deleteComment(pid, id);
        return result;
    }

    populated = async (id)=>{
        let result = this.dao.populated(id)
        return result;
      }
}