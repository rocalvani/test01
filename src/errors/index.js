import EErrors from './enums.js'

export default (error, req,res, next) => {
    
    switch(error.code) {
        case EErrors.INVALID_TYPES_ERROR:
            res.status(400).send({status: "Error", error: error.name})
            break;
            case EErrors.ROUTING_ERROR:
                res.status(501).send({status: "Error", error:error.name })
           break;
           case EErrors.DATABASE_ERROR:
                res.status(500).send({status: "Error", error:error.name })
           break;
           case EErrors.NOT_FOUND:
                res.status(404).send({status: "Error", error:error.name })
           break;
                default:
                res.status(500).send({status: "error", error: "unhandled error on server end"})
                break;
    }

}