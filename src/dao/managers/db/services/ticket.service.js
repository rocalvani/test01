import { ticketModel } from "../models/ticket.js";

export default class ticketService {
    constructor() {
        console.log("ticket service working with mongodb.")
    }

    static async saveTicket(el) {
        let result = await ticketModel.create(el);
        return result;
    }

    static async getTicketByCode(code) {
        let result = await ticketModel.findOne({code: code})
        return result;
    }

    static async getTicketByEmail(email) {
        let result = await ticketModel.find({purchaser: email})
        return result;
    }
}