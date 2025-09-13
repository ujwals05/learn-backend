import e from "express";
const app = e();

import cookieParser from "cookie-parser";
import cors from "cors";


//Middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  }),
);

app.use(e.json({ limit: "16 kb" }));
app.use(e.urlencoded({ limit: "16 kb" }));
app.use(e.static("public"))
app.use(cookieParser())

//router importing
import router from "./routers/user.router.js";
//router declearation
app.use("/api/v1/users",router)

export default app;
