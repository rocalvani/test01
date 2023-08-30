import { userService } from "../dao/managers/factory.js";
import { productModel } from "../dao/managers/db/models/products.js";
import { productServices, userServices } from "../dao/repository/index.js";
import { generateOwnerError, generateProductErrorInfo } from "../errors/messages/productCreationErrorInfo.message.js";
import EErrors from "../errors/enums.js";
import CustomError from "../errors/CustomError.js";
import { generateServerError } from "../errors/messages/serverError.message.js";
import f from "session-file-store";
import { mailOptions, transporter } from "../mailing.js";
import __dirname from "../utils.js";

// ---------- GET ALL PRODUCTS ---------- //

export const getProducts = async (req, res) => {
  try {
    let products = await productServices.get();
    res.status(201).send(products);
  } catch (error) {
    res.status(500).status({status: "error", message: "Something went wrong on our end."});
  }
};

// ---------- GET ALL PRODUCTS AND PAGINATE ---------- //

export const paginateProducts = async (req, res) => {
  try {
    let { limit, page, category, sort } = req.query;
    limit == undefined || limit == "null" ? (limit = 15) : (limit = limit);
    page == undefined || page == "null" ? (page = 1) : (page = page);
    sort == undefined || sort == "null" ? (sort = 1) : (sort = -1);


    let user = await userService.find(req.user.email);
    console.log("llega acá")

    if (category === "" || category === "null") {
      let products = await productModel.paginate(
        {},
        { limit: limit, sort: { price: sort }, page: page, lean: true }
      );

      // DEFINE LINKS FOR PREVIOUS AND NEXT PAGES //
      products.prevLink = products.hasPrevPage
        ? `/shop?page=${products.prevPage}`
        : "";
      products.nextLink = products.hasNextPage
        ? `/shop?page=${products.nextPage}`
        : "";
      products.isValid = !(page <= 0 || page > products.totalPages);

      // SET USER FOR RENDER OBJECT //
      user ? (products.logged = true) : (products.logged = false);
      products.user = user.first_name;
      products.sort = sort;
      products.category = category;
      res.status(201).send(products);
    } else {
      let products = await productModel.paginate(
        { category: category },
        { limit: limit, sort: { price: sort }, page: page, lean: true }
      );


      // DEFINE LINKS FOR PREVIOUS AND NEXT PAGES //
      products.prevLink = products.hasPrevPage
        ? `/shop?page=${products.prevPage}`
        : "";
      products.nextLink = products.hasNextPage
        ? `/shop?page=${products.nextPage}`
        : "";
      products.isValid = !(page <= 0 || page > products.totalPages);

      // SET USER FOR RENDER OBJECT //
      user ? (products.logged = true) : (products.logged = false);
      products.user = user.first_name;
      products.sort = sort;
      products.category = category;

      
      res.status(201).send(products);
    }
  } catch (error) {

    req.logger.fatal(`Server error @ ${req.method}${req.url} `);
    res.status(error.code).send({status: "error", message: "Paginated products could not be retrieved."})
  }
};

// ---------- GET ALL PRODUCTS BY OWNER ---------- //

export const getOwner = async (req, res) => {
  try {
    let user = await userServices.find(req.user.email);
    let products;

    if (user.role === "admin") {
      products = await productServices.get();
    } else {
      products = await productServices.findBy({ owner: user._id });
    }

    res.status(201).send(products);
  } catch (error) {
    req.logger.fatal(`Server error @ ${req.method}${req.url}`);
    res.status(error.code).send({status: "error", message: "Products could not be retrieved from the database"})
  }
};

// ---------- GET PRODUCTS BY TAG ---------- //

export const getProductsByTag = async (req, res) => {
  try {
    let products = await productServices.findBy({ "tags.tag": req.params.tag });
    res.status(201).send({ products: products });
  } catch (error) {
    req.logger.fatal(`Server error @ ${req.method}${req.url}`);
    res.status(error.code).send({status: "error", message: "Products could not be retrieved from the database."})
  }
};

