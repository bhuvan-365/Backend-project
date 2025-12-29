// const asyncHandler = ()=>{

// }

export {asyncHandler}

const asyncHandler = (fn) => async (req,res,next) => {

    try{ 

    } catch(err){
     
        res.status(err.code || 500).json({
            sucess:false,
            message:err.message || "Internal Server Error"
        })

    }
}