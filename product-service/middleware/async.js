const asyncWrapper = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

module.exports = asyncWrapper;

// const getAllTasks = asyncWrapper(async (req, res)=>{
//     const task = await Task.find()
//     res.send("hi")
// })
