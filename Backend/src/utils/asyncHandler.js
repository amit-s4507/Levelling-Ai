 const asyncHandler = (requestHandler) => {

    return (req,res,next) => {
        Promise.resolve(requestHandler(req,res,next)).catch((err) => next(err))
    }
 }


export {asyncHandler}



// Knowledge for Higher Order Function 

// const asyncHandler = () => {}
// const asyncHandler = (func) => () => {}
// const asyncHandler = (func) => async () => {}

/*

    //       METHOD - 1

const asyncHandler = (fn) => async (req, res, next) => {

    try {
        await fn(req, res, next)
    } catch (error) {
       res.status(error.code || 500).json({
        success : false,
        message : error.message
       })
    }
}    


*/