// ---------- GET A SINGLE PRODUCT BY ID ---------- //

export const getProduct = async (req, res) => {
  try {
    const product = await productServices.find(req.params.pid);

    if (!product) {
      req.logger.warning(`Product search failed @ ${req.method} ${req.url}`);

      CustomError.createError({
        name: "product search error",
        cause: generateProductErrorInfo(),
        message: "This product couldn't be found",
        code: EErrors.NOT_FOUND,
      });
    }
    res.status(201).send(product);
  } catch (error) {
    req.logger.fatal(`Server error @ ${req.method}${req.url} with message: ${error.message}`);
    res.status(error.code).send({status: "error", message: error.message})
  }
};

// ---------- CREATE A PRODUCT ------------ //

export const createProduct = async (req, res) => {
  try {
    const { title, description, price, code, stock, status, category,tags} =
      req.body;

    if (
      !title ||
      !description ||
      !price ||
      !code ||
      !status ||
      !category ||
      req.files.length === 0
    ) {
      req.logger.warning(
        `Product creation failed @ ${req.method} ${req.url} due to missing information`
      );

      CustomError.createError({
        name: "Product creation error",
        cause: generateProductErrorInfo(),
        message: "Product could not be created.",
        code: EErrors.INVALID_TYPES_ERROR,
      });
    }

    const codeProduct = await productServices.findBy({code: code})

    if (codeProduct == 1) {
      req.logger.warning(
        `Product creation failed @ ${req.method} ${req.url} due to duplicate code.`
      );

      CustomError.createError({
        name: "user creation error",
        cause: generateProductErrorInfo(req.user),
        message: "User could not be created.",
        code: EErrors.INVALID_TYPES_ERROR,
      });

    }

    const user = await userServices.find(req.user.email);

    if (!user) {
      req.logger.warning(
        `Product creation failed @ ${req.method} ${req.url} due to missing user.`
      );

      CustomError.createError({
        name: "user creation error",
        cause: generateProductErrorInfo(),
        message: "User could not be created.",
        code: EErrors.INVALID_TYPES_ERROR,
      });

    }

    // THUMBNAIL ARRAY SETTING //
    let thumbnails = [];
    req.files.forEach((el) => {
      thumbnails.push({ img: el.filename });
    });

    // TAGS ARRAY SETTING //
    let tagsArr = tags.split(",")
    let tagObj = []

    tagsArr.map((el) => tagObj.push({tag: el})) 

    // PRODUCT OBJECT CREATION //

    const product = {
      title: title,
      description: description,
      price: price,
      thumbnail: thumbnails,
      code: code,
      stock: stock,
      status: status,
      owner: user._id,
      category: category,
      tags: tagObj
    };

    let result = await productServices.save(product);
    res.status(201).send({status: "success", msg: "product has been successfully created."});
  } catch (error) {

    req.logger.fatal(`Server error @ ${req.method}${req.url} with message: ${error.message}`);
    res.status(error.code).send({status: "error", message: error.message})
  }
};

// ---------- MODIFY A PRODUCT ---------- //

export const updateProduct = async (req, res) => {
  // REQ.BODY FOR STATUS, TAGS, IMG, STOCK, PRICE //
  try {
    let id = { _id: req.params.pid };
    let { price, stock, status, tags } = req.body;
    let thumbnails = req.files;

    let tagsArr = tags.split(",")
    let tagObj = []

    tagsArr.map((el) => tagObj.push({tag: el})) 

    let data;

    if (tagObj.length != 0) {
     data = {
        price: price,
        stock: stock,
        thumbnail: thumbnails,
        status: status,
        tags: tagObj
      };
    } else {
      data = {
        price: price,
        stock: stock,
        thumbnail: thumbnails,
        status: status
      };
    }

    Object.keys(data).forEach((k) => data[k] == "" && delete data[k]);

    let result = await productServices.updateProduct(id, data);
    if (!result) {
      req.logger.warning(`Product search failed @ ${req.method} ${req.url}`);

      CustomError.createError({
        name: "product search error",
        cause: generateProductErrorInfo(),
        message: "This product couldn't be found",
        code: EErrors.NOT_FOUND,
      });    }
    res.status(201).send({status: "success", message: "Product has successfully been created."});
  } catch (error) {
    req.logger.fatal(`Server error @ ${req.method}${req.url} with message: ${error.message}`);
    res.status(error.code).send({status: "error", message: error.message})
  }
};

