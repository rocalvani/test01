import { productServices, userServices } from "../dao/repository/index.js";

// POST NEW COMMENT //
export const newComment = async (req,res) => {
    try {
        let completeUser = await userServices.find(req.user.email)
        const user = req.user
        const {comment, rating} = req.body
        let date = new Date();


        const data = {user: {name: user.name, email: user.email, id: completeUser._id}, comment: comment, rating: rating, posted: date.toLocaleDateString()}

        let result = await productServices.addComment(req.params.pid, data)

        res.status(201).send({status: "success", msg: "Comment was successfully posted."})
    } catch (error) {
        req.logger.fatal(`Server error @ ${req.method} ${req.url}`)
    }
}

// DELETE OWN COMMENT //
export const deleteComment = async (req,res) => {
    try {
        let product = await productServices.find(req.params.pid)
        let comment = product.comments.find((el) => el._id == req.params.id)
        if (comment.comment.user.email != req.user.email) {
            res.status(401).send({status: "error", msg: "This comment is not yours. It can't be deleted."})
        }
        let result = await productServices.deleteComment(req.params.pid, req.params.id)
        res.status(201).send({status: "success", msg: "Comment was successfully deleted."})
    } catch (error) {
        req.logger.fatal(`Server error @ ${req.method} ${req.url}`)
    }
}