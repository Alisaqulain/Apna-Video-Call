import express  from "express";
import {createServer}from "node:http"
import {Server} from "socket.io"
import mongoose from "mongoose"
import cors from   "cors"
import {connectToSocket} from "./controllers/socketManger.js"
import userRoutes from "./routes/user.routes.js"

const app= express()    
const server=createServer(app);  
const io=connectToSocket(server)
app.set("port",(process.env.PORT || 9000))
app.use(cors());

app.use(express.json({limit: "50kb"}))
app.use(express.urlencoded({limit: "50kb",extended: true}   ))    
app.use("/api/v1/users",userRoutes)

const start=async () => {
    app.set("mongo_user")
    const connectionDb  =await mongoose.connect("mongodb+srv://zaidiali087:iVdh7uAzwlffwLKM@cluster0.f6osx.mongodb.net/")
    app.get("*",(req,res)=>{
        res.send("Page not found")
    }) 
server.listen(app.get('port'),()=>{
    console.log(`Server is running on port ${app.get('port')}`);
})
}
start();