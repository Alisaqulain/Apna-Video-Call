import {Server} from "socket.io"
let connections={}
let messgaes={}
let timeOnline={}
export const connectToSocket = (server)=>{
    const io=new Server(server,{
        cors:{
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true   
        }
    })
    io.on("connection",(socket)=>{
        console.log("someone join ")
    socket.on("join-call",(path)=>{
        if(connections[path]===undefined){
            connections[path]=[]
        }
        connections[path].push(socket.id)
        timeOnline[socket.id] = new Date();

        for(let a=0;a<connections[path].length;a++){
        io.to(connections[path][a]).emit("user-joined",socket.id,connections[path])
        }
        if(messgaes[path]!==undefined){
        
            for(let a=0;a<messgaes[path].length;a++){
                io.to(socket.id).emit("chat-message",messgaes[path][a]['data']
                   ,messgaes[path][a]['sender'],messgaes[path][a]['socket-id-sender'])
            }
        }
    })
    socket.on("signal",(toId,messgaes)=>{
    io.to(toId).emit("signal",socket.id,messgaes)
    });
    socket.on("chat-message",(data,sender)=>{
        const [matchingRoom,found]=Object.entries(connections)
    .reduce(([matchingRoom,isFound],[roomKey,roomValue])=>{
        if(!isFound && roomValue.includes(socket.id)){ return [roomKey,true]}
        return [room,isFound]
       
    },['',false])
    if(found===true){ 
        if(messgaes[matchingRoom]===undefined){ 
            messgaes[matchingRoom]=[]
        }
        messgaes[matchingRoom].push({"sender":sender,"data":data,"socket-id-sender":socket.id})
        console.log("message",matchingRoom,":",sender,data)
        connections[matchingRoom].forEach((elem) => {
            io.to(elem).emit("chat-message",data,sender,socket.id)
        })
    }
    })
    socket.on("disconnect",()=>{
        var diffTime = Math.abs(timeOnline[socket.id]-new Date());
        var key
        for(const [k,v]of JSON.parse(JSON.stringify(Object.entries(connections)))){
            for(let a=0;a<v.length;a++){
                if(v[a]==socket.id){
                key=k
                for(let a=0;a<connections[key].length;a++){
                io.to(connections[key][a]).emit("user-left",socket.id)
            }
            var index=connections[key].indexOf(socket.id)
            connections[key].splice(index,1)
            if(connections[key].length===0){
                delete connections[key]
            }
            }
            }
        }
    });
    })
}