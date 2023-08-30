import { messageModel } from "../models/messages.js";

export default class messageService {
  constructor() {}

  static async save(message) {
    let result = await messageModel.create(message);
    return result;
  }

  static async getAll() {
    let messages = await messageModel.find();
    return messages.map((el) => el.toObject());
  }
}
