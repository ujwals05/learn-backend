const asyncHandler = (fn) => {
  //This is in promise form
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };
};

// const syncHandler = (fn = (req, res, next) => {
//   try {
//     fn(req, res, next);
//   } catch (error) {
//     res.status(error.code || 500).json({
//       message: error.message,
//       success: false,
//     });
//   }
// });

export { asyncHandler };

//try catch with promises:
