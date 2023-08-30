import productRepository from "./products.repository.js";
import { cartService, productService, userService } from "../managers/factory.js";
import userRepository from "./users.repository.js";
import cartRepository from "./carts.repositoty.js";

export const productServices = new productRepository(productService)
export const userServices = new userRepository(userService)
export const cartServices = new cartRepository(cartService)