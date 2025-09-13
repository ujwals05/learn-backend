export const registerUser = async (req,res,next) => {
  try {
     res.status(200).json({
      message:'OK'
    })
  } catch (error) {
    console.log("ERROR OCCURES : ",error),
    res.status(500).json({
      message:"INTERNAL SERVER ERROR"
    })
  }
}