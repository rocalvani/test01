import { subscriptionModel } from "../models/subscription.js";

export default class subService {
    constructor() {
        console.log("sub service working with mongodb.")
    }

    static async save(el) { 
        let result = await subscriptionModel.create(el);
        return result;
    }

    static async find(email) {
        let result = await subscriptionModel.findOne({email: email})
        return result;
    }

   
}