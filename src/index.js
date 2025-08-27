import dotenv from 'dotenv';
import connectDB from './db/index.js';
import app from './app.js';

dotenv.config({
  path : './.env'
})

connectDB()
.then(()=>{
  const server = app.listen(process.env.PORT, () => {
    console.log(`The server is running at port ${process.env.PORT}`);
  });
  server.on('error',(err)=>{
    console.log("Error in server",err)
  })
})
.catch((error)=>{
  console.log("There is a error occured",error)
})