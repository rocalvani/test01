import mongoose from "mongoose";

const subscriptionCollection = "subscriptions";

const subscriptionSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
});

export const subscriptionModel = mongoose.model(subscriptionCollection, subscriptionSchema);
