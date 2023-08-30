import UserDTO from "../dto/user.dto.js";

export default class userRepository {
  constructor(dao) {
    this.dao = dao;
  }

  getAll = async () => {
    let result = this.dao.getAll();
    return result;
  };

  find = async (el) => {
    let result = this.dao.find(el);
    return result;
  };

  findByID = async (el) => {
    let result = this.dao.findByID(el);
    return result;
  };

  create = async (el) => {
    let result = this.dao.create(el);
    return result;
  };

  updateUser = async (id, data) => {
    let result = this.dao.update(id, data);
    return result;
  };

  censor = async (el) => {
    let result = await this.dao.find(el);
    let dto = new UserDTO(result);
    return dto;
  };

  censorMany = async (arr) => {
    let result = [];

    await arr.forEach((el) => {
      let dto = new UserDTO(el);
      result.push(dto);
    });
    return result;
  };

  delete = async (id) => {
    let result = await this.dao.delete(id)
    return result
  }

  upgrade = async (id, data) => {
    let result = this.dao.upgrade(id, data);
    return result;
  };

  addDocs = async (id, data) => {
    let result = this.dao.addDocs(id, data);
    return result;
  };

  wishlist = async (email, pid) => {
    let result = this.dao.wishlist(email, pid)
    return result
  }

  wishlistDel = async (email, pid) => {
    let result = this.dao.wishlistDel(email, pid)
    return result
  }

  populated = async (id) => {
    let result = this.dao.populated(id)
    return result
  }
}
