//asyncHandler.js
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}

export { asyncHandler }

/* USING ASYNC HANDLER TO WRAP ASYNC CONTROLLERS TO CATCH ERRORS
const asyncHandler = (fn) => async (req,res,next) => {
    try{ 
        await fn(req,res,next)

    } catch(err){
        res.status(err.code || 500).json({
            sucess:false,
            message:err.message || "Internal Server Error"
        })
    }
}
    */