// ---------- DELETE A PRODUCT ---------- //

export const deleteProduct = async (req, res) => {
  try {
    let product = await productServices.populated(req.params.pid);
    let result = await productServices.find(req.params.pid);

    // EVALUATE EXISTENCE OF PRODUCT //
    if (!product) {
      req.logger.warning(`Product deletion failed @ ${req.method} ${req.url}`);

      CustomError.createError({
        name: "product search error",
        cause: generateProductErrorInfo(),
        message: "This product couldn't be found",
        code: EErrors.NOT_FOUND,
      });
    }

    if (req.user.role == "admin") {
      // ALLOW ALL ADMINS TO DELETE //
      await productServices.delete(result);

      // EMAIL OWNER ABOUT THE DELETION // 
      let options = mailOptions(
        `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Factura de compra</title>
          </head>
          <body>
            <center>
              <table width="750">
                <tr>
                  <td width="750" colspan="3">
                    <img src="cid:header" alt="" style="width: 750px; height: 250px" />
                  </td>
                </tr>
                <tr width="750" colspan="3" height="50">
                  <td></td>
                </tr>
                <tr>
                  <td width="50"></td>
                  <td width="650" style="text-align: center; font-family: Arial, Helvetica, sans-serif; font-size: 15pt;">
        
                    <p>Recientemente tuvimos que eliminar uno de tus productos. Si querés saber más información al respecto, te recomendamos contactes a un administrador del sitio. Muchas gracias.</p>
        
                  </td>
                  <td width="50"></td>
                </tr>
                <tr width="750" colspan="3" height="50">
                  <td></td>
                </tr>
                <tr>
                  <td width="750" colspan="3">
                    <img src="" alt="cid:footer" style="width: 750px; height: 50px" />
                  </td>
                </tr>
              </table>
            </center>
          </body>
        </html>`,
        "Aviso por eliminación de producto",
        product.owner.email,
        [
          {filename: 'header.png', path: __dirname+'/../frontend/public/img/header.png' , cid: 'header'},
          {filename: 'footer.png', path: __dirname+'/../frontend/public/img/footer.png' , cid: 'footer'}]);
      transporter.sendMail(options, (error, info) => {
        if (error) {
          req.logger.fatal(`Server error @ ${req.method} ${req.url}`);

          CustomError.createError({
            name: "Server error",
            cause: generateServerError(),
            message: "Something went wrong on server end.",
            code: EErrors.DATABASE_ERROR,
          });
        }
      });

      res.status(201).send({
        status: "success",
        msg: "this product has been successfully deleted",
      });
    } else if (req.user.role == "premium") {
      // ALLOW PREMIUM USERS TO ONLY DELETE THEIR OWN PRODUCTS //
      if (product.owner.email != req.user.email) {
        req.logger.warning(`Product search failed @ ${req.method} ${req.url}`);

        CustomError.createError({
          name: "product search error",
          cause: generateOwnerError(),
          message: "This product couldn't be found",
          code: EErrors.NOT_FOUND,
        });
      } else {
        await productServices.delete(result);
        res.status(201).send({
          status: "success",
          msg: "this product has been successfully deleted",
        });
      }
    } else {
      res.status(400).send({status: "error",message:"you require admin credentials to do this."});
    }
  } catch (error) {
    req.logger.fatal(`Server error @ ${req.method}${req.url} with message: ${error.message}`);
    res.status(error.code).send({status: "error", message: error.message})
  }
};
